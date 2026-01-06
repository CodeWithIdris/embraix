import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlog, Article, Category, Tag } from "@/hooks/useBlog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Calendar, User, ArrowRight, Loader2, FileText } from "lucide-react";

const Blog = () => {
  const { categories, tags, loading, loadArticles } = useBlog();
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadPublishedArticles();
  }, []);

  const loadPublishedArticles = async () => {
    const data = await loadArticles({ status: "published" });
    setArticles(data);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || article.category_id === selectedCategory;

    const matchesTag =
      !selectedTag || article.tags?.some((t) => t.id === selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  return (
    <>
      <Helmet>
        <title>Blog | Embraix - Clean Energy Insights</title>
        <meta
          name="description"
          content="Explore articles about clean energy, EVs, solar power, and sustainable technology from Embraix experts."
        />
      </Helmet>

      <Header />

      <main className="min-h-screen pt-20 bg-background">
        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Clean Energy <span className="text-gradient">Insights</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Stay informed with the latest articles on renewable energy, electric
              vehicles, and sustainable technology trends.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-12 h-12 bg-secondary/50"
              />
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 pb-8">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </Badge>
                ))}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 border-l border-border/50 pl-4">
                  {tags.slice(0, 6).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTag === tag.id ? "secondary" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() =>
                        setSelectedTag(selectedTag === tag.id ? null : tag.id)
                      }
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {(selectedCategory || selectedTag || searchQuery) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="px-4 pb-20">
          <div className="container mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  No articles found
                </h2>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedCategory || selectedTag
                    ? "Try adjusting your filters"
                    : "Check back soon for new content"}
                </p>
                {(searchQuery || selectedCategory || selectedTag) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => (
                  <Link key={article.id} to={`/blog/${article.slug}`}>
                    <Card className="gradient-card border-border/50 h-full hover:border-primary/30 transition-colors group">
                      {article.featured_image && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.category && (
                            <Badge variant="secondary" className="text-xs">
                              {article.category.name}
                            </Badge>
                          )}
                          {article.tags?.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              #{tag.name}
                            </Badge>
                          ))}
                        </div>

                        <h2 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>

                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            {article.author?.full_name && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {article.author.full_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.published_at || article.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Blog;
