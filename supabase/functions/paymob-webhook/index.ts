import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const PAYMOB_HMAC_SECRET = Deno.env.get("PAYMOB_HMAC_SECRET")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

// Fields to concatenate for HMAC verification (in order per Paymob docs)
const HMAC_FIELDS = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
];

function getNestedValue(obj: any, path: string): string {
    const keys = path.split(".");
    let value = obj;
    for (const key of keys) {
        if (value === null || value === undefined) return "";
        value = value[key];
    }
    return String(value ?? "");
}

function verifyHmac(data: any, receivedHmac: string): { isValid: boolean; concatenated: string; calculated?: string } {
    try {
        // Concatenate field values in order
        const concatenated = HMAC_FIELDS.map((field) =>
            getNestedValue(data, field)
        ).join("");

        const calculatedHmac = createHmac("sha512", PAYMOB_HMAC_SECRET.trim())
            .update(concatenated)
            .digest("hex");

        console.log(`Debug HMAC: SecretLen=${PAYMOB_HMAC_SECRET.trim().length}, Calc=${calculatedHmac}, Recv=${receivedHmac}`);

        return { isValid: calculatedHmac === receivedHmac, concatenated, calculated: calculatedHmac };
    } catch (error) {
        console.error("HMAC verification error:", error);
        return { isValid: false, concatenated: "Error: " + error.message };
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

    try {
        const body = await req.json();
        console.log("Webhook received:", JSON.stringify(body, null, 2));

        // Handle both POST body and query string formats
        const txnData = body.obj || body;
        const receivedHmac = body.hmac || new URL(req.url).searchParams.get("hmac");

        if (!txnData || !receivedHmac) {
            console.error("Missing transaction data or HMAC");
            return new Response(
                JSON.stringify({ error: "Missing required data" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }


        // Extract transaction info
        const {
            id: paymobTransactionId,
            order,
            success,
            amount_cents,
            source_data,
            pending,
            intention,
            special_reference,
        } = txnData;

        // Try to get various IDs
        const paymobOrderId = intention?.id || order?.id; // Could be pi_... or Numeric
        const merchantOrderId = order?.merchant_order_id || special_reference; // Should be UUID
        const isSuccess = success === true && pending === false;

        console.log("Transaction details:", {
            paymobTransactionId,
            paymobOrderId,
            merchantOrderId,
            isSuccess,
            amount_cents,
        });

        let transaction = null;

        // 1. Try lookup by merchant_order_id / special_reference (Our Transaction UUID)
        if (merchantOrderId) {
            const { data: txByMerchant } = await supabase
                .from('payment_transactions')
                .select("id, subscription_id, user_id")
                .eq('id', merchantOrderId)
                .single();
            if (txByMerchant) transaction = txByMerchant;
        }

        // 2. Fallback: Lookup by paymob_order_id
        if (!transaction && paymobOrderId) {
            const { data: txByOrder } = await supabase
                .from('payment_transactions')
                .select("id, subscription_id, user_id")
                .eq('paymob_order_id', String(paymobOrderId))
                .single();
            if (txByOrder) transaction = txByOrder;
        }

        if (!transaction) {
            console.error("Transaction not found for order:", paymobOrderId, "or merchant:", merchantOrderId);
            // Return 200 anyway - might be duplicate webhook
            return new Response(
                JSON.stringify({ success: true, message: "Transaction not found" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verify HMAC
        const isValidHmac = verifyHmac(txnData, receivedHmac);
        console.log("HMAC verification:", isValidHmac ? "PASSED" : "FAILED");

        if (!isValidHmac) {
            console.error("HMAC verification failed");

            // Log the failure to the DB
            await supabase
                .from("payment_transactions")
                .update({
                    hmac_verified: false,
                    raw_response: txnData,
                    error_message: "HMAC Verification Failed. Check PAYMOB_HMAC_SECRET.",
                })
                .eq("id", transaction.id);

            // Return 200 to prevent retries
            return new Response(
                JSON.stringify({ error: "HMAC verification failed" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Update transaction record (Success Case)
        await supabase
            .from("payment_transactions")
            .update({
                paymob_transaction_id: String(paymobTransactionId),
                status: isSuccess ? "success" : "failed",
                hmac_verified: true,
                raw_response: txnData,
                error_message: isSuccess ? null : txnData.data?.message || "Payment failed",
            })
            .eq("id", transaction.id);

        if (isSuccess) {
            // Calculate subscription dates
            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

            const graceEndsAt = new Date(expiresAt);
            graceEndsAt.setHours(graceEndsAt.getHours() + 48); // 48 hours grace

            const storefrontPausedAt = new Date(expiresAt);
            storefrontPausedAt.setDate(storefrontPausedAt.getDate() + 30); // 30 days after expiry

            // Update subscription to active
            const { error: subError } = await supabase
                .from("subscriptions")
                .update({
                    status: "active",
                    is_first_subscription: false, // Mark as no longer first
                    amount_paid: amount_cents / 100,
                    started_at: now.toISOString(),
                    expires_at: expiresAt.toISOString(),
                    grace_ends_at: graceEndsAt.toISOString(),
                    storefront_paused_at: storefrontPausedAt.toISOString(),
                    paymob_order_id: String(paymobOrderId),
                })
                .eq("id", transaction.subscription_id);

            if (subError) {
                console.error("Error updating subscription:", subError);
            } else {
                console.log("Subscription activated successfully for user:", transaction.user_id);
            }
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Webhook processing error:", error);
        // Always return 200 to Paymob
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
