import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const PAYMOB_SECRET_KEY = Deno.env.get("PAYMOB_SECRET_KEY")!;
const PAYMOB_PUBLIC_KEY = Deno.env.get("PAYMOB_PUBLIC_KEY")!;
const PAYMOB_CARD_INTEGRATION_ID = Deno.env.get("PAYMOB_CARD_INTEGRATION_ID")!;
const PAYMOB_WALLET_INTEGRATION_ID = Deno.env.get("PAYMOB_WALLET_INTEGRATION_ID")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://whatsou.com";

// Pricing in piasters
const FIRST_MONTH_AMOUNT = 500; // 5 EGP (TESTING - change back to 10000 after)
const RENEWAL_AMOUNT = 30000; // 300 EGP

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
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

        const { user_id, payment_method } = await req.json();

        if (!user_id) {
            throw new Error("user_id is required");
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
        const amount = isFirstSubscription ? FIRST_MONTH_AMOUNT : RENEWAL_AMOUNT;

        // Build billing data (Common for both flows)
        const billingData = {
            first_name: "Customer",
            last_name: user.phone,
            email: `${user.phone}@whatsou.com`,
            phone_number: user.phone,
            country: "EG",
            city: "Cairo",
            street: "N/A",
            building: "N/A",
            floor: "N/A",
            apartment: "N/A",
        };



        // 1. Create/Get Subscription
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
                amount: amount / 100,
                status: "pending",
                payment_method: "card",
            })
            .select("id")
            .single();

        if (txError) throw txError;

        // --- INTENTION API FLOW (Card Only) ---
        const integrationId = PAYMOB_CARD_INTEGRATION_ID?.trim();
        if (!integrationId) throw new Error("PAYMOB_CARD_INTEGRATION_ID is missing");

        // Call Paymob Intention API for Card
        const intentionPayload = {
            amount: amount,
            currency: "EGP",
            payment_methods: [parseInt(integrationId)],
            billing_data: billingData,
            extras: {
                user_id: user_id,
                subscription_id: subscriptionId,
                transaction_id: transaction.id,
                is_first: isFirstSubscription,
            },
            special_reference: transaction.id,
            redirection_url: `${SITE_URL}/dashboard/subscription?status=complete`,
            notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paymob-webhook`,
        };

        console.log("Debug: Sending Payload to Paymob:", JSON.stringify(intentionPayload));

        const intentionResponse = await fetch(
            "https://accept.paymob.com/v1/intention/",
            {
                method: "POST",
                headers: {
                    Authorization: `Token ${PAYMOB_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(intentionPayload),
            }
        );

        if (!intentionResponse.ok) {
            const errorText = await intentionResponse.text();
            console.error("Paymob Intention API Error:", errorText);

            throw new Error(`Paymob API error: ${errorText}`);
        }

        const intentionData = await intentionResponse.json();

        console.log("Paymob Intention Response:", JSON.stringify(intentionData, null, 2));

        // Update transaction with Paymob order ID
        await supabase
            .from("payment_transactions")
            .update({ paymob_order_id: intentionData.id })
            .eq("id", transaction.id);

        // Update subscription with order ID
        await supabase
            .from("subscriptions")
            .update({ paymob_order_id: intentionData.id })
            .eq("id", subscriptionId);

        return new Response(
            JSON.stringify({
                success: true,
                payment_url: intentionData.redirect_url,
                client_secret: intentionData.client_secret,
                public_key: PAYMOB_PUBLIC_KEY,
                amount: amount / 100,
                currency: "EGP",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error creating payment intention:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
