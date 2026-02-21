import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Clock, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied!",
      description: "The article URL has been copied to your clipboard.",
    });
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          navigate("/blog");
        }
      } catch (err) {
        console.error("Failed to fetch post", err);
        navigate("/blog");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Scroll Progress Bar (Optional, can be added later) */}

      {/* Hero / Header */}
      <div className="relative w-full h-[50vh] min-h-[400px] bg-slate-900 overflow-hidden">
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-900/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute inset-0 container flex flex-col justify-end pb-16">
          <Link
            to="/blog"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors w-fit group"
          >
            <ArrowLeft
              size={16}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back to Blog
          </Link>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 max-w-4xl"
          >
            {post.title}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 text-white/80 font-medium sm:text-sm text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              {Math.max(1, Math.ceil(post.content.length / 3000))} min read
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="container py-16 px-4 md:px-6 max-w-4xl mx-auto">
        {/* Actions Bar */}
        <div className="flex justify-end gap-2 mb-8 border-b border-slate-100 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.print()}
            title="Print Article"
          >
            <Printer size={16} className="text-slate-500 hover:text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            title="Copy Link"
          >
            <Share2 size={16} className="text-slate-500 hover:text-primary" />
          </Button>
        </div>

        {/* Main Content */}
        <article
          className="prose prose-lg md:prose-xl prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:text-slate-800 
                    prose-p:text-slate-600 prose-p:leading-relaxed 
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                    prose-blockquote:border-l-primary prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                "
        >
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Footer / Navigation */}
        <div className="mt-16 pt-10 border-t border-slate-200 flex justify-between items-center">
          <Link to="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={16} /> All Posts
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogPost;
