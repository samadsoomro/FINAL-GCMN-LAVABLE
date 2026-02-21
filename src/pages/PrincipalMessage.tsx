import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useBranding } from "@/contexts/BrandingContext";

interface PrincipalData {
  name: string;
  message: string;
  imageUrl?: string;
}

const PrincipalMessage: React.FC = () => {
  const [data, setData] = useState<PrincipalData | null>(null);
  const { settings } = useBranding();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/principal");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch principal message", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Fallback data if DB is empty
  const principal = data?.name
    ? data
    : {
        name: "Principal Name",
        message: `Welcome to ${settings.instituteShortName} Library. We are dedicated to providing the best educational resources for our students.`,
        imageUrl: null,
      };

  return (
    <motion.div
      className="min-h-screen pt-24 pb-12 pakistan-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container px-4 md:px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Principal's Message
            </h1>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-muted/30 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/50">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl mb-6 bg-white">
                    {principal.imageUrl ? (
                      <img
                        src={principal.imageUrl}
                        alt={principal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-center text-foreground">
                    {principal.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mt-1">
                    Principal, {settings.instituteShortName}
                  </p>
                </div>

                <div className="md:w-2/3 p-8 md:p-12 relative">
                  <Quote className="absolute top-8 left-8 text-primary/10 w-16 h-16 -z-10" />
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground italic">
                      "{principal.message}"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrincipalMessage;
