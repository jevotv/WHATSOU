import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL")!;
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY")!;
const INSTANCE_NAME = Deno.env.get("EVOLUTION_INSTANCE_NAME") || "otp_new";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

// Send WhatsApp message via Evolution API
async function sendWhatsAppMessage(phone: string, message: string) {
    try {
        const response = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`,
            {
                method: "POST",
                headers: {
                    apikey: EVOLUTION_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ number: phone, text: message }),
            }
        );

        if (!response.ok) {
            console.error("WhatsApp send error:", await response.text());
            return false;
        }
        return true;
    } catch (error) {
        console.error("WhatsApp send exception:", error);
        return false;
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const results = {
        active_to_grace: 0,
        grace_to_expired: 0,
        notifications_sent: 0,
    };

    try {
        // 1. Bulk Update: Active -> Grace
        const { data: updatedGrace } = await supabase
            .from("subscriptions")
            .update({ status: "grace" })
            .eq("status", "active")
            .lt("expires_at", now.toISOString())
            .select("id");

        results.active_to_grace = updatedGrace?.length || 0;

        // 2. Bulk Update: Grace -> Expired
        const { data: updatedExpired } = await supabase
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("status", "grace")
            .lt("grace_ends_at", now.toISOString())
            .select("id");

        results.grace_to_expired = updatedExpired?.length || 0;

        // 3. Parallel Notifications
        const notificationPromises: Promise<any>[] = [];

        // 3a. Expiring Soon (3 days)
        const threeDaysLater = new Date(now);
        threeDaysLater.setDate(threeDaysLater.getDate() + 3);
        const twoDaysLater = new Date(now);
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);

        // Fetch subscriptions that need notification
        const { data: soonExpiring } = await supabase
            .from("subscriptions")
            .select("id, user_id, expires_at, last_notified_at, users(phone)")
            .eq("status", "active")
            .gte("expires_at", twoDaysLater.toISOString()) // optimization
            .lte("expires_at", threeDaysLater.toISOString());

        if (soonExpiring) {
            for (const sub of soonExpiring) {
                // Check recent notification logic locally
                if (sub.last_notified_at) {
                    const lastNotified = new Date(sub.last_notified_at);
                    if ((now.getTime() - lastNotified.getTime()) < 24 * 60 * 60 * 1000) continue;
                }

                if (sub.users?.phone) {
                    const daysLeft = Math.ceil((new Date(sub.expires_at).getTime() - now.getTime()) / (86400000));
                    const message = `⚠️ تنبيه: اشتراكك في واتسو سينتهي خلال ${daysLeft} أيام.\n\nجدد الآن للحفاظ على متجرك:\nhttps://whatsou.com/dashboard/subscription`;

                    notificationPromises.push(
                        (async () => {
                            const sent = await sendWhatsAppMessage(sub.users.phone, message);
                            if (sent) {
                                await supabase
                                    .from("subscriptions")
                                    .update({ last_notified_at: now.toISOString() })
                                    .eq("id", sub.id);
                                results.notifications_sent++;
                            }
                        })()
                    );
                }
            }
        }

        // 3b. Just Expired (Grace Period Start)
        // We can just rely on the fact they are in 'grace' status
        // But better to check if they were just moved or check last_notified?
        // Let's just check all 'grace' users who haven't been notified in 24h
        const { data: graceUsers } = await supabase
            .from("subscriptions")
            .select("id, user_id, last_notified_at, users(phone)")
            .eq("status", "grace");

        if (graceUsers) {
            for (const sub of graceUsers) {
                if (sub.last_notified_at) {
                    const lastNotified = new Date(sub.last_notified_at);
                    if ((now.getTime() - lastNotified.getTime()) < 24 * 60 * 60 * 1000) continue;
                }

                if (sub.users?.phone) {
                    const message = `🔴 انتهى اشتراكك في واتسو!\n\nلوحة التحكم الآن في وضع القراءة فقط.\nجدد خلال 48 ساعة لتجنب توقف متجرك:\nhttps://whatsou.com/dashboard/subscription`;
                    notificationPromises.push(
                        (async () => {
                            const sent = await sendWhatsAppMessage(sub.users.phone, message);
                            if (sent) {
                                await supabase.from("subscriptions").update({ last_notified_at: now.toISOString() }).eq("id", sub.id);
                                results.notifications_sent++;
                            }
                        })()
                    );
                }
            }
        }

        // 3c. Storefront Disabling Soon
        const threeDaysBeforeDisable = new Date(now);
        threeDaysBeforeDisable.setDate(threeDaysBeforeDisable.getDate() + 3);
        const twoDaysBeforeDisable = new Date(now);
        twoDaysBeforeDisable.setDate(twoDaysBeforeDisable.getDate() + 2);

        const { data: soonDisabled } = await supabase
            .from("subscriptions")
            .select("id, user_id, storefront_paused_at, last_notified_at, users(phone)")
            .eq("status", "expired")
            // optimizing range
            .gte("storefront_paused_at", twoDaysBeforeDisable.toISOString())
            .lte("storefront_paused_at", threeDaysBeforeDisable.toISOString());

        if (soonDisabled) {
            for (const sub of soonDisabled) {
                if (sub.last_notified_at) {
                    const lastNotified = new Date(sub.last_notified_at);
                    if ((now.getTime() - lastNotified.getTime()) < 24 * 60 * 60 * 1000) continue;
                }

                if (sub.users?.phone) {
                    const daysLeft = Math.ceil((new Date(sub.storefront_paused_at).getTime() - now.getTime()) / (86400000));
                    const message = `⛔ تحذير أخير!\n\nسيتم إيقاف متجرك عن الزوار خلال ${daysLeft} أيام.\n\nجدد الآن:\nhttps://whatsou.com/dashboard/subscription`;

                    notificationPromises.push(
                        (async () => {
                            const sent = await sendWhatsAppMessage(sub.users.phone, message);
                            if (sent) {
                                await supabase.from("subscriptions").update({ last_notified_at: now.toISOString() }).eq("id", sub.id);
                                results.notifications_sent++;
                            }
                        })()
                    );
                }
            }
        }

        // EXECUTE ALL PARALLEL
        await Promise.all(notificationPromises);

        console.log("Cron job completed:", results);
        return new Response(JSON.stringify({ success: true, ...results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Cron job error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
