import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Check } from "lucide-react";
import { WAITLIST_JOINED_KEY } from "@/components/WaitlistBanner";

const preferenceOptions = [
  { id: "ai_insights", label: "AI Insights" },
  { id: "clean_energy_news", label: "Clean Energy News" },
  { id: "expert_consultation", label: "Expert Consultation" },
  { id: "industry_reports", label: "Industry Reports" },
  { id: "promotions", label: "Promotions & Deals" },
  { id: "diy_guides", label: "DIY Guides" },
  { id: "energy_tech", label: "Energy Technology Updates" },
];

const Waitlist = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  const togglePref = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      let referredBy: string | null = null;
      if (refCode) {
        const { data: referrer } = await (supabase as any)
          .from("waitlist_users")
          .select("id")
          .eq("referral_code", refCode)
          .maybeSingle();
        if (referrer) referredBy = referrer.id;
      }

      const { data, error } = await (supabase as any)
        .from("waitlist_users")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          country: country.trim() || null,
          preferences,
          referred_by: referredBy,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({ title: "You're already on the waitlist!", description: "We'll keep you updated." });
          localStorage.setItem(WAITLIST_JOINED_KEY, "1");
        } else {
          throw error;
        }
      } else {
        if (referredBy && data) {
          await (supabase as any).from("referrals").insert({
            referrer_id: referredBy,
            referred_user_id: data.id,
          });
        }
        setReferralLink(`${window.location.origin}/waitlist?ref=${data?.referral_code || ""}`);
        setSubmitted(true);
        localStorage.setItem(WAITLIST_JOINED_KEY, "1");
        toast({ title: "Welcome to the Embraix waitlist!" });

        try {
          await supabase.functions.invoke("send-waitlist-welcome", {
            body: { email: email.trim().toLowerCase(), name: name.trim() },
          });
        } catch (emailErr) {
          console.error("Welcome email error:", emailErr);
        }
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Join the Waitlist | Embraix</title>
        <meta name="description" content="Join the Embraix waitlist for early access to AI insights, expert consultations, and clean energy tools." />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-32 pb-12 bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          {submitted ? (
            <Card className="gradient-card border-border/50 mt-12 animate-fade-in">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">You're on the list!</h1>
                <p className="text-muted-foreground">We'll notify you when new updates arrive based on your preferences.</p>
                {referralLink && (
                  <div className="pt-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">Share your referral link:</p>
                    <div className="flex gap-2">
                      <Input value={referralLink} readOnly className="text-xs" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(referralLink);
                          toast({ title: "Link copied!" });
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Refer 3 friends for early report access • 5 for a free expert consultation credit
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-center mb-8">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                <h1 className="font-display text-3xl font-bold text-foreground">Join Our Waitlist</h1>
                <p className="text-muted-foreground mt-2">
                  Get early access to AI insights, expert consultations, energy reports and new tools.
                </p>
              </div>
              <Card className="gradient-card border-border/50">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country (optional)</Label>
                      <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Nigeria" className="mt-1" />
                    </div>
                    <div>
                      <Label className="mb-2 block">What interests you?</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {preferenceOptions.map((opt) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={preferences.includes(opt.id)}
                              onCheckedChange={() => togglePref(opt.id)}
                            />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Join Waitlist
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Waitlist;
