import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Pin, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  title: string;
  message?: string;
  image?: string;
  pin: boolean;
  status: string;
  createdAt: string;
}

const renderMessageWithLinks = (text: string) => {
  // Regex to detect URLs:
  // 1. Starts with http:// or https:// (captured in group 1)
  // 2. OR starts with www. (captured in group 2)
  // 3. OR looks like a domain name with common TLDs (captured in group 3)
  // The regex includes common TLDs to avoid matching regular words.
  // It purposefully avoids matching email addresses by looking for space or start of line before domain-like patterns if needed,
  // but here we use a simplified approach that should work for the requested "biek.edu.pk" case.
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|edu|gov|pk|io|co|us)[^\s]*)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  // We create a fresh regex object to avoid issues with state if reused (though purely local here)
  const regex = new RegExp(urlRegex);

  while ((match = regex.exec(text)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const url = match[0];
    let href = url;
    // ensure protocol
    if (!href.startsWith("http://") && !href.startsWith("https://")) {
      href = `https://${href}`;
    }

    elements.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline font-bold break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>,
    );

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : text;
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen pt-20 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gradient-to-br from-primary/5 to-background py-16 text-center">
        <div className="container">
          <motion.h1
            className="text-4xl lg:text-5xl font-black text-pakistan-green mb-4 flex items-center justify-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Bell className="w-10 h-10 lg:w-12 lg:h-12 text-pakistan-green" />
            Notifications
          </motion.h1>
          <motion.p
            className="text-xl text-neutral-600 max-w-2xl mx-auto font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Official announcements, news, and updates from College
          </motion.p>
        </div>
      </div>

      <div className="container py-12 max-w-5xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Bell className="w-12 h-12 text-primary/20 animate-bounce mb-4" />
            <p className="text-neutral-400 font-medium">Loading updates...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-6">
            {notifications.map((notification, index) => {
              const isImageOnly = notification.image && !notification.message;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    className={`overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ${notification.pin ? "ring-2 ring-primary/20 bg-primary/5" : "bg-white"}`}
                  >
                    <div
                      className={`flex ${isImageOnly ? "flex-col" : "flex-col md:flex-row"}`}
                    >
                      {!isImageOnly && notification.image && (
                        <div className="md:w-1/3 min-h-[200px] md:min-h-0 relative group overflow-hidden">
                          <img
                            src={notification.image}
                            alt={notification.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div
                        className={`p-6 md:p-8 flex-1 flex flex-col justify-center ${!isImageOnly && notification.image ? "md:w-2/3" : "w-full"}`}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {notification.pin && (
                            <span className="bg-pakistan-green text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                              <Pin size={10} className="fill-white" /> Pinned
                            </span>
                          )}
                          <span className="text-pakistan-green/80 text-xs font-bold flex items-center gap-1 uppercase tracking-wider">
                            <Clock size={12} />{" "}
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString(undefined, {
                              dateStyle: "long",
                            })}
                          </span>
                        </div>

                        <h2 className="text-2xl font-bold text-neutral-800 mb-3 leading-tight">
                          {notification.title}
                        </h2>

                        {isImageOnly && notification.image && (
                          <div className="w-full mt-4 mb-4 rounded-xl overflow-hidden bg-neutral-100/50">
                            <img
                              src={notification.image}
                              alt={notification.title}
                              className="w-full h-auto max-h-[600px] object-contain mx-auto"
                            />
                          </div>
                        )}

                        {notification.message && (
                          <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                            {renderMessageWithLinks(notification.message)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200">
            <Bell className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              No Notifications
            </h3>
            <p className="text-neutral-500">
              There are no new announcements at this time.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsPage;
