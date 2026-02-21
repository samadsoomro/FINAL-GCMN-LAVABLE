import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LogOut,
  Shield,
  CreditCard,
  Home,
  Heart,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import collegeLogo from "@/assets/images/college-logo.png";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, isLibraryCard, logout } = useAuth();
  const { settings } = useBranding();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/blog", label: "Blog" },
    { path: "/books", label: "Books" },
    { path: "/notes", label: "Notes" },
    { path: "/rare-books", label: "Rare Books" },
    { path: "/events", label: "Events" },
    { path: "/notifications", label: "Notifications" },
    { path: "/library-card", label: "Library Card" },
    {
      label: "About",
      children: [
        { path: "/history", label: "History of College" },
        { path: "/principal-message", label: "Principal’s Message" },
        { path: "/faculty", label: "Faculty & Staff" },
      ],
    },
    { path: "/contact", label: "Contact" },
  ];

  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const displayLinks = isAdminRoute ? [] : navLinks;

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/98 backdrop-blur-md shadow-[0_2px_8px_hsl(0_0%_0%/0.04)] border-b border-border"
          : "bg-gradient-to-b from-card to-background border-b border-border/50"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <nav className="flex items-center justify-between py-4 gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:scale-[1.02] transition-transform"
          >
            <img
              src={settings.navbarLogo || collegeLogo}
              alt={`${settings.instituteShortName} College Logo`}
              className="w-12 h-12 object-contain rounded-lg bg-white p-1 shadow-sm border border-primary/20"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary leading-tight">
                {settings.instituteShortName}
              </span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                {settings.instituteFullName}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center justify-center flex-1 gap-6">
            {isAdminRoute && isAdmin && (
              <li>
                <Link
                  to="/"
                  className="relative font-medium transition-colors py-2 flex items-center gap-1 text-sm text-foreground hover:text-primary"
                  title="Back to Home"
                >
                  <Home size={14} />
                  Home
                </Link>
              </li>
            )}
            {!isAdminRoute &&
              displayLinks.map((link) => (
                <li key={link.label} className="relative group">
                  {link.children ? (
                    <div
                      onMouseEnter={() => setHoveredMenu(link.label)}
                      onMouseLeave={() => setHoveredMenu(null)}
                      className="relative"
                    >
                      <button
                        className={`font-medium transition-colors py-2 flex items-center gap-1 text-sm text-foreground hover:text-primary ${hoveredMenu === link.label ? "text-primary" : ""}`}
                      >
                        {link.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${hoveredMenu === link.label ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence>
                        {hoveredMenu === link.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-48"
                          >
                            <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden p-1">
                              {link.children.map((child) => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={link.path!}
                      className={`relative font-medium transition-colors py-2 flex items-center gap-1 text-sm ${
                        location.pathname === link.path
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                      {location.pathname === link.path && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                          layoutId="navbar-indicator"
                        />
                      )}
                    </Link>
                  )}
                </li>
              ))}

            {/* Admin Secret Menu (Desktop) */}
            {!isAdminRoute && isAdmin && (
              <li>
                <Link to="/admin-dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 font-bold flex items-center gap-1"
                  >
                    <Shield size={14} />
                    Admin Panel
                  </Button>
                </Link>
              </li>
            )}
          </ul>

          {/* Theme Toggle, Library Card, Donate & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {!isAdminRoute && !isAdmin && (
              <>
                <Link to="/library-card">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    title="Library Card"
                  >
                    <CreditCard size={18} />
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                    title="Support Us"
                  >
                    <Heart size={18} className="fill-current" />
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <User size={18} className="text-primary" />
                  <span className="text-sm font-medium">
                    {isLibraryCard
                      ? user.name || user.email?.split("@")[0]
                      : profile?.full_name ||
                        user.email?.split("@")[0] ||
                        "User"}
                  </span>
                  {isAdmin && (
                    <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                      Admin
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Theme Toggle & Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            {!isAdminRoute && !isAdmin && (
              <>
                <Link to="/library-card">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/50 text-primary"
                    title="Library Card"
                  >
                    <CreditCard size={18} />
                  </Button>
                </Link>
                <Link to="/donate">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-primary/50 text-primary"
                    title="Support Us"
                  >
                    <Heart size={18} className="fill-current" />
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-primary hover:text-primary/80"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={24} className="text-primary" />
              ) : (
                <Menu size={24} className="text-primary" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-border overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="max-h-[80vh] overflow-y-auto">
                <ul className="py-4 space-y-2">
                  {/* Admin Secret Menu (Mobile) */}
                  {!isAdminRoute && isAdmin && (
                    <li className="px-4 pb-2">
                      <Link
                        to="/admin-dashboard"
                        className="flex items-center gap-3 p-3 bg-primary text-primary-foreground rounded-lg font-bold shadow-sm"
                      >
                        <Shield size={18} />
                        Admin Dashboard
                      </Link>
                    </li>
                  )}

                  {isAdminRoute && isAdmin && (
                    <li>
                      <Link
                        to="/"
                        className="block px-4 py-3 rounded-lg transition-colors hover:bg-secondary flex items-center gap-2"
                        title="Back to Home"
                      >
                        <Home size={16} />
                        Home
                      </Link>
                    </li>
                  )}
                  {!isAdminRoute &&
                    displayLinks.map((link) => (
                      <li key={link.label}>
                        {link.children ? (
                          <div className="space-y-1">
                            <div className="px-4 py-2 font-medium text-primary/80 text-sm uppercase tracking-wider">
                              {link.label}
                            </div>
                            {link.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`block px-4 py-3 ml-4 rounded-lg transition-colors flex items-center gap-2 border-l border-border/50 ${
                                  location.pathname === child.path
                                    ? "text-primary font-medium bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <Link
                            to={link.path!}
                            className={`block px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                              location.pathname === link.path
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-secondary"
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}

                  <li className="pt-4 border-t border-border">
                    {user ? (
                      <div className="space-y-2 px-4">
                        <div className="flex items-center gap-2 py-2">
                          <User size={18} className="text-primary" />
                          <span className="font-medium">
                            {isLibraryCard
                              ? user.name || user.email?.split("@")[0]
                              : profile?.full_name ||
                                user.email?.split("@")[0] ||
                                "User"}
                          </span>
                          {isAdmin && (
                            <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 px-4">
                        <Link to="/login" className="flex-1">
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link to="/register" className="flex-1">
                          <Button className="w-full">Register</Button>
                        </Link>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
