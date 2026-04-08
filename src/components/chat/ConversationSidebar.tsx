import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MessageSquare, Trash2, X, Pencil, Check } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, title: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

// Group conversations by date
const groupByDate = (conversations: Conversation[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const conv of conversations) {
    const date = new Date(conv.updated_at);
    if (date >= today) groups[0].items.push(conv);
    else if (date >= yesterday) groups[1].items.push(conv);
    else if (date >= weekAgo) groups[2].items.push(conv);
    else groups[3].items.push(conv);
  }

  return groups.filter(g => g.items.length > 0);
};

const ConversationSidebar = ({
  conversations,
  currentConversation,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onClose,
  isMobile = false,
}: ConversationSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleSelect = (id: string) => {
    onSelect(id);
    if (isMobile && onClose) onClose();
  };

  const startRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const confirmRename = () => {
    if (editingId && editTitle.trim() && onRename) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const groups = groupByDate(conversations);

  return (
    <div className="flex flex-col h-full bg-card border-r border-border/50">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-display font-semibold text-foreground text-sm">Chat History</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onCreate} className="h-8 w-8">
            <Plus className="w-4 h-4" />
          </Button>
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-3 py-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        currentConversation === conv.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-secondary/50"
                      }`}
                      onClick={() => handleSelect(conv.id)}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        {editingId === conv.id ? (
                          <div className="flex gap-1">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-6 text-xs px-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") confirmRename();
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); confirmRename(); }}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-xs font-medium text-foreground truncate">
                            {conv.title}
                          </p>
                        )}
                      </div>
                      {editingId !== conv.id && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onRename && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); startRename(conv); }}
                            >
                              <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                          >
                            <Trash2 className="w-2.5 h-2.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
