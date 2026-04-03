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
  User,
  Settings,
  Users,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationDropdown } from "@/components/news/NotificationDropdown";
import { GlobalSearch, SearchTrigger } from "@/components/GlobalSearch";

import logoGreen from "@/assets/logo-green.png";
import logoWhite from "@/assets/logo-white.png";

const navItems = [
  { label: "Media", href: "/media" },
  { label: "AI", href: "/ai" },
  { label: "Centre", href: "/centre" },
  { label: "Insight", href: "/insight" },
  { label: "Store", href: "/store" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isWriter, isExpert, signOut } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const logo = theme === "dark" ? logoWhite : logoGreen;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      
      <header className="bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Embraix" className="h-8 md:h-9 w-auto" />
            </Link>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground font-medium"
                  onClick={() => navigate(item.href)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Desktop Auth & Theme */}
            <div className="hidden md:flex items-center gap-2">
              <SearchTrigger onClick={() => setIsSearchOpen(true)} />
              <NotificationDropdown />
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
                    {isExpert && (
                      <DropdownMenuItem onClick={() => navigate("/expert-dashboard")} className="cursor-pointer gap-2">
                        <Users className="w-4 h-4" />
                        Expert Panel
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
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
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
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.href); setIsMenuOpen(false); }}
                    className="w-full flex items-center px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </button>
                ))}

                <div className="h-px bg-border/40 my-2" />

                {/* Auth */}
                <div className="flex flex-col gap-2 pt-2">
                  {user ? (
                    <>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/chat"); setIsMenuOpen(false); }}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        AI Chat
                      </Button>
                      {isWriter && (
                        <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/admin"); setIsMenuOpen(false); }}>
                          <Settings className="w-4 h-4 mr-2" />
                          Dashboard
                        </Button>
                      )}
                      {isExpert && (
                        <Button variant="ghost" size="sm" className="justify-start" onClick={() => { navigate("/expert-dashboard"); setIsMenuOpen(false); }}>
                          <Users className="w-4 h-4 mr-2" />
                          Expert Panel
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                        Sign In
                      </Button>
                      <Button variant="hero" size="sm" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
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
      
      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Header;
