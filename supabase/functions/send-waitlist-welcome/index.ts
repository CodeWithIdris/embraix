import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(resendKey);
    const firstName = name || "there";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">Welcome to Embraix! 🚀</h1>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${firstName}! 👋</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for joining the Embraix waitlist! You're now part of a growing community passionate about clean energy and sustainable technology.
        </p>
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 20px;">What's Coming:</h2>
          <ul style="color: white; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>AI-powered energy insights tailored to you</li>
            <li>Expert consultation marketplace</li>
            <li>Industry reports and market analysis</li>
            <li>Exclusive early access features</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We'll notify you when new updates arrive based on your preferences. Stay tuned! 🌍
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://embraix.lovable.app" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Visit Embraix
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br/><strong style="color: #10b981;">The Embraix Team</strong>
        </p>
      </div>
    `;

    // Try verified domain first, fall back to Resend sandbox
    let result = await resend.emails.send({
      from: "Embraix <hello@embraix.com>",
      reply_to: "support@embraix.com",
      to: [email],
      subject: "Welcome to the Embraix Waitlist! 🚀",
      html,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
      },
    });

    if (result?.error) {
      console.warn("Primary send failed, trying fallback:", JSON.stringify(result.error));
      // Fallback to Resend sandbox sender
      result = await resend.emails.send({
        from: "Embraix <onboarding@resend.dev>",
        reply_to: "support@embraix.com",
        to: [email],
        subject: "Welcome to the Embraix Waitlist! 🚀",
        html,
      });
    }

    if (result?.error) {
      console.error("Resend error:", JSON.stringify(result.error));
      return new Response(JSON.stringify({ error: "Failed to send", details: result.error }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Waitlist welcome email sent to:", email, "Result:", JSON.stringify(result));

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending waitlist email:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
