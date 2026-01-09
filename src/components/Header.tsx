import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  X, 
  LogOut, 
  MessageSquare, 
  ChevronDown,
  Newspaper,
  FileText,
  BarChart3,
  Star,
  Wrench,
  BookOpen,
  Rocket,
  Megaphone,
  Mail,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpg";

// Grouped navigation items
const navGroups = [
  {
    label: "News",
    items: [
      { icon: Newspaper, label: "Community News", href: "/news", description: "Community submitted posts" },
      { icon: FileText, label: "Reports", href: "/media/reports", description: "In-depth market analysis" },
      { icon: BarChart3, label: "Analysis", href: "/media/analysis", description: "Expert evaluations" },
    ]
  },
  {
    label: "Reviews & Guides",
    items: [
      { icon: Star, label: "Reviews", href: "/media/reviews", description: "Product assessments" },
      { icon: Wrench, label: "DIY Guides", href: "/media/diy-guides", description: "Hands-on tutorials" },
      { icon: BookOpen, label: "Tutorials", href: "/media/tutorials", description: "Educational resources" },
    ]
  },
  {
    label: "Projects",
    items: [
      { icon: Rocket, label: "Projects", href: "/media/projects", description: "Case studies & showcases" },
    ]
  }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { user, isWriter, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleGroup = (label: string) => {
    setExpandedGroup(expandedGroup === label ? null : label);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Embraix" className="h-8 md:h-9 w-auto" />
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
            {/* Grouped Dropdowns */}
            {navGroups.map((group) => (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    {group.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-card border-border shadow-lg z-50">
                  {group.items.map((item) => (
                    <DropdownMenuItem 
                      key={item.label}
                      onClick={() => navigate(item.href)}
                      className="cursor-pointer gap-3 py-2.5"
                    >
                      <item.icon className="w-4 h-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Blog */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/blog")}
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Blog
            </Button>

            {/* Promotions */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/promotions")}
            >
              <Megaphone className="w-4 h-4 mr-1.5" />
              Promotions
            </Button>

            {/* Newsletter */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/newsletter")}
            >
              <Mail className="w-4 h-4 mr-1.5" />
              Newsletter
            </Button>

            {/* AI Consult */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(user ? "/chat" : "/auth")}
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              AI Consult
            </Button>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-lg z-50">
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/chat")} className="cursor-pointer gap-2">
                    <MessageSquare className="w-4 h-4" />
                    AI Chat
                  </DropdownMenuItem>
                  {isWriter && (
                    <DropdownMenuItem onClick={() => navigate("/admin")} className="cursor-pointer gap-2">
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {/* Grouped Sections */}
              {navGroups.map((group) => (
                <div key={group.label} className="py-1">
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <span>{group.label}</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedGroup === group.label ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {expandedGroup === group.label && (
                    <div className="ml-3 mt-1 space-y-1 animate-fade-in">
                      {group.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { navigate(item.href); setIsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-lg transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-primary" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="h-px bg-border/40 my-2" />

              {/* Standalone Items */}
              <button
                onClick={() => { navigate("/blog"); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Blog
              </button>
              <button
                onClick={() => { navigate("/promotions"); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <Megaphone className="w-4 h-4 text-primary" />
                Promotions
              </button>
              <button
                onClick={() => { navigate("/newsletter"); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4 text-primary" />
                Newsletter
              </button>
              <button
                onClick={() => { navigate(user ? "/chat" : "/auth"); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-primary" />
                AI Consult
              </button>

              <div className="h-px bg-border/40 my-2" />

              {/* Auth */}
              <div className="flex flex-col gap-2 pt-2">
                {user ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                      onClick={() => { navigate("/chat"); setIsMenuOpen(false); }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      AI Chat
                    </Button>
                    {isWriter && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="justify-start"
                        onClick={() => { navigate("/admin"); setIsMenuOpen(false); }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="hero" 
                      size="sm"
                      onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;