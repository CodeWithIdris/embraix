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

    // Fetch waitlist users with active status
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist_users?status=eq.active&select=email,name,preferences`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });
    const users = await usersRes.json();

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "No active subscribers" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch latest published news posts (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const newsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/news_posts?status=eq.approved&published_at=gte.${weekAgo}&select=id,title,excerpt&order=published_at.desc&limit=5`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const latestPosts = await newsRes.json();

    // Fetch latest published articles
    const articlesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?status=eq.published&published_at=gte.${weekAgo}&select=id,title,excerpt,slug&order=published_at.desc&limit=5`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const latestArticles = await articlesRes.json();

    const siteUrl = "https://embraix.lovable.app";
    let sent = 0;
    let errors = 0;

    // Build content sections
    const newsSection = Array.isArray(latestPosts) && latestPosts.length > 0
      ? latestPosts.map((p: any) => `<li><a href="${siteUrl}/news/${p.id}" style="color:#16a34a;text-decoration:none;font-weight:600;">${p.title}</a>${p.excerpt ? `<br/><span style="color:#6b7280;font-size:13px;">${p.excerpt.substring(0, 120)}...</span>` : ""}</li>`).join("")
      : "";

    const articlesSection = Array.isArray(latestArticles) && latestArticles.length > 0
      ? latestArticles.map((a: any) => `<li><a href="${siteUrl}/blog/${a.slug}" style="color:#16a34a;text-decoration:none;font-weight:600;">${a.title}</a>${a.excerpt ? `<br/><span style="color:#6b7280;font-size:13px;">${a.excerpt.substring(0, 120)}...</span>` : ""}</li>`).join("")
      : "";

    const hasContent = newsSection || articlesSection;

    if (!hasContent) {
      return new Response(JSON.stringify({ message: "No new content this week, skipping newsletter" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to each user
    for (const user of users) {
      const prefs: string[] = Array.isArray(user.preferences) ? user.preferences : [];

      // Build personalised email
      let contentBlocks = "";

      if (newsSection && (prefs.length === 0 || prefs.includes("clean_energy_news") || prefs.includes("industry_reports"))) {
        contentBlocks += `<h3 style="color:#111827;margin:20px 0 10px;">📰 Latest News & Reports</h3><ul style="padding-left:20px;line-height:1.8;">${newsSection}</ul>`;
      }

      if (articlesSection && (prefs.length === 0 || prefs.includes("ai_insights") || prefs.includes("diy_guides") || prefs.includes("energy_tech"))) {
        contentBlocks += `<h3 style="color:#111827;margin:20px 0 10px;">📝 Featured Articles</h3><ul style="padding-left:20px;line-height:1.8;">${articlesSection}</ul>`;
      }

      if (prefs.includes("promotions")) {
        contentBlocks += `<h3 style="color:#111827;margin:20px 0 10px;">🎁 Promotions</h3><p style="color:#374151;">Check out the latest deals on <a href="${siteUrl}/promotions" style="color:#16a34a;">our promotions page</a>.</p>`;
      }

      if (!contentBlocks) {
        contentBlocks = `<p style="color:#374151;">Here's what's new on Embraix this week.</p>`;
        if (newsSection) contentBlocks += `<h3 style="color:#111827;margin:20px 0 10px;">📰 Latest News</h3><ul style="padding-left:20px;line-height:1.8;">${newsSection}</ul>`;
        if (articlesSection) contentBlocks += `<h3 style="color:#111827;margin:20px 0 10px;">📝 Articles</h3><ul style="padding-left:20px;line-height:1.8;">${articlesSection}</ul>`;
      }

      const html = `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <div style="background:#16a34a;padding:24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">Embraix Weekly</h1>
            <p style="color:#dcfce7;margin:8px 0 0;font-size:14px;">Your personalised update for ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div style="padding:24px;">
            <p style="color:#374151;">Hi ${user.name || "there"},</p>
            <p style="color:#374151;">Here's your weekly roundup from Embraix, curated based on your interests.</p>
            ${contentBlocks}
            <div style="text-align:center;margin:32px 0 16px;">
              <a href="${siteUrl}" style="display:inline-block;padding:12px 32px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Explore Embraix</a>
            </div>
          </div>
          <div style="padding:16px 24px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;">
            <p>You're receiving this because you joined the Embraix waitlist.</p>
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
            from: "Embraix Weekly <hello@embraix.com>",
            reply_to: "support@embraix.com",
            to: [user.email],
            subject: `Your Embraix Weekly — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
            html,
          }),
        });

        if (emailRes.ok) {
          sent++;
        } else {
          errors++;
          console.error(`Failed to send to ${user.email}:`, await emailRes.text());
        }
      } catch (e) {
        errors++;
        console.error(`Error sending to ${user.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent, errors, total: users.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Weekly newsletter error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
