import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Trash2,
  Plus,
  GripVertical,
  CheckCircle,
  XCircle,
  Save,
  Upload,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const AdminHome: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Content State
  const [content, setContent] = useState({
    heroHeading: "",
    heroSubheading: "",
    featuresHeading: "",
    featuresSubheading: "",
    affiliationsHeading: "",
    ctaHeading: "",

    ctaSubheading: "",
    heroOverlayText: "",
  });

  // Slider State
  const [sliderImages, setSliderImages] = useState<any[]>([]);
  const [sliderFile, setSliderFile] = useState<File | null>(null);

  // Affiliations State
  const [affiliations, setAffiliations] = useState<any[]>([]);
  const [affiliationFile, setAffiliationFile] = useState<File | null>(null);
  const [affiliationName, setAffiliationName] = useState("");
  const [affiliationLink, setAffiliationLink] = useState("");

  // Stats State
  const [stats, setStats] = useState<any[]>([]);
  const [newStatLabel, setNewStatLabel] = useState("");
  const [newStatNumber, setNewStatNumber] = useState("");
  const [newStatIcon, setNewStatIcon] = useState("BookOpen");
  const [newStatColor, setNewStatColor] = useState("text-pakistan-green");
  const [newStatFile, setNewStatFile] = useState<File | null>(null);
  const [showNewStatCustomIcon, setShowNewStatCustomIcon] = useState(false);
  const [showCustomIconMap, setShowCustomIconMap] = useState<
    Record<string, boolean>
  >({});

  const ICON_OPTIONS = [
    "BookOpen",
    "Users",
    "Award",
    "TrendingUp",
    "Search",
    "Star",
    "Heart",
    "Clock",
  ];
  const COLOR_OPTIONS = [
    { label: "Green", value: "text-pakistan-green" },
    { label: "Light Green", value: "text-pakistan-green-light" },
    { label: "Emerald", value: "text-pakistan-emerald" },
    { label: "Accent", value: "text-accent" },
    { label: "Primary", value: "text-primary" },
  ];

  const getPositionLabel = (index: number) => {
    const labels = [
      "First",
      "Second",
      "Third",
      "Fourth",
      "Fifth",
      "Sixth",
      "Seventh",
      "Eighth",
      "Ninth",
      "Tenth",
    ];
    return labels[index] || `#${index + 1}`;
  };

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/admin/home/content");
      if (res.ok) {
        const data = await res.json();
        if (data) setContent(data);
      }
    } catch (error) {
      console.error("Failed to fetch content", error);
    }
  };

  const fetchSlider = async () => {
    try {
      const res = await fetch("/api/admin/home/slider");
      if (res.ok) setSliderImages(await res.json());
    } catch (error) {
      console.error("Failed to fetch slider", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/home/stats");
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const fetchAffiliations = async () => {
    try {
      const res = await fetch("/api/admin/home/affiliations");
      if (res.ok) setAffiliations(await res.json());
    } catch (error) {
      console.error("Failed to fetch affiliations", error);
    }
  };

  useEffect(() => {
    fetchContent();
    fetchSlider();
    fetchStats();
    fetchAffiliations();
  }, []);

  // Content Handlers
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/home/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Home content updated successfully",
        });
        fetchContent();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Slider Handlers
  const handleUploadSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sliderFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", sliderFile);

    try {
      const res = await fetch("/api/admin/home/slider", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Image uploaded successfully" });
        setSliderFile(null);
        // Reset file input if possible or just rely on state
        const fileInput = document.getElementById(
          "slider-upload",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        fetchSlider();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/home/slider/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Image deleted successfully" });
        fetchSlider();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const toggleSliderStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/home/slider/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        toast({ title: "Updated", description: "Status changed" });
        fetchSlider();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSliderImage = async (id: string, file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/home/slider/${id}/image`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Image updated successfully" });
        fetchSlider();
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Affiliations Handlers
  const handleUploadAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliationFile || !affiliationName) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", affiliationFile);
    formData.append("name", affiliationName);
    formData.append("link", affiliationLink);

    try {
      const res = await fetch("/api/admin/home/affiliations", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Affiliation added" });
        setAffiliationFile(null);
        setAffiliationName("");
        setAffiliationLink("");
        const fileInput = document.getElementById(
          "affiliation-upload",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchAffiliations();
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add affiliation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAffiliation = async (id: string) => {
    if (!confirm("Delete this affiliation?")) return;
    try {
      const res = await fetch(`/api/admin/home/affiliations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Affiliation removed" });
        fetchAffiliations();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const toggleAffiliationStatus = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      await fetch(`/api/admin/home/affiliations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchAffiliations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleStatIconUpload = async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/admin/home/stats/${id}/icon`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Icon updated" });
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload icon",
        variant: "destructive",
      });
    }
  };

  // Stats Handlers
  const updateStat = async (id: string, key: string, value: any) => {
    try {
      const body = key === "all" ? value : { [key]: value };
      const res = await fetch(`/api/admin/home/stats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: "Updated", description: "Stat saved successfully" });
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stat",
        variant: "destructive",
      });
    }
  };

  const handleAddStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatLabel || !newStatNumber) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("label", newStatLabel);
    formData.append("number", newStatNumber);
    formData.append("icon", newStatIcon);
    formData.append("color", newStatColor);
    formData.append("order", (stats.length + 1).toString());
    if (newStatFile) {
      formData.append("file", newStatFile);
    }

    try {
      const res = await fetch("/api/admin/home/stats", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        toast({ title: "Success", description: "Stat added" });
        setNewStatLabel("");
        setNewStatNumber("");
        setNewStatFile(null);
        const fileInput = document.getElementById(
          "new-stat-icon",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm("Delete this statistic?")) return;
    try {
      const res = await fetch(`/api/admin/home/stats/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Stat removed" });
        fetchStats();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stat",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">
        Home Page Management
      </h2>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Text Content</TabsTrigger>
          <TabsTrigger value="slider">Image Slider</TabsTrigger>
          <TabsTrigger value="affiliations">Affiliations</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Edit Home Page Text</CardTitle>
              <CardDescription>
                Update headings and subheadings across the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Heading</Label>
                  <Input
                    value={content.heroHeading}
                    onChange={(e) =>
                      setContent({ ...content, heroHeading: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hero Overlay Text (Top Pill)</Label>
                  <Input
                    value={content.heroOverlayText || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        heroOverlayText: e.target.value,
                      })
                    }
                    placeholder="e.g. Welcome to Digital Learning"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subheading</Label>
                  <Textarea
                    value={content.heroSubheading}
                    onChange={(e) =>
                      setContent({ ...content, heroSubheading: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Features Heading</Label>
                    <Input
                      value={content.featuresHeading}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          featuresHeading: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Affiliations Heading</Label>
                    <Input
                      value={content.affiliationsHeading}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          affiliationsHeading: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Features Subheading</Label>
                  <Input
                    value={content.featuresSubheading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        featuresSubheading: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Heading</Label>
                  <Input
                    value={content.ctaHeading}
                    onChange={(e) =>
                      setContent({ ...content, ctaHeading: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Subheading</Label>
                  <Textarea
                    value={content.ctaSubheading}
                    onChange={(e) =>
                      setContent({ ...content, ctaSubheading: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliations">
          <Card>
            <CardHeader>
              <CardTitle>Affiliations & Partners</CardTitle>
              <CardDescription>
                Manage logos displayed in the affiliations section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleUploadAffiliation}
                className="grid md:grid-cols-4 gap-4 items-end border p-4 rounded-lg bg-gray-50/50"
              >
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="affiliation-upload">Logo</Label>
                  <Input
                    id="affiliation-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setAffiliationFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>Name</Label>
                  <Input
                    value={affiliationName}
                    onChange={(e) => setAffiliationName(e.target.value)}
                    placeholder="e.g. BIEK"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>Link (Optional)</Label>
                  <Input
                    value={affiliationLink}
                    onChange={(e) => setAffiliationLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!affiliationFile || !affiliationName || loading}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </form>

              <div className="grid gap-4">
                {affiliations.map((aff) => (
                  <div
                    key={aff.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm"
                  >
                    <div className="h-16 w-16 relative rounded overflow-hidden bg-white border flex-shrink-0 flex items-center justify-center p-1">
                      <img
                        src={aff.logoUrl}
                        alt={aff.name}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{aff.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {aff.link}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-xs">Position:</Label>
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {getPositionLabel(aff.order - 1)}
                        </span>
                        <Input
                          type="number"
                          className="w-12 h-7 text-xs"
                          value={aff.order}
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            const updated = affiliations.map((a) =>
                              a.id === aff.id ? { ...a, order: newVal } : a,
                            );
                            setAffiliations(updated);
                            fetch(`/api/admin/home/affiliations/${aff.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ order: newVal }),
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`aff-active-${aff.id}`}
                          checked={aff.isActive}
                          onCheckedChange={() =>
                            toggleAffiliationStatus(aff.id, aff.isActive)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => handleDeleteAffiliation(aff.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {affiliations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No affiliations added.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slider">
          <Card>
            <CardHeader>
              <CardTitle>Home Page Slider</CardTitle>
              <CardDescription>
                Manage images for the main home page slider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleUploadSlider}
                className="flex items-end gap-4 border p-4 rounded-lg bg-gray-50/50"
              >
                <div className="w-full space-y-2">
                  <Label htmlFor="slider-upload">Upload New Image</Label>
                  <Input
                    id="slider-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSliderFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" disabled={!sliderFile || loading}>
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </Button>
              </form>

              <div className="grid gap-4">
                {sliderImages.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm"
                  >
                    <div className="h-20 w-32 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={img.imageUrl}
                        alt="Slider"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label>Position:</Label>
                        <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                          {getPositionLabel(img.order - 1)}
                        </span>
                        <Input
                          type="number"
                          className="w-16 h-8"
                          value={img.order}
                          onChange={(e) => {
                            const newVal = parseInt(e.target.value);
                            // Optimistic update
                            const updated = sliderImages.map((i) =>
                              i.id === img.id ? { ...i, order: newVal } : i,
                            );
                            setSliderImages(updated);
                            // API call (debouncing would be better, but direct for simplicity)
                            fetch(`/api/admin/home/slider/${img.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ order: newVal }),
                            });
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`active-${img.id}`}
                            checked={img.isActive}
                            onCheckedChange={() =>
                              toggleSliderStatus(img.id, img.isActive)
                            }
                          />
                          <Label htmlFor={`active-${img.id}`}>Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs">Replace Image:</Label>
                          <Input
                            type="file"
                            accept="image/*"
                            className="h-8 text-xs w-48"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpdateSliderImage(img.id, file);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSlider(img.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {sliderImages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No images uploaded yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Statistics Section</CardTitle>
              <CardDescription>
                Update the numbers displayed in the stats section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-lg font-semibold">
                  Add New Statistic{" "}
                  {stats.length >= 8 && (
                    <span className="text-destructive text-sm font-normal">
                      (Limit of 8 reached)
                    </span>
                  )}
                </Label>
              </div>
              <form
                onSubmit={handleAddStat}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end border p-4 rounded-lg bg-gray-50/50"
              >
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={newStatLabel}
                    onChange={(e) => setNewStatLabel(e.target.value)}
                    placeholder="e.g. Active Students"
                    disabled={stats.length >= 8}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number</Label>
                  <Input
                    value={newStatNumber}
                    onChange={(e) => setNewStatNumber(e.target.value)}
                    placeholder="e.g. 1000+"
                    disabled={stats.length >= 8}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard Icon</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={newStatIcon}
                    onChange={(e) => setNewStatIcon(e.target.value)}
                    disabled={stats.length >= 8 || showNewStatCustomIcon}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={newStatColor}
                    onChange={(e) => setNewStatColor(e.target.value)}
                    disabled={stats.length >= 8}
                  >
                    {COLOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <Label>Icon Mode</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => {
                        setShowNewStatCustomIcon(!showNewStatCustomIcon);
                        if (!showNewStatCustomIcon) setNewStatFile(null);
                      }}
                      disabled={stats.length >= 8}
                    >
                      {showNewStatCustomIcon ? "Use Standard" : "Upload Custom"}
                    </Button>
                  </div>
                  {showNewStatCustomIcon ? (
                    <div className="flex items-center gap-2">
                      <Input
                        id="new-stat-icon"
                        type="file"
                        accept="image/*"
                        className="h-9 text-xs"
                        onChange={(e) =>
                          setNewStatFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  ) : (
                    <div className="h-9 flex items-center bg-muted/30 rounded border px-3 text-xs text-muted-foreground">
                      Standard icon selected
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={
                    !newStatLabel ||
                    !newStatNumber ||
                    loading ||
                    stats.length >= 8
                  }
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Stat
                </Button>
              </form>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                  <div
                    key={stat.id}
                    className="p-4 border rounded-xl space-y-4 relative group bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2 border-b pb-2">
                      <div className="flex items-center gap-2 font-semibold text-primary overflow-hidden">
                        {stat.iconUrl ? (
                          <img
                            src={stat.iconUrl}
                            alt="Icon"
                            className="w-5 h-5 object-contain flex-shrink-0"
                          />
                        ) : (
                          <span className="text-xs flex-shrink-0">
                            {stat.icon || "📍"}
                          </span>
                        )}
                        <span className="truncate text-sm">
                          {getPositionLabel(idx)} Stat
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteStat(stat.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Number</Label>
                      <Input
                        className="h-8 text-sm"
                        value={stat.number}
                        onChange={(e) => {
                          const updated = stats.map((s) =>
                            s.id === stat.id
                              ? { ...s, number: e.target.value }
                              : s,
                          );
                          setStats(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        className="h-8 text-sm"
                        value={stat.label}
                        onChange={(e) => {
                          const updated = stats.map((s) =>
                            s.id === stat.id
                              ? { ...s, label: e.target.value }
                              : s,
                          );
                          setStats(updated);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Icon Configuration</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-[9px] text-primary"
                          onClick={() => {
                            setShowCustomIconMap({
                              ...showCustomIconMap,
                              [stat.id]: !showCustomIconMap[stat.id],
                            });
                          }}
                        >
                          {showCustomIconMap[stat.id] || stat.iconUrl
                            ? "Replace/Standard"
                            : "Upload Custom"}
                        </Button>
                      </div>
                      {showCustomIconMap[stat.id] || stat.iconUrl ? (
                        <div className="space-y-2">
                          {stat.iconUrl && (
                            <div className="flex items-center gap-2 mb-1">
                              <img
                                src={stat.iconUrl}
                                alt="Icon"
                                className="w-6 h-6 object-contain border rounded"
                              />
                              <span className="text-[10px] text-muted-foreground">
                                Current custom icon
                              </span>
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            className="text-[10px] h-8 px-2"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleStatIconUpload(stat.id, file);
                            }}
                          />
                          {!stat.iconUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-full text-[9px]"
                              onClick={() => {
                                setShowCustomIconMap({
                                  ...showCustomIconMap,
                                  [stat.id]: false,
                                });
                              }}
                            >
                              Switch to Standard Icon
                            </Button>
                          )}
                        </div>
                      ) : (
                        <select
                          className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          value={stat.icon}
                          onChange={(e) => {
                            const updated = stats.map((s) =>
                              s.id === stat.id
                                ? { ...s, icon: e.target.value }
                                : s,
                            );
                            setStats(updated);
                          }}
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color Theme</Label>
                      <select
                        className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={stat.color}
                        onChange={(e) => {
                          const updated = stats.map((s) =>
                            s.id === stat.id
                              ? { ...s, color: e.target.value }
                              : s,
                          );
                          setStats(updated);
                        }}
                      >
                        {COLOR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2 h-8"
                      onClick={() => updateStat(stat.id, "all", stat)}
                    >
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                ))}
              </div>
              {stats.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No stats added yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminHome;
