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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Sparkles, Check, Zap } from "lucide-react";

const WAITLIST_JOINED_KEY = "embraix_waitlist_joined";

const WaitlistPopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Don't show if user is logged in or already joined
    if (user) return;
    const joined = localStorage.getItem(WAITLIST_JOINED_KEY);
    if (joined) return;

    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [user]);

  // Hide if user logs in while popup is open
  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("waitlist_users")
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        })
        .select("referral_code")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast({ title: "You're already on the waitlist! 🎉" });
          localStorage.setItem(WAITLIST_JOINED_KEY, "1");
          setOpen(false);
        } else throw error;
      } else {
        setSubmitted(true);
        localStorage.setItem(WAITLIST_JOINED_KEY, "1");

        try {
          await supabase.functions.invoke("send-waitlist-welcome", {
            body: { email: email.trim().toLowerCase(), name: name.trim() },
          });
        } catch {}

        setTimeout(() => setOpen(false), 2500);
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden rounded-2xl border-primary/20">
        {submitted ? (
          <div className="text-center py-10 px-6">
            <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              You're in! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">
              We'll notify you when exciting things launch.
            </p>
          </div>
        ) : (
          <>
            {/* Accent header strip */}
            <div className="gradient-primary px-6 py-5 text-center">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <h2 className="font-display text-lg font-bold text-primary-foreground">
                Get Early Access
              </h2>
              <p className="text-xs text-primary-foreground/80 mt-1">
                AI insights · Expert consultations · Energy tools
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="h-10"
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="h-10"
              />
              <Button
                type="submit"
                variant="hero"
                className="w-full h-10"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Join the Waitlist
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistPopup;
