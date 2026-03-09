import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const { subject, content, recipientGroup, preferenceFilter } = await req.json();

    if (!subject || !content || !recipientGroup) {
      throw new Error("Missing required fields: subject, content, recipientGroup");
    }

    let recipients: Array<{ email: string; name?: string }> = [];

    if (recipientGroup === "waitlist" || recipientGroup === "all") {
      let url = `${SUPABASE_URL}/rest/v1/waitlist_users?status=eq.active&select=email,name,preferences`;
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      const users = await res.json();
      
      if (Array.isArray(users)) {
        for (const u of users) {
          // Filter by preference if specified
          if (preferenceFilter && preferenceFilter.length > 0) {
            const prefs: string[] = Array.isArray(u.preferences) ? u.preferences : [];
            if (prefs.length > 0 && !prefs.some((p: string) => preferenceFilter.includes(p))) {
              continue;
            }
          }
          recipients.push({ email: u.email, name: u.name });
        }
      }
    }

    if (recipientGroup === "newsletter" || recipientGroup === "all") {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/newsletter_subscriptions?is_active=eq.true&select=email`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      const subs = await res.json();
      if (Array.isArray(subs)) {
        for (const s of subs) {
          if (!recipients.some((r) => r.email === s.email)) {
            recipients.push({ email: s.email });
          }
        }
      }
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No recipients found matching criteria" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteUrl = "https://embraix.lovable.app";
    let sent = 0;
    let errors = 0;

    for (const recipient of recipients) {
      const html = `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <div style="background:#16a34a;padding:24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;">Embraix</h1>
          </div>
          <div style="padding:24px;">
            <p style="color:#374151;">Hi ${recipient.name || "there"},</p>
            ${content}
            <div style="text-align:center;margin:32px 0 16px;">
              <a href="${siteUrl}" style="display:inline-block;padding:12px 32px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Visit Embraix</a>
            </div>
          </div>
          <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;">
            <p>© ${new Date().getFullYear()} Embraix. All rights reserved.</p>
          </div>
        </div>
      `;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Embraix <hello@embraix.com>",
            reply_to: "support@embraix.com",
            to: [recipient.email],
            subject,
            html,
          }),
        });

        if (emailRes.ok) {
          sent++;
        } else {
          errors++;
          console.error(`Failed to send to ${recipient.email}:`, await emailRes.text());
        }
      } catch (e) {
        errors++;
        console.error(`Error sending to ${recipient.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, errors, total: recipients.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email campaign error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
