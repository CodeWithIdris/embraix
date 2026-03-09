import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquareHeart, Bug, Lightbulb, HelpCircle, Send, Loader2, CheckCircle2 } from "lucide-react";

type FeedbackType = "bug" | "suggestion" | "question" | "other";

const feedbackTypes = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-500" },
  { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-yellow-500" },
  { value: "question", label: "Question", icon: HelpCircle, color: "text-blue-500" },
  { value: "other", label: "Other", icon: MessageSquareHeart, color: "text-purple-500" },
];

export const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your feedback message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store feedback in notifications table (admin will see it)
      const { error } = await supabase.from("notifications").insert({
        user_id: user?.id || "00000000-0000-0000-0000-000000000000", // Anonymous fallback
        type: "feedback",
        title: `Feedback: ${feedbackTypes.find(t => t.value === feedbackType)?.label}`,
        message: message.trim(),
        reference_type: "feedback",
        reference_id: feedbackType,
      });

      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setMessage("");
        setFeedbackType("suggestion");
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-20 right-4 z-40 shadow-lg gap-2 bg-background hover:bg-muted"
      >
        <MessageSquareHeart className="w-4 h-4" />
        <span className="hidden sm:inline">Feedback</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          {isSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank you!</h3>
              <p className="text-muted-foreground">Your feedback has been submitted.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription>
                  Help us improve Embraix. Your feedback is valuable.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Feedback Type</Label>
                  <RadioGroup
                    value={feedbackType}
                    onValueChange={(v) => setFeedbackType(v as FeedbackType)}
                    className="grid grid-cols-2 gap-2"
                  >
                    {feedbackTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <Label
                          key={type.value}
                          htmlFor={type.value}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            feedbackType === type.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                          <Icon className={`w-4 h-4 ${type.color}`} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Your Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === "bug"
                        ? "Describe the bug and steps to reproduce it..."
                        : feedbackType === "suggestion"
                        ? "Share your idea or suggestion..."
                        : feedbackType === "question"
                        ? "What would you like to know?"
                        : "Your feedback..."
                    }
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {!user && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave your email if you'd like us to follow up.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 gap-2">
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Submit
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
