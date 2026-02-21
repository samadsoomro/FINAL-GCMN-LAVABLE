import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Pin,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Save,
} from "lucide-react";
// @ts-ignore
import { Switch } from "@/components/ui/switch"; // Assuming we might have this, if not I'll just use status dropdown

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);

  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-generate slug from title if not manually edited
  useEffect(() => {
    if (!currentPost && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, currentPost]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blog", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setShortDescription("");
    setContent("");
    setStatus("draft");
    setFeaturedImage(null);
    setFeaturedImagePreview(null);
    setCurrentPost(null);
    setIsEditing(false);
  };

  const handleEdit = (post: any) => {
    setCurrentPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setShortDescription(post.shortDescription || "");
    setContent(post.content);
    setStatus(post.status);
    setFeaturedImagePreview(post.featuredImage);
    setFeaturedImage(null);
    setIsEditing(true);
  };

  // Custom Image Handler for Quill
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const res = await fetch("/api/admin/blog/upload-image", {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (res.ok) {
            const data = await res.json();
            const range = quillRef.current?.getEditor().getSelection();
            if (range) {
              quillRef.current
                ?.getEditor()
                .insertEmbed(range.index, "image", data.url);
            }
          } else {
            toast({
              title: "Error",
              description: "Image upload failed",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error(err);
          toast({
            title: "Error",
            description: "Image upload failed",
            variant: "destructive",
          });
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast({
        title: "Error",
        description: "Title, Slug and Content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("shortDescription", shortDescription);
      formData.append("content", content);
      formData.append("status", status);
      if (featuredImage) {
        formData.append("featuredImage", featuredImage);
      }

      const url = currentPost
        ? `/api/admin/blog/${currentPost.id}`
        : "/api/admin/blog";
      const method = currentPost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: `Post ${currentPost ? "updated" : "created"} successfully`,
        });
        fetchPosts();
        resetForm();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Operation failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        toast({ title: "Deleted", description: "Post deleted" });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}/pin`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts(posts.map((p) => (p.id === id ? updated : p)));
        toast({ title: "Success", description: "Pin status updated" });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update pin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Blog Management
        </h2>
        {isEditing && (
          <Button variant="outline" onClick={resetForm} className="gap-2">
            <XCircle size={16} /> Cancel Editing
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editor Column */}
        <Card className="lg:col-span-2 p-6 shadow-lg border-primary/10">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            {isEditing ? (
              <Pencil className="text-primary" size={20} />
            ) : (
              <Plus className="text-primary" size={20} />
            )}
            {isEditing ? "Edit Post" : "Create New Post"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post Title"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-url-slug"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Short Description (Excerpt)
              </label>
              <Input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary for the card view..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Featured Image</label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFeaturedImage(e.target.files[0]);
                      setFeaturedImagePreview(
                        URL.createObjectURL(e.target.files[0]),
                      );
                    }
                  }}
                  className="bg-secondary/50"
                />
                {featuredImagePreview && (
                  <div className="h-10 w-16 rounded overflow-hidden border">
                    <img
                      src={featuredImagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (Rich Text)</label>
              <div className="prose-editor">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  className="h-[400px] mb-12"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {isEditing ? "Update Post" : "Save Post"}
              </Button>
            </div>
          </form>
        </Card>

        {/* List Column */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold px-2">Recent Posts</h3>
          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
            {posts.length === 0 ? (
              <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                No posts found
              </div>
            ) : (
              posts.map((post) => (
                <Card
                  key={post.id}
                  className={`p-4 transition-all hover:shadow-md cursor-pointer border-l-4 ${post.status === "published" ? "border-l-emerald-500" : "border-l-amber-500"} ${currentPost?.id === post.id ? "bg-secondary" : ""}`}
                  onClick={() => handleEdit(post)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    {post.isPinned && (
                      <Pin
                        size={14}
                        className="text-primary shrink-0 fill-current"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span
                      className={`px-1.5 py-0.5 rounded-full ${post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {post.status}
                    </span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div
                    className="flex justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => handleTogglePin(post.id)}
                      title="Toggle Pin"
                    >
                      <Pin
                        size={14}
                        className={
                          post.isPinned
                            ? "fill-primary text-primary"
                            : "text-slate-400"
                        }
                      />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-blue-600"
                      onClick={() =>
                        window.open(`/blog/${post.slug}`, "_blank")
                      }
                      title="Preview"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(post.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;
