import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, FileText, Archive, ArrowRight } from "lucide-react";
import PakistanMap from "@/components/icons/PakistanMap";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/contexts/BrandingContext";

interface HeroProps {
  heading?: string;
  subheading?: string;
  overlayText?: string;
}

const Hero: React.FC<HeroProps> = ({ heading, subheading, overlayText }) => {
  const { settings } = useBranding();
  const defaultHeading =
    settings.instituteFullName || "DJ GOV. SCIENCE COLLEGE";
  const defaultSubheading =
    "Access thousands of books, research papers, and digital resources to fuel your academic journey.";

  const features = [
    {
      icon: <BookOpen size={32} />,
      title: "Book Borrowing",
      description: "Access thousands of books with easy borrowing system",
      link: "/books",
    },
    {
      icon: <FileText size={32} />,
      title: "Notes & Syllabus",
      description: "Download study materials and course notes",
      link: "/notes",
    },
    {
      icon: <Archive size={32} />,
      title: "Rare Books",
      description: "Explore our digital archive of rare collections",
      link: "/rare-books",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center py-24 lg:py-32 overflow-hidden pakistan-bg">
      {/* Animated Geometric Pattern Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Pattern Layer 1 - Slow movement */}
        <svg
          className="absolute w-full h-full animate-[drift_40s_ease-in-out_infinite]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="heroPattern1"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="50"
                cy="50"
                r="2"
                fill="currentColor"
                opacity="0.12"
              />
              <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.12" />
              <circle
                cx="100"
                cy="0"
                r="2"
                fill="currentColor"
                opacity="0.12"
              />
              <circle
                cx="0"
                cy="100"
                r="2"
                fill="currentColor"
                opacity="0.12"
              />
              <circle
                cx="100"
                cy="100"
                r="2"
                fill="currentColor"
                opacity="0.12"
              />
              <path
                d="M 50 25 L 60 50 L 50 75 L 40 50 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.08"
              />
              <path
                d="M 25 50 L 50 60 L 75 50 L 50 40 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.08"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#heroPattern1)"
            className="text-primary"
          />
        </svg>

        {/* Animated Pattern Layer 2 - Medium movement */}
        <svg
          className="absolute w-full h-full animate-[drift_30s_ease-in-out_infinite_reverse]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="heroPattern2"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="40"
                y1="0"
                x2="40"
                y2="80"
                stroke="currentColor"
                strokeWidth="0.3"
                opacity="0.06"
              />
              <line
                x1="0"
                y1="40"
                x2="80"
                y2="40"
                stroke="currentColor"
                strokeWidth="0.3"
                opacity="0.06"
              />
              <circle
                cx="40"
                cy="40"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.4"
                opacity="0.05"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#heroPattern2)"
            className="text-primary"
          />
        </svg>

        {/* Animated Pattern Layer 3 - Fast movement with scale */}
        <svg
          className="absolute w-full h-full animate-[pulse_20s_ease-in-out_infinite]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="heroPattern3"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 30 L 75 60 L 60 90 L 45 60 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                opacity="0.04"
              />
              <circle
                cx="60"
                cy="60"
                r="3"
                fill="currentColor"
                opacity="0.08"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#heroPattern3)"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Pakistan Map Background */}
      <div className="absolute top-[10%] right-[-10%] w-1/2 max-w-xl pointer-events-none text-primary">
        <PakistanMap opacity={0.03} />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Main Content */}
          <motion.div
            className="flex flex-col gap-6 animate-[heroFloat_6s_ease-in-out_infinite]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center w-fit px-4 py-2 rounded-full border-2 border-primary bg-primary/5 hover:scale-105 transition-transform duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                {overlayText || "Welcome to Digital Learning"}
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight hover:scale-[1.02] transition-transform duration-500">
              <span className="text-gradient">{heading || defaultHeading}</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl hover:translate-y-[-4px] transition-transform duration-300">
              {subheading || defaultSubheading}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/books">
                <Button
                  size="lg"
                  className="gap-2 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                >
                  Explore Books
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/events">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                >
                  Events
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="flex flex-col gap-4 animate-[heroFloat_8s_ease-in-out_infinite_0.5s]"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Link to={feature.link}>
                  <div className="group flex items-center gap-4 p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30 hover:-translate-y-2 hover:scale-105 transition-all duration-500">
                    <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
