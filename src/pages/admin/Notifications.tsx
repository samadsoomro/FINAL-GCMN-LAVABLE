import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Bell,
  RefreshCw,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    pin: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      setLoading(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("message", formData.message);
      data.append("pin", formData.pin.toString());
      if (selectedImage) {
        data.append("image", selectedImage);
      }

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Notification added successfully",
        });
        setFormData({ title: "", message: "", pin: false });
        setSelectedImage(null);
        // Reset file input
        const fileInput = document.getElementById(
          "notification-image",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setSelectedImage(null);
        fetchNotifications();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to add notification",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications(notifications.filter((n: any) => n.id !== id));
        toast({
          title: "Deleted",
          description: "Notification deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/status`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchNotifications();
        toast({ title: "Updated", description: "Status updated successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/pin`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        fetchNotifications();
        toast({
          title: "Updated",
          description: "Pin status updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-neutral-900 tracking-tight">
            Notifications Management
          </h2>
          <p className="text-neutral-500 mt-2 font-medium">
            Manage alerts and announcements for the website.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={fetchNotifications}
          className="rounded-xl font-bold bg-white shadow-sm hover:shadow-md transition-all gap-2"
        >
          <RefreshCw size={18} className="text-primary" /> Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-6 h-fit bg-white shadow-sm border border-neutral-200/60 rounded-3xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell size={20} className="text-primary" />
            Add New Notification
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-neutral-700">
                Title (Required)
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Important Announcement"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-neutral-700">
                Message (Optional)
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Details about the notification..."
              />
            </div>
            <div>
              <label className="text-sm font-bold text-neutral-700">
                Image (Optional)
              </label>
              <div className="mt-1 flex flex-col gap-2">
                <Input
                  id="notification-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast({
                          title: "File too large",
                          description: "Image must be smaller than 5MB",
                          variant: "destructive",
                        });
                        e.target.value = "";
                        setSelectedImage(null);
                        return;
                      }
                      setSelectedImage(file);
                    }
                  }}
                  className="cursor-pointer file:cursor-pointer"
                />
                {selectedImage && (
                  <div className="relative w-full h-48 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 mt-2">
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-neutral-600 rounded-full"
                      onClick={() => {
                        setSelectedImage(null);
                        const fileInput = document.getElementById(
                          "notification-image",
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                    >
                      <XCircle size={20} />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-neutral-400 font-medium">
                  Supported: JPG, PNG, GIF, WEBP, BMP, SVG (Max 5MB)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.pin}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, pin: checked })
                }
              />
              <label className="text-sm font-medium text-neutral-700">
                Pin to top
              </label>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold"
            >
              {loading ? "Adding..." : "Post Notification"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {loading && notifications.length === 0 ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-12 text-neutral-500 bg-neutral-50 rounded-3xl border border-dashed">
              <Bell size={48} className="mx-auto mb-4 opacity-20" />
              <p>No notifications found.</p>
            </div>
          ) : (
            notifications.map((notification: any) => {
              const isImageOnly = notification.image && !notification.message;

              return (
                <Card
                  key={notification.id}
                  className={`p-4 flex ${isImageOnly ? "flex-col" : "flex-col md:flex-row"} gap-4 items-start bg-white shadow-sm border border-neutral-200/60 rounded-2xl hover:shadow-md transition-all`}
                >
                  {!isImageOnly && notification.image && (
                    <div className="w-full md:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100">
                      <img
                        src={notification.image}
                        alt="Notification"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                          {notification.pin && (
                            <Pin
                              size={16}
                              className="text-primary fill-primary"
                            />
                          )}
                          {notification.title}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1">
                          Posted on{" "}
                          {new Date(
                            notification.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${notification.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}
                      >
                        {notification.status}
                      </div>
                    </div>

                    {isImageOnly && notification.image && (
                      <div className="w-full mt-4 rounded-xl overflow-hidden bg-neutral-50 border border-neutral-100">
                        <img
                          src={notification.image}
                          alt="Notification"
                          className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        />
                      </div>
                    )}

                    {notification.message && (
                      <p className="text-neutral-600 mt-2 text-sm line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePin(notification.id)}
                        className={
                          notification.pin
                            ? "text-primary border-primary/20 bg-primary/5"
                            : ""
                        }
                      >
                        <Pin size={14} className="mr-1" />{" "}
                        {notification.pin ? "Unpin" : "Pin"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(notification.id)}
                      >
                        {notification.status === "active" ? (
                          <EyeOff size={14} className="mr-1" />
                        ) : (
                          <Eye size={14} className="mr-1" />
                        )}
                        {notification.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                      >
                        <Trash2 size={14} className="mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
