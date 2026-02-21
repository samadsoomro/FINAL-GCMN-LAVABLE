import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Save, Upload, Loader2 } from "lucide-react";

const AdminPrincipal: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/principal");
      if (res.data) {
        setFormData({
          name: res.data.name || "",
          message: res.data.message || "",
        });
        setCurrentImageUrl(res.data.imageUrl);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("message", formData.message);
      if (imageFile) {
        data.append("image", imageFile);
      }

      await api.post("/api/admin/principal", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success",
        description: "Principal information updated successfully.",
      });
      fetchData(); // refresh
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Principal Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Update Principal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Prof. Dr. Example Name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Principal's Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Enter the message..."
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Photograph</label>
              <div className="flex items-center gap-4">
                {currentImageUrl && (
                  <img
                    src={currentImageUrl}
                    alt="Current"
                    className="w-20 h-20 rounded object-cover border"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPrincipal;
