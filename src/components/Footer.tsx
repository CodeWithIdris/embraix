import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Mail, ArrowRight, Twitter, Linkedin, Youtube, Github } from "lucide-react";
import logo from "@/assets/logo.jpg";

const footerLinks = {
  Media: [
    { label: "News", href: "/media/news" },
    { label: "Reports", href: "/media/reports" },
    { label: "Analysis", href: "/media/analysis" },
    { label: "Reviews", href: "/media/reviews" },
    { label: "DIY Guides", href: "/media/diy-guides" },
  ],
  Platform: [
    { label: "AI Consult", href: "/chat" },
    { label: "Newsletter", href: "/newsletter" },
    { label: "Promotions", href: "/promotions" },
    { label: "Centre", href: "#features" },
    { label: "Insight", href: "#features" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Partners", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Github, href: "#", label: "GitHub" },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden bg-background">
      {/* Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Stay Updated</span>
          </div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Get the Latest in Sustainable Tech
          </h3>
          <p className="text-muted-foreground mb-6">
            Subscribe to our newsletter for weekly insights on clean energy, EVs, and smart technologies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-secondary/50 border-border/50 focus:border-primary"
            />
            <Button variant="hero" onClick={() => navigate("/newsletter")}>
              Subscribe
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <img src={logo} alt="Embraix" className="h-8 mb-4" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Advancing sustainable technology across Africa and the world.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Embraix. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 text-primary" />
            <span>Building a sustainable future, one innovation at a time</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
