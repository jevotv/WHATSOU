import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = "1177042323";
const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL")!;
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY")!;
const EVOLUTION_INSTANCE_NAME = "otp_new";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendWhatsAppMessage(phone: string, message: string) {
    try {
        // Format phone number (remove leading 0 if present, add country code)
        let formattedPhone = phone.replace(/\D/g, "");
        if (formattedPhone.startsWith("0")) {
            formattedPhone = "2" + formattedPhone;
        }
        if (!formattedPhone.startsWith("2")) {
            formattedPhone = "2" + formattedPhone;
        }

        const response = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": EVOLUTION_API_KEY,
                },
                body: JSON.stringify({
                    number: formattedPhone,
                    text: message,
                }),
            }
        );

        const data = await response.json();
        console.log("WhatsApp message sent:", data);
        return data;
    } catch (error) {
        console.error("Error sending WhatsApp message:", error);
        throw error;
    }
}

async function editTelegramMessage(messageId: string, text: string) {
    try {
        await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    message_id: parseInt(messageId),
                    text: text,
                    parse_mode: "Markdown",
                }),
            }
        );
    } catch (error) {
        console.error("Error editing Telegram message:", error);
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const body = await req.json();
        console.log("Telegram webhook received:", JSON.stringify(body));

        // Handle callback query (button click)
        if (body.callback_query) {
            const callbackQuery = body.callback_query;
            const callbackData = callbackQuery.data;
            const messageId = callbackQuery.message?.message_id;

            // Parse callback data: confirm_<transaction_id> or reject_<transaction_id>
            const [action, transactionId] = callbackData.split("_");

            if (!transactionId) {
                throw new Error("Invalid callback data");
            }

            // IMMEDIATELY answer the callback to prevent timeout
            // We tell Telegram "Processing..." so the loading state stops
            await fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        callback_query_id: callbackQuery.id,
                        text: "جاري المعالجة... (Processing)",
                    }),
                }
            ).catch(err => console.error("Error answering callback immediately:", err));

            // Get transaction details
            const { data: transaction, error: txError } = await supabase
                .from("payment_transactions")
                .select("*, subscriptions!inner(user_id)")
                .eq("id", transactionId)
                .single();

            if (txError || !transaction) {
                console.error("Transaction not found:", txError);
                // Answer callback to remove loading state
                await fetch(
                    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            callback_query_id: callbackQuery.id,
                            text: "Transaction not found",
                        }),
                    }
                );
                return new Response("OK");
            }

            // Get user phone
            const { data: user } = await supabase
                .from("users")
                .select("phone")
                .eq("id", transaction.user_id)
                .single();

            const userPhone = user?.phone || "";

            if (action === "confirm") {
                // Calculate expiry dates
                const now = new Date();
                const expiresAt = new Date(now);

                // If amount is 3000 EGP (stored as 3000), it's a yearly subscription
                // Note: amount in DB is decimal/float, usually stored as EGP not piasters in this table based on previous code
                const isYearly = transaction.amount >= 3000;
                const daysToAdd = isYearly ? 365 : 30;

                expiresAt.setDate(expiresAt.getDate() + daysToAdd);

                const graceEndsAt = new Date(expiresAt);
                graceEndsAt.setDate(graceEndsAt.getDate() + 30);

                // Update subscription to active
                await supabase
                    .from("subscriptions")
                    .update({
                        status: "active",
                        started_at: now.toISOString(),
                        expires_at: expiresAt.toISOString(),
                        grace_ends_at: graceEndsAt.toISOString(),
                        is_first_subscription: false,
                        pending_payment_method: null,
                        pending_payment_at: null,
                        pending_expires_at: null,
                    })
                    .eq("id", transaction.subscription_id);

                // Update transaction to success
                await supabase
                    .from("payment_transactions")
                    .update({
                        status: "success",
                        confirmed_by: "admin",
                    })
                    .eq("id", transactionId);

                // Send WhatsApp confirmation to customer
                await sendWhatsAppMessage(
                    userPhone,
                    `✅ *تم تأكيد اشتراكك بنجاح!*\n\nشكراً لاستخدامك واتسو.\n\nاشتراكك صالح حتى: ${expiresAt.toLocaleDateString("ar-EG")}`
                );

                // Edit Telegram message
                await editTelegramMessage(
                    String(messageId),
                    `✅ *تم تأكيد الدفع*\n\n` +
                    `📱 الرقم: \`${userPhone}\`\n` +
                    `💰 المبلغ: ${transaction.amount} جنيه\n\n` +
                    `🎉 تم تفعيل الاشتراك حتى ${expiresAt.toLocaleDateString("ar-EG")}`
                );

                // No need to answer callback again, we did it at the start

            } else if (action === "reject") {
                // Revoke temporary access
                await supabase
                    .from("subscriptions")
                    .update({
                        pending_payment_method: null,
                        pending_payment_at: null,
                        pending_expires_at: null,
                    })
                    .eq("id", transaction.subscription_id);

                // Update transaction to failed
                await supabase
                    .from("payment_transactions")
                    .update({
                        status: "failed",
                        confirmed_by: "admin",
                        error_message: "Rejected by admin",
                    })
                    .eq("id", transactionId);

                // Send WhatsApp rejection to customer
                await sendWhatsAppMessage(
                    userPhone,
                    `❌ *تم رفض طلب الدفع*\n\nلم يتم تأكيد الدفع. يرجى التواصل معنا إذا كنت تعتقد أن هذا خطأ.`
                );

                // Edit Telegram message
                await editTelegramMessage(
                    String(messageId),
                    `❌ *تم رفض الدفع*\n\n` +
                    `📱 الرقم: \`${userPhone}\`\n` +
                    `💰 المبلغ: ${transaction.amount} جنيه`
                );

                // No need to answer callback again, we did it at the start
            }
        }

        return new Response("OK", { headers: corsHeaders });
    } catch (error) {
        console.error("Telegram webhook error:", error);
        return new Response("OK", { headers: corsHeaders }); // Always return OK to Telegram
    }
});
