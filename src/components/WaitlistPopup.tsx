import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Check } from "lucide-react";

const WAITLIST_JOINED_KEY = "embraix_waitlist_joined";
const WAITLIST_POPUP_SHOWN_KEY = "embraix_waitlist_popup_shown";

const preferenceOptions = [
  { id: "ai", label: "AI Insights" },
  { id: "news", label: "Clean Energy News" },
  { id: "expert", label: "Expert Consultation" },
  { id: "reports", label: "Industry Reports" },
  { id: "promotions", label: "Promotions & Deals" },
  { id: "diy", label: "DIY Guides" },
  { id: "tech", label: "Energy Technology Updates" },
];

const WaitlistPopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already joined or we've shown the popup this session
    const joined = localStorage.getItem(WAITLIST_JOINED_KEY);
    
    if (!joined) {
      // Show popup after a brief delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("waitlist_users")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          country: country.trim() || null,
          preferences: preferences.length > 0 ? preferences : null,
        })
        .select("referral_code")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "You're already on the waitlist!",
            description: "We'll keep you updated.",
          });
          localStorage.setItem(WAITLIST_JOINED_KEY, "1");
          setOpen(false);
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        localStorage.setItem(WAITLIST_JOINED_KEY, "1");
        toast({ title: "Welcome to the Embraix waitlist!" });

        // Send welcome email
        try {
          await supabase.functions.invoke("send-waitlist-welcome", {
            body: { email: email.trim().toLowerCase(), name: name.trim() },
          });
        } catch (emailErr) {
          console.error("Failed to send welcome email:", emailErr);
        }

        // Close popup after showing success
        setTimeout(() => setOpen(false), 2000);
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't set joined key if closing without submitting - popup will show again next visit
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              You're on the list!
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll keep you updated on Embraix launches and updates.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <DialogTitle className="font-display text-xl">
                Join the Embraix Waitlist
              </DialogTitle>
              <DialogDescription className="text-sm">
                Get early access to AI insights, clean energy news, expert
                consultations and new platform tools.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="popup-name">Name *</Label>
                <Input
                  id="popup-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-email">Email *</Label>
                <Input
                  id="popup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="popup-country">Country (optional)</Label>
                <Input
                  id="popup-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Nigeria"
                />
              </div>

              <div className="space-y-2">
                <Label>What interests you?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {preferenceOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/40 cursor-pointer transition-colors text-sm"
                    >
                      <Checkbox
                        checked={preferences.includes(option.id)}
                        onCheckedChange={() => togglePreference(option.id)}
                      />
                      <span className="text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                )}
                Join Waitlist
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;
