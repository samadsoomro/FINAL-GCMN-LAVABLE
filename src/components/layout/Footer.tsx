import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useBranding();

  return (
    <footer className="bg-gradient-to-b from-slate-800 to-slate-900 text-white mt-auto">
      <div className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                {settings.instituteShortName}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {settings.footerDescription}
              </p>
              <div className="flex gap-3 pt-2">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent hover:-translate-y-1 transition-all"
                  aria-label="Youtube"
                >
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { to: "/", label: "Home" },
                  { to: "/books", label: "Browse Books" },
                  { to: "/notes", label: "Study Materials" },
                  { to: "/rare-books", label: "Rare Books" },
                  { to: "/about", label: "About Us" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/80 hover:text-accent hover:translate-x-1 inline-block transition-all text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Office Hours & Resources */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Office Hours</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-center gap-2">
                  <Clock size={14} className="text-accent" />
                  <span>Mon–Fri: 9:00 AM – 1:00 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={14} className="text-accent" />
                  <span>Sat: 9:00 AM – 12:00 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span>Sun: Closed</span>
                </li>
              </ul>

              <h4 className="text-lg font-semibold pt-4">Resources</h4>
              <ul className="space-y-2">
                {[
                  { to: "/login", label: "Student Login" },
                  { to: "/register", label: "Register" },
                  { to: "/contact", label: "Contact Us" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-white/80 hover:text-accent hover:translate-x-1 inline-block transition-all text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/80 text-sm">
                  <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{settings.contactAddress}</span>
                </li>
                <li className="flex items-center gap-3 text-white/80 text-sm">
                  <Phone size={18} className="flex-shrink-0" />
                  <span>{settings.contactPhone}</span>
                </li>
                <li className="flex items-center gap-3 text-white/80 text-sm">
                  <Mail size={18} className="flex-shrink-0" />
                  <span>{settings.contactEmail}</span>
                </li>
              </ul>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-primary hover:text-white text-sm mt-2 transition-colors"
              >
                <ExternalLink size={14} />
                View on Google Maps
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="border-t border-white/10 py-6">
        <div className="container">
          <div className="text-center space-y-3">
            <p
              className="text-sm font-bold tracking-wide"
              style={{ color: settings.primaryColor }}
            >
              {settings.creditsText}
            </p>
            <p
              className="text-xs opacity-90 font-medium"
              style={{ color: settings.primaryColor }}
            >
              Contributors: {settings.contributorsText}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm text-center md:text-left">
              © {currentYear} {settings.instituteShortName}. All rights
              reserved.
            </p>
            <p className="text-white/70 text-sm text-center md:text-right">
              {settings.footerTagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
