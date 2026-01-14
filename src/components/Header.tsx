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
  Rocket,
  Wrench,
  Star,
  BookOpen,
  Megaphone,
  Mail,
  User,
  Settings,
  Users,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Store,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import logo from "@/assets/logo.jpg";

// New navigation structure
const navGroups = [
  {
    label: "Media",
    items: [
      { icon: Newspaper, label: "News / Reports", href: "/news", description: "Community news & reports" },
      { icon: Rocket, label: "Projects & DIY", href: "/media/projects", description: "Projects and DIY guides" },
      { icon: Star, label: "Reviews & Guides", href: "/media/reviews", description: "Product reviews & tutorials" },
      { icon: Megaphone, label: "Promotions", href: "/promotions", description: "Deals and promotions" },
    ]
  },
  {
    label: "Consultation",
    items: [
      { icon: Sparkles, label: "AI Consult", href: "/chat", description: "Free AI-powered guidance" },
      { icon: Users, label: "Consult an Expert", href: "/consult-expert", description: "Connect with specialists" },
    ]
  },
  {
    label: "Newsletter",
    items: [
      { icon: Mail, label: "Subscribe", href: "/newsletter", description: "Get latest updates" },
      { icon: FileText, label: "Creators", href: "/blog", description: "Content creators & blog" },
    ]
  },
  {
    label: "Centre",
    items: [
      { icon: HelpCircle, label: "Help & Support", href: "/centre/support", description: "FAQs and contact" },
      { icon: GraduationCap, label: "Learning", href: "/centre/learning", description: "Tutorials & resources" },
      { icon: Users, label: "Community", href: "/centre/community", description: "Forums & events" },
    ]
  },
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

  const handleNavClick = (href: string) => {
    // Check if auth required
    if (href.startsWith("/chat") && !user) {
      navigate("/auth");
    } else {
      navigate(href);
    }
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
                      onClick={() => handleNavClick(item.href)}
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

            {/* Store */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/store")}
            >
              <Store className="w-4 h-4 mr-1.5" />
              Store
            </Button>
          </nav>

          {/* Desktop Auth & Theme */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            
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
                  <ThemeToggle variant="menu" />
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
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
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
                          onClick={() => { handleNavClick(item.href); setIsMenuOpen(false); }}
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

              {/* Store */}
              <button
                onClick={() => { navigate("/store"); setIsMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                Store
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
                      onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
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
