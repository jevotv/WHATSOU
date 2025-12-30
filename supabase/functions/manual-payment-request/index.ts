import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = "1177042323";
const INSTAPAY_LINK = "https://ipn.eg/S/jevotv/instapay/0W4BHk";
const VODAFONE_CASH_LINK = "http://vf.eg/vfcash?id=mt&qrId=Hxyr9N";
const WHATSAPP_ADMIN = "201000499431";
const SITE_URL = Deno.env.get("SITE_URL") || "https://whatsou.com";

// Pricing in piasters
const FIRST_MONTH_AMOUNT = 10000; // 100 EGP
const RENEWAL_AMOUNT = 30000; // 300 EGP

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { user_id, payment_method, subscription_period = 'monthly' } = await req.json();

        if (!user_id || !payment_method) {
            throw new Error("user_id and payment_method are required");
        }

        if (!["instapay", "vodafone"].includes(payment_method)) {
            throw new Error("Invalid payment method");
        }

        // Get user details
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, phone")
            .eq("id", user_id)
            .single();

        if (userError || !user) {
            throw new Error("User not found");
        }

        // Check existing subscription
        const { data: existingSub } = await supabase
            .from("subscriptions")
            .select("id, is_first_subscription, status")
            .eq("user_id", user_id)
            .single();

        const isFirstSubscription = !existingSub || existingSub.is_first_subscription;

        let amount = 0;
        if (isFirstSubscription) {
            amount = FIRST_MONTH_AMOUNT / 100;
        } else {
            // Renewal
            amount = subscription_period === 'yearly' ? 3000 : (RENEWAL_AMOUNT / 100);
        }

        // Create/Get Subscription
        let subscriptionId: string;
        if (existingSub) {
            subscriptionId = existingSub.id;
        } else {
            const { data: newSub, error: subError } = await supabase
                .from("subscriptions")
                .insert({
                    user_id: user_id,
                    status: "inactive",
                    is_first_subscription: true,
                })
                .select("id")
                .single();

            if (subError) throw subError;
            subscriptionId = newSub.id;
        }

        // Create Pending Transaction
        const { data: transaction, error: txError } = await supabase
            .from("payment_transactions")
            .insert({
                user_id: user_id,
                subscription_id: subscriptionId,
                amount: amount,
                status: "pending",
                payment_method: payment_method,
            })
            .select("id")
            .single();

        if (txError) throw txError;

        // Grant 24h temporary access
        const pendingExpiresAt = new Date();
        pendingExpiresAt.setHours(pendingExpiresAt.getHours() + 24);

        await supabase
            .from("subscriptions")
            .update({
                pending_payment_method: payment_method,
                pending_payment_at: new Date().toISOString(),
                pending_expires_at: pendingExpiresAt.toISOString(),
            })
            .eq("id", subscriptionId);

        // Send Telegram notification to admin
        const methodLabel = payment_method === "instapay" ? "InstaPay" : "Vodafone Cash";
        const periodLabel = isFirstSubscription ? "First Month" : (subscription_period === 'yearly' ? "Yearly" : "Monthly");

        const telegramMessage = `🔔 *طلب دفع جديد*\n\n` +
            `📱 الرقم: \`${user.phone}\`\n` +
            `💰 المبلغ: ${amount} جنيه\n` +
            `📅 النوع: ${periodLabel}\n` +
            `💳 الطريقة: ${methodLabel}\n` +
            `🔑 Transaction ID: \`${transaction.id}\`\n\n` +
            `⏳ صلاحية مؤقتة 24 ساعة`;

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: telegramMessage,
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "✅ تأكيد", callback_data: `confirm_${transaction.id}` },
                                { text: "❌ رفض", callback_data: `reject_${transaction.id}` },
                            ],
                        ],
                    },
                }),
            }
        );

        const telegramData = await telegramResponse.json();

        // Store Telegram message ID
        if (telegramData.ok && telegramData.result?.message_id) {
            await supabase
                .from("payment_transactions")
                .update({ telegram_message_id: String(telegramData.result.message_id) })
                .eq("id", transaction.id);
        }

        // Generate WhatsApp link for screenshot
        const whatsappMessage = encodeURIComponent(
            `مرحباً، قمت بدفع اشتراك واتسو\n` +
            `المبلغ: ${amount} جنيه\n` +
            `الطريقة: ${methodLabel}\n` +
            `رقم الهاتف: ${user.phone}\n` +
            `\n(أرفق سكرين شوت التحويل)`
        );
        const whatsappLink = `https://wa.me/${WHATSAPP_ADMIN}?text=${whatsappMessage}`;

        // Get payment link
        const paymentLink = payment_method === "instapay" ? INSTAPAY_LINK : VODAFONE_CASH_LINK;

        return new Response(
            JSON.stringify({
                success: true,
                payment_link: paymentLink,
                whatsapp_link: whatsappLink,
                amount: amount,
                pending_expires_at: pendingExpiresAt.toISOString(),
                transaction_id: transaction.id,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error processing manual payment:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
