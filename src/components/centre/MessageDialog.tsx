import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useServiceMessages } from "@/hooks/useServiceMessages";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MessageDialogProps {
  recipientId: string;
  recipientName: string;
  providerId?: string;
}

const MessageDialog = ({ recipientId, recipientName, providerId }: MessageDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sendMessage } = useServiceMessages();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!user || !content.trim()) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        sender_id: user.id,
        recipient_id: recipientId,
        provider_id: providerId,
        subject: subject || null,
        content: content.trim(),
      });
      setSubject("");
      setContent("");
      setOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" onClick={() => navigate("/auth")}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Sign in to Message
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Message {recipientName}</DialogTitle>
          <DialogDescription>
            Send a message to inquire about their services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Input
              placeholder="Subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Write your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleSend}
            disabled={!content.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
