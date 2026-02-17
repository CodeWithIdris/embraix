import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  source: "newsletter" | "ai_consult" | "signup";
  userId?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): boolean => {
  return emailRegex.test(email) && email.length <= 255;
};

const getEmailContent = (name: string, source: string) => {
  const firstName = name || "there";
  
  const subjects: Record<string, string> = {
    newsletter: "Welcome to Embraix Newsletter! 🌱",
    ai_consult: "Welcome to Embraix AI Consult! ⚡",
    signup: "Welcome to Embraix! 🚀",
  };

  const contents: Record<string, string> = {
    newsletter: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">🌱 Welcome to Embraix Newsletter!</h1>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${firstName}! 👋</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Thank you for subscribing to the Embraix Newsletter! You've just taken a great step towards staying ahead in the world of sustainable technology.
        </p>
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 20px;">What to Expect:</h2>
          <ul style="color: white; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Weekly curated insights on clean energy and EV trends</li>
            <li>Exclusive market analysis and industry forecasts</li>
            <li>Early access to new guides and tutorials</li>
            <li>Special promotions and offers</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">We're excited to have you on this journey towards a sustainable future! 🌍</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br><strong style="color: #10b981;">The Embraix Team</strong>
        </p>
      </div>
    `,
    ai_consult: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">⚡ Welcome to Embraix AI Consult!</h1>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${firstName}! 👋</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          You've just unlocked access to our AI-powered consultation platform!
        </p>
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 20px;">What You Can Explore:</h2>
          <ul style="color: white; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Get personalized solar system recommendations</li>
            <li>Compare EV options for your needs</li>
            <li>Learn about smart home technologies</li>
            <li>Understand renewable energy solutions</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Start chatting with our AI and discover smarter, greener choices! 🌿</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br><strong style="color: #10b981;">The Embraix Team</strong>
        </p>
      </div>
    `,
    signup: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">🚀 Welcome to Embraix!</h1>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${firstName}! 👋</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We're thrilled to have you join the Embraix community!
        </p>
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h2 style="color: white; margin: 0 0 15px 0; font-size: 20px;">Get Started:</h2>
          <ul style="color: white; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>🤖 Chat with our AI Consultant for personalized advice</li>
            <li>📰 Subscribe to our Newsletter for weekly insights</li>
            <li>📚 Browse our articles on EVs, solar, and smart tech</li>
            <li>🎁 Check out exclusive promotions and offers</li>
          </ul>
        </div>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Let's build a greener future together! 🌍</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br><strong style="color: #10b981;">The Embraix Team</strong>
        </p>
      </div>
    `,
  };

  return {
    subject: subjects[source] || subjects.signup,
    html: contents[source] || contents.signup,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const token = authHeader.replace("Bearer ", "");
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("JWT verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const authenticatedUserId = user.id;
    const authenticatedEmail = user.email;

    console.log("Authenticated user:", authenticatedUserId, authenticatedEmail);

    const { email, name, source, userId }: WelcomeEmailRequest = await req.json();

    if (!email || !source) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and source" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const validSources = ["newsletter", "ai_consult", "signup"];
    if (!validSources.includes(source)) {
      return new Response(
        JSON.stringify({ error: "Invalid source" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (userId && userId !== authenticatedUserId) {
      console.error("User ID mismatch:", userId, "vs", authenticatedUserId);
      return new Response(
        JSON.stringify({ error: "Unauthorized - user ID mismatch" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if ((source === "newsletter" || source === "ai_consult") && email !== authenticatedEmail) {
      console.error("Email mismatch for", source, ":", email, "vs", authenticatedEmail);
      return new Response(
        JSON.stringify({ error: "Unauthorized - email mismatch" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending ${source} welcome email to:`, email);

    const { subject, html } = getEmailContent(name || "", source);

    const plainText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Try sending with verified domain first, fall back to Resend test sender
    let emailResponse;
    try {
      console.log("Attempting to send email from hello@embraix.com...");
      emailResponse = await resend.emails.send({
        from: "Embraix <hello@embraix.com>",
        reply_to: "support@embraix.com",
        to: [email],
        subject,
        html,
        text: plainText,
        headers: {
          "X-Entity-Ref-ID": `${source}-${authenticatedUserId}-${Date.now()}`,
          "List-Unsubscribe": "<mailto:unsubscribe@embraix.com>",
        },
      });

      console.log("Resend API response:", JSON.stringify(emailResponse));

      // Check if Resend returned an error in the response
      if (emailResponse?.error) {
        console.warn("Resend returned error with primary sender:", JSON.stringify(emailResponse.error));
        console.log("Retrying with Resend test sender...");
        
        emailResponse = await resend.emails.send({
          from: "Embraix <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
          text: plainText,
        });
        
        console.log("Resend test sender response:", JSON.stringify(emailResponse));
      }
    } catch (sendError: any) {
      console.error("Error sending with primary sender:", sendError.message);
      console.log("Falling back to Resend test sender...");
      
      try {
        emailResponse = await resend.emails.send({
          from: "Embraix <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
          text: plainText,
        });
        console.log("Fallback email sent:", JSON.stringify(emailResponse));
      } catch (fallbackError: any) {
        console.error("Fallback also failed:", fallbackError.message);
        return new Response(
          JSON.stringify({ error: "Failed to send email. Please try again later." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Check final response for errors
    if (emailResponse?.error) {
      console.error("Final email send failed:", JSON.stringify(emailResponse.error));
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailResponse.error }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Welcome email sent successfully:", JSON.stringify(emailResponse));

    // Store subscription record
    if (source !== "signup") {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && serviceRoleKey) {
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
        
        const { error: insertError } = await adminSupabase
          .from("newsletter_subscriptions")
          .upsert({
            user_id: authenticatedUserId,
            email,
            source,
            is_active: true,
          }, { onConflict: "email" });

        if (insertError) {
          console.error("Error storing subscription:", JSON.stringify(insertError));
          // Don't fail the whole request if DB insert fails - email was sent
        } else {
          console.log("Subscription stored successfully for:", email);
        }
      } else {
        console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for subscription storage");
      }
    }

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
