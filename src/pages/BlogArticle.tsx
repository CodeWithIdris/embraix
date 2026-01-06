import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlog, Article } from "@/hooks/useBlog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";

const BlogArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { loadArticles } = useBlog();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticleBySlug(slug);
    }
  }, [slug]);

  const loadArticleBySlug = async (articleSlug: string) => {
    setLoading(true);
    try {
      const articles = await loadArticles({ status: "published" });
      const found = articles.find((a) => a.slug === articleSlug);
      setArticle(found || null);
    } catch (err) {
      console.error("Error loading article:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-background px-4">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Article Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/blog")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Embraix Blog</title>
        <meta
          name="description"
          content={article.excerpt || `Read ${article.title} on Embraix Blog`}
        />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || ""} />
        {article.featured_image && (
          <meta property="og:image" content={article.featured_image} />
        )}
      </Helmet>

      <Header />

      <main className="min-h-screen pt-20 bg-background">
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Featured Image */}
          {article.featured_image && (
            <div className="aspect-video overflow-hidden rounded-xl mb-8">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.category && (
              <Badge variant="secondary">{article.category.name}</Badge>
            )}
            {article.tags?.map((tag) => (
              <Badge key={tag.id} variant="outline">
                #{tag.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
            {article.author?.full_name && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author.full_name}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(
                article.published_at || article.created_at
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-display text-2xl font-bold text-foreground mt-8 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-xl font-semibold text-foreground mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-lg font-semibold text-foreground mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground/90 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 text-foreground/90">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 text-foreground/90">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default BlogArticle;
