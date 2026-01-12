import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageFeedbackProps {
  messageId: string;
  conversationId: string;
  userId: string;
  initialFeedback?: boolean | null;
}

const MessageFeedback = ({ 
  messageId, 
  conversationId, 
  userId,
  initialFeedback 
}: MessageFeedbackProps) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<boolean | null>(initialFeedback ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (isPositive: boolean) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (feedback === isPositive) {
        // Remove feedback
        await supabase
          .from("chat_message_feedback")
          .delete()
          .eq("message_id", messageId)
          .eq("user_id", userId);
        setFeedback(null);
      } else {
        // Upsert feedback
        const { error } = await supabase
          .from("chat_message_feedback")
          .upsert({
            message_id: messageId,
            conversation_id: conversationId,
            user_id: userId,
            is_positive: isPositive,
          }, { onConflict: 'message_id,user_id' });
        
        if (error) throw error;
        setFeedback(isPositive);
        toast({
          title: isPositive ? "Thanks for the feedback! 👍" : "Thanks for letting us know",
          description: "Your feedback helps improve our AI.",
        });
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${feedback === true ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => handleFeedback(true)}
        disabled={isSubmitting}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 w-7 p-0 ${feedback === false ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => handleFeedback(false)}
        disabled={isSubmitting}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default MessageFeedback;
