import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  source: "newsletter" | "ai_consult" | "signup";
  userId?: string;
}

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
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi ${firstName}! 👋
        </p>
        
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
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We're excited to have you on this journey towards a sustainable future! 🌍
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong style="color: #10b981;">The Embraix Team</strong>
        </p>
      </div>
    `,
    ai_consult: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">⚡ Welcome to Embraix AI Consult!</h1>
        </div>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi ${firstName}! 👋
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          You've just unlocked access to our AI-powered consultation platform! Our intelligent assistant is ready to help you navigate the world of clean energy and sustainable technology.
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
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Start chatting with our AI and discover how you can make smarter, greener choices! 🌿
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong style="color: #10b981;">The Embraix Team</strong>
        </p>
      </div>
    `,
    signup: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0; font-size: 28px;">🚀 Welcome to Embraix!</h1>
        </div>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi ${firstName}! 👋
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We're thrilled to have you join the Embraix community! Your account is now active and you're ready to explore everything we have to offer.
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
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We're here to help you make smarter, sustainable choices. Let's build a greener future together! 🌍
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong style="color: #10b981;">The Embraix Team</strong>
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
    const { email, name, source, userId }: WelcomeEmailRequest = await req.json();

    console.log(`Sending ${source} welcome email to:`, email);

    const { subject, html } = getEmailContent(name || "", source);

    const emailResponse = await resend.emails.send({
      from: "Embraix <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Store subscription record in database if userId is provided
    if (userId && source !== "signup") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { error: insertError } = await supabase
          .from("newsletter_subscriptions")
          .upsert({
            user_id: userId,
            email,
            source,
            is_active: true,
          }, { onConflict: "email" });

        if (insertError) {
          console.error("Error storing subscription:", insertError);
        } else {
          console.log("Subscription stored successfully for:", email);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);