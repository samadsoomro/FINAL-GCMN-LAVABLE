import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/layout/Hero";
import HomeSlider from "@/components/home/HomeSlider";
import {
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Search,
  Star,
  Heart,
  Clock,
} from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

interface HomeContent {
  heroHeading?: string;
  heroSubheading?: string;
  heroOverlayText?: string;
  featuresHeading?: string;
  featuresSubheading?: string;
  affiliationsHeading?: string;
  ctaHeading?: string;
  ctaSubheading?: string;
}

interface SliderImage {
  id: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

interface HomeStat {
  id: string;
  number: string;
  label: string;
  iconUrl?: string;
}

interface Affiliation {
  id: string;
  name: string;
  logoUrl: string;
  link: string;
  order: number;
}

interface AffiliationBlock {
  type: "long" | "small";
  items: Affiliation[];
}

const AffiliationsLayout: React.FC<{ affiliations: Affiliation[] }> = ({
  affiliations,
}) => {
  const [logoTypes, setLogoTypes] = useState<Record<string, "long" | "small">>(
    {},
  );

  useEffect(() => {
    affiliations.forEach((aff) => {
      const img = new Image();
      img.src = aff.logoUrl;
      img.onload = () => {
        // Long logos have aspect ratio > 1.8
        const isLong = img.naturalWidth / img.naturalHeight > 1.8;
        setLogoTypes((prev) => ({
          ...prev,
          [aff.id]: isLong ? "long" : "small",
        }));
      };
    });
  }, [affiliations]);

  const blocks: AffiliationBlock[] = [];
  let currentSmallBlock: Affiliation[] = [];

  affiliations.forEach((aff) => {
    const type = logoTypes[aff.id] || "small";

    if (type === "long") {
      if (currentSmallBlock.length > 0) {
        blocks.push({ type: "small", items: currentSmallBlock });
        currentSmallBlock = [];
      }
      blocks.push({ type: "long", items: [aff] });
    } else {
      currentSmallBlock.push(aff);
    }
  });

  if (currentSmallBlock.length > 0) {
    blocks.push({ type: "small", items: currentSmallBlock });
  }

  return (
    <div className="flex flex-col gap-16 md:gap-24 w-full max-w-6xl mx-auto px-4">
      {blocks.map((block, blockIdx) => (
        <div key={blockIdx} className="w-full">
          {block.type === "long" ? (
            <div className="flex justify-center">
              {block.items.map((aff) => (
                <motion.a
                  key={aff.id}
                  href={aff.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full max-w-4xl hover:opacity-95 transition-opacity"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50 group-hover:shadow-md transition-shadow">
                    <img
                      src={aff.logoUrl}
                      alt={aff.name}
                      loading="lazy"
                      className="w-full h-auto object-contain transition-transform group-hover:scale-[1.01]"
                    />
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-12 md:gap-16 lg:gap-24 items-center">
              {block.items.map((aff, itemIdx) => (
                <motion.a
                  key={aff.id}
                  href={aff.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center hover:opacity-90 transition-opacity w-32 md:w-40 lg:w-48"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: itemIdx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center bg-card rounded-full shadow-sm border border-border/50 group-hover:shadow-md transition-all p-4">
                    <img
                      src={aff.logoUrl}
                      alt={aff.name}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                  <span className="mt-4 text-sm font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-center line-clamp-1">
                    {aff.name}
                  </span>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Home: React.FC = () => {
  const [content, setContent] = useState<HomeContent>({});
  const [slider, setSlider] = useState<SliderImage[]>([]);
  const [dbStats, setDbStats] = useState<HomeStat[]>([]);
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const { settings } = useBranding();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/home");
        if (res.ok) {
          const data = await res.json();
          setContent(data.content || {});
          setSlider(data.slider || []);
          setDbStats(data.stats || []);
          setAffiliations(data.affiliations || []);
        }
      } catch (error) {
        console.error("Failed to home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Default Stats configuration to map with DB data or use as fallback
  const defaultStats = [
    {
      icon: <BookOpen size={40} />,
      defaultNumber: "5000+",
      defaultLabel: "Books Available",
      color: "text-pakistan-green",
    },
    {
      icon: <Users size={40} />,
      defaultNumber: "1000+",
      defaultLabel: "Active Students",
      color: "text-pakistan-green-light",
    },
    {
      icon: <Award size={40} />,
      defaultNumber: "500+",
      defaultLabel: "Study Materials",
      color: "text-accent",
    },
    {
      icon: <TrendingUp size={40} />,
      defaultNumber: "95%",
      defaultLabel: "Satisfaction Rate",
      color: "text-pakistan-emerald",
    },
  ];

  // Merge DB stats with default configuration (icons/colors)
  const ICON_MAP: Record<string, React.ReactNode> = {
    BookOpen: <BookOpen size={40} />,
    Users: <Users size={40} />,
    Award: <Award size={40} />,
    TrendingUp: <TrendingUp size={40} />,
    Search: <Search size={40} />,
    Star: <Star size={40} />,
    Heart: <Heart size={40} />,
    Clock: <Clock size={40} />,
  };

  const displayStats =
    dbStats && dbStats.length > 0
      ? dbStats.map((ds, idx) => ({
        number: ds.number,
        label: ds.label,
        iconUrl: ds.iconUrl,
        color:
          (ds as any).color ||
          (idx % 2 === 0
            ? "text-pakistan-green"
            : "text-pakistan-green-light"),
        icon: ICON_MAP[(ds as any).icon] || <BookOpen size={40} />,
      }))
      : defaultStats.map((s) => ({
        number: s.defaultNumber,
        label: s.defaultLabel,
        icon: s.icon,
        color: s.color,
      }));

  const features = [
    {
      title: "Easy Book Borrowing",
      description:
        "Browse our extensive collection and borrow books with just a few clicks. Track your borrowings and due dates easily.",
      emoji: "📚",
    },
    {
      title: "Digital Study Materials",
      description:
        "Access course notes, syllabus, and study guides organized by subjects and semesters.",
      emoji: "📖",
    },
    {
      title: "Rare Books Archive",
      description:
        "Explore our digital archive of rare and historical books with secure viewing technology.",
      emoji: "🏛️",
    },
    {
      title: "Admin Dashboard",
      description:
        "Efficient management system for librarians to handle requests, inventory, and user accounts.",
      emoji: "⚙️",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Hero
        heading={content.heroHeading}
        subheading={content.heroSubheading}
        overlayText={content.heroOverlayText}
      />

      {/* Image Slider Section */}
      {slider.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container px-4 md:px-6">
            <HomeSlider images={slider} />
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {displayStats.map((stat, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6 lg:p-8 bg-secondary rounded-2xl hover:-translate-y-1 hover:shadow-lg transition-all w-[calc(50%-1.5rem)] lg:w-[calc(25%-2rem)] min-w-[160px] max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div
                  className={`mb-4 ${stat.color} flex items-center justify-center h-12 w-12`}
                >
                  {stat.iconUrl ? (
                    <img
                      src={stat.iconUrl}
                      alt={stat.label}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    stat.icon
                  )}
                </div>
                <span className="text-3xl lg:text-4xl font-bold text-primary mb-1">
                  {stat.number}
                </span>
                <span className="text-sm lg:text-base text-muted-foreground">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-secondary">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {content.featuresHeading ||
                `Why Choose ${settings.instituteShortName}?`}
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {content.featuresSubheading ||
                "Discover the features that make our library the perfect learning companion"}
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card p-6 lg:p-8 rounded-2xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* College Affiliations Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {content.affiliationsHeading ||
                "College Affiliations & Authorities"}
            </motion.h2>
          </div>

          {affiliations.length > 0 && (
            <div className="flex flex-col gap-12 max-w-5xl mx-auto">
              <AffiliationsLayout affiliations={affiliations} />
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 gradient-primary text-white">
        <div className="container">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {content.ctaHeading || "Ready to Start Learning?"}
            </h2>
            <p className="text-lg text-white/90 mb-8">
              {content.ctaSubheading ||
                `Join thousands of students who are already using ${settings.instituteShortName} for their academic success.`}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                Create Free Account
              </a>
              <a
                href="/books"
                className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Browse Library
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
