import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowBigUp, MessageCircle } from "lucide-react";
import { NewsPost } from "@/hooks/useNews";

interface TrendingPostsProps {
  posts: NewsPost[];
}

const TrendingPosts = ({ posts }: TrendingPostsProps) => {
  const navigate = useNavigate();

  // Get top 5 posts by vote count
  const trendingPosts = [...posts]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 5);

  if (trendingPosts.length === 0) return null;

  return (
    <Card className="gradient-card border-border/50 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending This Week
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {trendingPosts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => navigate(`/news/${post.id}`)}
            >
              <span className="text-2xl font-bold text-muted-foreground/50 w-6">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowBigUp className="w-3 h-3" />
                    {post.vote_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.comment_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingPosts;
