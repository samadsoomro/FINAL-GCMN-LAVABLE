import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import { Card, CardContent } from "@/components/ui/card";
import historyImage from "@/assets/images/history-college.jpg";

interface HistoryHeader {
  title: string;
  subtitle: string;
}

interface HistorySection {
  id: string;
  title: string;
  description: string;
  iconName: string;
  imageUrl?: string;
  layoutType: "grid" | "full";
  displayOrder: number;
}

interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
}

const History: React.FC = () => {
  const { settings } = useBranding();
  const [header, setHeader] = useState<HistoryHeader | null>(null);
  const [sections, setSections] = useState<HistorySection[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const [pageRes, sectionsRes, galleryRes] = await Promise.all([
          fetch("/api/history/page"),
          fetch("/api/history/sections"),
          fetch("/api/history/gallery"),
        ]);

        if (pageRes.ok) setHeader(await pageRes.json());
        if (sectionsRes.ok) setSections(await sectionsRes.json());
        if (galleryRes.ok) setGallery(await galleryRes.json());
      } catch (error) {
        console.error("Failed to fetch history data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  const IconComponent = ({
    name,
    size = 24,
  }: {
    name: string;
    size?: number;
  }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.BookOpen;
    return <Icon size={size} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen pt-24 pb-12 pakistan-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container px-4 md:px-6">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {header?.title || `History of ${settings.instituteShortName}`}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {header?.subtitle ||
                "A legacy of academic excellence spanning over seven decades."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sections
              .filter((s) => s.layoutType === "grid")
              .map((section) => (
                <Card
                  key={section.id}
                  className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <IconComponent name={section.iconName} size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {section.description}
                    </p>
                    {section.imageUrl && (
                      <div className="mt-4 rounded-md overflow-hidden aspect-video">
                        <img
                          src={section.imageUrl}
                          alt={section.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>

          {sections
            .filter((s) => s.layoutType === "full")
            .map((section) => (
              <Card
                key={section.id}
                className="bg-card/50 backdrop-blur-sm border-primary/10"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <IconComponent name={section.iconName} size={24} />
                      </div>
                      <h3 className="text-2xl font-semibold">
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                    {section.imageUrl ? (
                      <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border-2 border-primary/10 shadow-lg">
                        <img
                          src={section.imageUrl}
                          alt={section.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      // Fallback default image for 'Library' section or similar if no image provided
                      section.title.toLowerCase().includes("library") && (
                        <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border-2 border-primary/10 shadow-lg">
                          <img
                            src={historyImage}
                            alt={`Historic ${settings.instituteShortName} Campus`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

          {/* Gallery Section */}
          {gallery.length > 0 && (
            <div className="space-y-6 pt-8">
              <h2 className="text-3xl font-bold text-center">
                Historic Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="group relative aspect-video rounded-lg overflow-hidden border border-primary/10 shadow-md"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "Gallery"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default History;
