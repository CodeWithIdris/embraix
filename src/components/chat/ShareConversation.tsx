import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Copy, Check, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ShareConversationProps {
  messages: Message[];
  title?: string;
}

const ShareConversation = ({ messages, title = "Conversation" }: ShareConversationProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formatAsText = () => {
    return messages
      .map(m => `${m.role === "user" ? "You" : "Embraix AI"}: ${m.content}`)
      .join("\n\n---\n\n");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatAsText());
    setCopied(true);
    toast({ title: "Copied!", description: "Conversation copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formatAsText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Conversation saved as text file." });
  };

  if (messages.length === 0) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Share2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto rounded-lg bg-secondary/50 p-3 text-sm space-y-3">
            {messages.slice(0, 6).map((m, i) => (
              <div key={i} className="space-y-1">
                <span className="text-xs font-semibold text-primary">
                  {m.role === "user" ? "You" : "Embraix AI"}
                </span>
                <p className="text-foreground/80 line-clamp-3">{m.content}</p>
              </div>
            ))}
            {messages.length > 6 && (
              <p className="text-xs text-muted-foreground">...and {messages.length - 6} more messages</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareConversation;
