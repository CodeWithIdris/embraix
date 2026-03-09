import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Check, Zap, Link2 } from "lucide-react";

const WAITLIST_JOINED_KEY = "embraix_waitlist_joined";

const preferenceOptions = [
  { id: "ai_insights", label: "AI Insights" },
  { id: "clean_energy_news", label: "Clean Energy News" },
  { id: "expert_consultation", label: "Expert Consultation" },
  { id: "industry_reports", label: "Industry Reports" },
  { id: "promotions", label: "Promotions & Deals" },
  { id: "diy_guides", label: "DIY Guides" },
  { id: "energy_tech", label: "Energy Technology Updates" },
];

const WaitlistPopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const joined = localStorage.getItem(WAITLIST_JOINED_KEY);
    if (joined) return;
    const timer = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(timer);
  }, []);

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
      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
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
        .select("referral_code, id")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({ title: "You're already on the waitlist! 🎉" });
          localStorage.setItem(WAITLIST_JOINED_KEY, "1");
          setOpen(false);
        } else throw error;
      } else {
        // Track referral
        if (referredBy && data) {
          await (supabase as any).from("referrals").insert({
            referrer_id: referredBy,
            referred_user_id: data.id,
          });
        }

        setReferralLink(`${window.location.origin}/waitlist?ref=${data?.referral_code || ""}`);
        setSubmitted(true);
        localStorage.setItem(WAITLIST_JOINED_KEY, "1");

        try {
          await supabase.functions.invoke("send-waitlist-welcome", {
            body: { email: email.trim().toLowerCase(), name: name.trim() },
          });
        } catch {}
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const shareMessage = "Join the Embraix waitlist for early access to AI insights, clean energy tools, and expert consultation.";
  const encodedMsg = encodeURIComponent(`${shareMessage} ${referralLink}`);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Referral link copied!" });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !submitted) setOpen(false); if (!v && submitted) setOpen(false); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-primary/20 max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-8 px-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">You're in! 🎉</h3>
            <p className="text-sm text-muted-foreground">We'll notify you when exciting things launch.</p>

            {referralLink && (
              <div className="pt-4 space-y-3 text-left">
                <p className="text-sm font-medium text-foreground text-center">Share your referral link:</p>
                <div className="flex gap-2">
                  <Input value={referralLink} readOnly className="text-xs" />
                  <Button variant="outline" size="sm" onClick={copyLink}>
                    <Link2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={`https://wa.me/?text=${encodedMsg}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={`https://twitter.com/intent/tweet?text=${encodedMsg}`} target="_blank" rel="noopener noreferrer">𝕏</a>
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer">FB</a>
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener noreferrer">in</a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Refer 3 friends for early report access • 5 for a free expert consultation credit
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="gradient-primary px-6 py-5 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <h2 className="font-display text-lg font-bold text-primary-foreground">Get Early Access</h2>
              <p className="text-xs text-primary-foreground/80 mt-1">AI insights · Expert consultations · Energy tools</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="h-10" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="h-10" />
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (optional)" className="h-10" />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">What interests you?</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {preferenceOptions.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-1.5 p-1.5 rounded-md border border-border/50 hover:border-primary/30 cursor-pointer transition-colors text-xs">
                      <Checkbox checked={preferences.includes(opt.id)} onCheckedChange={() => togglePref(opt.id)} className="h-3.5 w-3.5" />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full h-10" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Join the Waitlist
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">No spam. Unsubscribe anytime.</p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;
