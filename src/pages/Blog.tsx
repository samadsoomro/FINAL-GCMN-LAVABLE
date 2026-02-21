import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Pin, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          // Sort: Pinned first, then date desc
          const sorted = data.sort((a: any, b: any) => {
            if (a.isPinned === b.isPinned) {
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            }
            return a.isPinned ? -1 : 1;
          });
          setPosts(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch blog posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-neutral-50"
    >
      {/* Header Section */}
      <div className="bg-primary text-white pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container relative z-10 text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black tracking-tight mb-4"
          >
            College News & Updates
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium"
          >
            Stay informed with the latest academic updates, announcements,
            events, and educational insights from the college community.
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-16">
        <div className="container">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <Card
                  key={n}
                  className="h-[400px] animate-pulse bg-slate-200/50 border-none rounded-2xl"
                ></Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="mx-auto h-20 w-20 text-slate-300 mb-6" />
              <h3 className="text-2xl font-bold text-slate-800">
                No posts yet
              </h3>
              <p className="text-slate-500 mt-2">
                Check back soon for new updates!
              </p>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {posts.map((post) => (
                <motion.div key={post.id} variants={item}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block h-full"
                  >
                    <Card className="h-full border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col hover:-translate-y-2 bg-white ring-1 ring-slate-200/50">
                      {/* Image */}
                      <div className="h-56 relative overflow-hidden bg-slate-100">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-300">
                            <BookOpen size={48} />
                          </div>
                        )}
                        {post.isPinned && (
                          <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Pin size={12} fill="currentColor" /> Feature
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center text-xs font-bold text-slate-500 mb-3 gap-2">
                          <Calendar size={14} className="text-primary" />
                          {new Date(post.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                          {post.shortDescription ||
                            "Click to read more about this topic..."}
                        </p>

                        <div className="mt-auto flex items-center text-primary font-bold text-sm">
                          Read Article{" "}
                          <ArrowRight
                            size={16}
                            className="ml-2 group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Blog;
