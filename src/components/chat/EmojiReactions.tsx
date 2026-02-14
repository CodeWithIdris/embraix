import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

interface EmojiReactionsProps {
  messageId: string;
}

const EMOJIS = ["👍", "❤️", "😊", "🔥", "💡", "🎯", "👏", "🤔"];

const EmojiReactions = ({ messageId }: EmojiReactionsProps) => {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  const toggleReaction = (emoji: string) => {
    setReactions(prev => {
      const count = prev[emoji] || 0;
      if (count > 0) {
        const next = { ...prev };
        delete next[emoji];
        return next;
      }
      return { ...prev, [emoji]: 1 };
    });
    setOpen(false);
  };

  const activeEmojis = Object.entries(reactions).filter(([, count]) => count > 0);

  return (
    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
      {activeEmojis.map(([emoji]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          {emoji}
        </button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <SmilePlus className="w-3.5 h-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" side="top" align="start">
          <div className="flex gap-1">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={`text-lg p-1 rounded hover:bg-secondary transition-colors ${
                  reactions[emoji] ? "bg-primary/10" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiReactions;
