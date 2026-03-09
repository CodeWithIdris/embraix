import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
  referralCode?: string;
}

const ShareButtons = ({ title, url, referralCode }: ShareButtonsProps) => {
  const { toast } = useToast();
  const shareUrl = (url || window.location.href) + (referralCode ? `?ref=${referralCode}` : "");
  const encoded = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!" });
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`} target="_blank" rel="noopener noreferrer">
          𝕏
        </a>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer">
          FB
        </a>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noopener noreferrer">
          in
        </a>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" asChild>
        <a href={`https://wa.me/?text=${encodedTitle}%20${encoded}`} target="_blank" rel="noopener noreferrer">
          WA
        </a>
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={copyLink}>
        <Link2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export default ShareButtons;
