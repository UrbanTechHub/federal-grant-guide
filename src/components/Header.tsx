import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Programs", href: "/#grants" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Resources", href: "/#resources" },
    { label: "About", href: "/#about" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === "/" && href.startsWith("/#")) {
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToHeroSearch = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* US Government Banner */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-gov py-1.5 flex items-center justify-between">
          <p className="text-xs opacity-90">🇺🇸 An official website of the United States Government</p>
          <a href="tel:1-800-FED-GRANTS" className="hidden sm:flex items-center gap-1 text-xs opacity-90 hover:opacity-100">
            <Phone className="w-3 h-3" />
            1-800-FED-GRANTS
          </a>
        </div>
      </div>

      {/* Red accent stripe */}
      <div className="h-1 bg-secondary" />

      {/* Main Nav */}
      <div className="bg-background/95 backdrop-blur-lg border-b border-border">
        <nav className="container-gov">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Federal Grant" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold font-display text-primary">Federal Grant</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="text-muted-foreground hover:text-secondary px-4 py-2 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={scrollToHeroSearch}>
                <Search className="w-4 h-4" />
                Track
              </Button>
              <Link to="/apply">
                <Button variant="hero" size="sm">
                  Apply Now
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-muted-foreground py-2.5 px-4 hover:bg-muted hover:text-secondary rounded-lg transition-colors"
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4 px-4">
                  <Button variant="outline" size="sm" className="w-full" onClick={scrollToHeroSearch}>
                    <Search className="w-4 h-4" />
                    Track Application
                  </Button>
                  <Link to="/apply" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
