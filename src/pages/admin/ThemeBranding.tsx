import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useBranding } from "@/contexts/BrandingContext";
import {
  Palette,
  Layout,
  MessageSquare,
  Share2,
  MapPin,
  Phone,
  Mail,
  Link as LinkIcon,
  Save,
  Upload,
  RefreshCcw,
  Globe,
  Info,
  FileText,
  Printer,
  PlusCircle,
  Trash2,
  List,
  QrCode,
  Settings,
  Eye,
  CheckCircle2,
  XCircle,
  GripVertical,
  FileCheck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ThemeBranding: React.FC = () => {
  const { settings, refreshSettings } = useBranding();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...settings });
  const [navbarLogo, setNavbarLogo] = useState<File | null>(null);

  const [loadingLogo, setLoadingLogo] = useState<File | null>(null);
  const [cardLogo, setCardLogo] = useState<File | null>(null);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  useEffect(() => {
    fetchCustomFields();
  }, []);

  const fetchCustomFields = async () => {
    try {
      setIsFieldsLoading(true);
      const res = await fetch("/api/library-card-fields");
      if (res.ok) {
        const data = await res.json();
        setCustomFields(data);
      }
    } catch (error) {
      console.error("Failed to fetch custom fields:", error);
    } finally {
      setIsFieldsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, primaryColor: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      console.log("[ThemeBranding] Submitting form data:", formData);
      const data = new FormData();

      // Append all fields, handle special types
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key === "navbarLogo" ||
          key === "heroBackgroundLogo" ||
          key === "loadingLogo" ||
          key === "cardLogoUrl" ||
          key === "id" ||
          key === "updatedAt"
        )
          return;

        if (typeof value === "boolean") {
          data.append(key, value ? "true" : "false");
        } else if (value !== null && value !== undefined) {
          data.append(key, String(value));
        }
      });

      // Append files if selected
      if (navbarLogo) data.append("navbarLogo", navbarLogo);

      if (loadingLogo) data.append("loadingLogo", loadingLogo);
      if (cardLogo) data.append("cardLogo", cardLogo);

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        body: data,
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Settings updated successfully.",
        });
        await refreshSettings();
        setNavbarLogo(null);
        setLoadingLogo(null);
        setCardLogo(null);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to update settings");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    try {
      const newField = {
        fieldLabel: "New Field",
        fieldKey: `custom_field_${Date.now()}`,
        fieldType: "text",
        isRequired: false,
        showOnForm: true,
        showOnCard: false,
        showInAdmin: true,
        displayOrder: customFields.length + 1,
      };

      const res = await fetch("/api/admin/library-card-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newField),
      });

      if (res.ok) {
        fetchCustomFields();
        toast({ title: "Success", description: "Field added successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add field",
        variant: "destructive",
      });
    }
  };

  const handleUpdateField = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/library-card-fields/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        setCustomFields((prev) =>
          prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    try {
      const res = await fetch(`/api/admin/library-card-fields/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCustomFields();
        toast({ title: "Deleted", description: "Field removed" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-4xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <Settings className="w-10 h-10 text-primary" />
            System & Branding
          </h2>
          <p className="text-neutral-500 mt-2 font-medium">
            Configure global institutional identities, document layouts, and
            dynamic application forms.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={refreshSettings}
            disabled={loading}
            className="rounded-xl font-bold bg-white"
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 px-6"
          >
            {loading ? (
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="identity" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-8 p-1 bg-neutral-100 rounded-2xl h-14">
          <TabsTrigger
            value="identity"
            className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2"
          >
            <Palette className="w-3.5 h-3.5" /> Identity
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2"
          >
            <FileText className="w-3.5 h-3.5" /> Documents
          </TabsTrigger>
          <TabsTrigger
            value="field-builder"
            className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2"
          >
            <List className="w-3.5 h-3.5" /> Field Builder
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: IDENTITY & APPEARANCE */}
        <TabsContent
          value="identity"
          className="mt-0 space-y-8 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 1: Visual Identity */}
            <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                    Visual Identity
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                    Colors & Basic Branding
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Color Picker */}
                <div className="p-6 rounded-2xl bg-neutral-50 ring-1 ring-neutral-200/60">
                  <Label className="text-xs font-black uppercase tracking-widest text-neutral-400 block mb-4">
                    Primary Theme Color
                  </Label>
                  <div className="flex items-center gap-6">
                    <div
                      className="w-20 h-20 rounded-2xl shadow-inner border-4 border-white ring-1 ring-neutral-200 transition-all duration-300"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <div className="relative w-12 h-10">
                          <Input
                            type="color"
                            value={formData.primaryColor}
                            onChange={handleColorChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 border-none"
                          />
                          <div className="w-full h-full rounded-lg border flex items-center justify-center bg-white">
                            <PlusCircle className="w-4 h-4 text-neutral-400" />
                          </div>
                        </div>
                        <Input
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleInputChange}
                          placeholder="#006600"
                          className="font-mono font-bold rounded-lg h-10"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        This color will replace the default green across the
                        entire platform, including UI elements and PDF accents.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Navbar Logo
                    </Label>
                    <div className="relative group">
                      {formData.navbarLogo ? (
                        <div className="w-full h-32 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center p-4">
                          <img
                            src={formData.navbarLogo}
                            alt="Navbar"
                            className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 text-neutral-300 mb-2" />
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                            No Logo
                          </span>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNavbarLogo(e.target.files?.[0] || null)
                        }
                        className="mt-2 text-[10px] rounded-lg h-9 bg-neutral-100 border-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Loading Logo
                    </Label>
                    <div className="relative group">
                      {formData.loadingLogo ? (
                        <div className="w-full h-32 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center p-4">
                          <img
                            src={formData.loadingLogo}
                            alt="Loading"
                            className="max-w-full max-h-full object-contain animate-pulse"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 text-neutral-300 mb-2" />
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                            No Logo
                          </span>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setLoadingLogo(e.target.files?.[0] || null)
                        }
                        className="mt-2 text-[10px] rounded-lg h-9 bg-neutral-100 border-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-white cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Institution Info */}
            <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                    Institution Details
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                    Naming & Display Texts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Short Name
                    </Label>
                    <Input
                      name="instituteShortName"
                      value={formData.instituteShortName}
                      onChange={handleInputChange}
                      placeholder="e.g., GCFM"
                      className="font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Full Name
                    </Label>
                    <Input
                      name="instituteFullName"
                      value={formData.instituteFullName}
                      onChange={handleInputChange}
                      placeholder="Full Institution Name"
                      className="font-bold rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Footer Tagline
                  </Label>
                  <Input
                    name="footerTagline"
                    value={formData.footerTagline}
                    onChange={handleInputChange}
                    placeholder="Empowering Education Since..."
                    className="font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Footer Description
                  </Label>
                  <Textarea
                    name="footerDescription"
                    value={formData.footerDescription}
                    onChange={handleInputChange}
                    placeholder="Brief institution description..."
                    rows={4}
                    className="font-medium rounded-xl resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Section 3: Contact & Links */}
            <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                    Contact & Social
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                    Physical Presence & Online Links
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Physical Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <Input
                        name="contactAddress"
                        value={formData.contactAddress}
                        onChange={handleInputChange}
                        className="pl-10 font-bold rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Phone
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <Input
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          className="pl-10 font-bold rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <Input
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          className="pl-10 font-bold rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Facebook URL
                    </Label>
                    <Input
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      className="font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Twitter URL
                    </Label>
                    <Input
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleInputChange}
                      className="font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Instagram URL
                    </Label>
                    <Input
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleInputChange}
                      className="font-bold rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Credits & Contributors */}
            <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                    Credits & Attribution
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                    Recognition for development & contributors
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Primary Credits Line
                  </Label>
                  <Input
                    name="creditsText"
                    value={formData.creditsText}
                    onChange={handleInputChange}
                    className="font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Contributors (Separated by comma)
                  </Label>
                  <Textarea
                    name="contributorsText"
                    value={formData.contributorsText}
                    onChange={handleInputChange}
                    className="font-medium rounded-xl resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: DOCUMENT LAYOUTS */}
        <TabsContent
          value="documents"
          className="mt-0 space-y-8 animate-in fade-in duration-500"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Library Card PDF controls */}
            <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                      Library Card PDF
                    </h3>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                      Front & Back Layout
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Card Logo (Large Branding)
                    </Label>
                    <div className="relative group">
                      {formData.cardLogoUrl ? (
                        <div className="w-full h-32 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center p-4">
                          <img
                            src={formData.cardLogoUrl}
                            alt="Card Logo"
                            className="max-w-full max-h-full object-contain filter drop-shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 text-neutral-300 mb-2" />
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center px-4">
                            No custom card logo
                          </span>
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCardLogo(e.target.files?.[0] || null)
                        }
                        className="mt-2 text-[10px] rounded-lg h-9 bg-neutral-100 border-none file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-white cursor-pointer"
                      />
                      {cardLogo && (
                        <p className="text-[9px] text-primary font-bold mt-1">
                          ✓ New file selected: {cardLogo.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Card Header Text (Front)
                      </Label>
                      <Input
                        name="cardHeaderText"
                        value={formData.cardHeaderText}
                        onChange={handleInputChange}
                        className="font-bold rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                        Card Sub-header Text
                      </Label>
                      <Input
                        name="cardSubheaderText"
                        value={formData.cardSubheaderText}
                        onChange={handleInputChange}
                        className="font-bold rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-6 rounded-2xl bg-neutral-50 ring-1 ring-neutral-200/60">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-neutral-400">
                      QR Code Settings
                    </Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.cardQrEnabled}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("cardQrEnabled", checked)
                        }
                      />
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-neutral-500">
                        {formData.cardQrEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-neutral-500">
                      Validation Link / QR Data
                    </Label>
                    <div className="relative">
                      <QrCode className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                      <Input
                        name="cardQrUrl"
                        value={formData.cardQrUrl}
                        onChange={handleInputChange}
                        className="pl-10 font-mono text-xs rounded-lg"
                        disabled={!formData.cardQrEnabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Terms & Conditions (Back Side)
                  </Label>
                  <Textarea
                    name="cardTermsText"
                    value={formData.cardTermsText}
                    onChange={handleInputChange}
                    rows={8}
                    className="font-medium text-xs rounded-xl resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-neutral-400">
                    Tip: Use bullet points (•) for a cleaner layout in the PDF.
                  </p>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-neutral-900">
                    Card Contact Info
                  </h4>
                  <div className="space-y-3">
                    <Input
                      name="cardContactAddress"
                      value={formData.cardContactAddress}
                      onChange={handleInputChange}
                      placeholder="Address"
                      className="text-xs rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="cardContactEmail"
                        value={formData.cardContactEmail}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="text-xs rounded-lg"
                      />
                      <Input
                        name="cardContactPhone"
                        value={formData.cardContactPhone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                        className="text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rare Book Preview Controls */}
            <div className="space-y-8">
              <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <Eye className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                      Rare Book Preview
                    </h3>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                      Watermark & Disclaimer
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-neutral-900 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                          Preview Settings
                        </Label>
                        <Switch
                          checked={formData.rbWatermarkEnabled}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("rbWatermarkEnabled", checked)
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-neutral-400">
                            Watermark Text
                          </Label>
                          <Input
                            name="rbWatermarkText"
                            value={formData.rbWatermarkText}
                            onChange={handleInputChange}
                            className="bg-neutral-800 border-neutral-700 text-white font-bold rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label className="text-[10px] font-bold text-neutral-400">
                              Watermark Opacity (
                              {Math.round(formData.rbWatermarkOpacity * 100)}%)
                            </Label>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={formData.rbWatermarkOpacity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                rbWatermarkOpacity: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Fake Watermark Preview */}
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-300"
                      style={{
                        opacity: formData.rbWatermarkEnabled
                          ? formData.rbWatermarkOpacity
                          : 0,
                        transform: "rotate(-30deg) scale(1.5)",
                      }}
                    >
                      <span className="text-4xl font-black whitespace-nowrap">
                        {formData.rbWatermarkText || "WATERMARK"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      Bottom Disclaimer Text
                    </Label>
                    <Input
                      name="rbDisclaimerText"
                      value={formData.rbDisclaimerText}
                      onChange={handleInputChange}
                      className="font-bold rounded-xl"
                    />
                    <p className="text-[10px] text-neutral-400">
                      Applies to the bottom of the rare book previewer.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl bg-primary/5 border-none ring-1 ring-primary/20">
                <div className="flex gap-4">
                  <div className="p-2 bg-primary rounded-xl text-white h-fit">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-primary text-sm tracking-tight">
                      Pro Tip: PDF Updates
                    </h4>
                    <p className="text-[11px] text-primary/80 font-medium leading-relaxed mt-1">
                      Changes to library card layouts will apply to all NEW
                      downloads. Existing students will also see the updated
                      layout when they download their card again from the
                      profile section.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: FIELD BUILDER */}
        <TabsContent
          value="field-builder"
          className="mt-0 space-y-8 animate-in fade-in duration-500"
        >
          <Card className="p-8 rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 ring-1 ring-neutral-200/60">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                  <List className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                    Application Field Builder
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                    Manage custom fields for library card applications
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAddField}
                className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary text-white hover:bg-primary/90 gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add Custom Field
              </Button>
            </div>

            {isFieldsLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <RefreshCcw className="w-10 h-10 text-neutral-200 animate-spin" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Loading Fields...
                </span>
              </div>
            ) : customFields.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-neutral-100 rounded-3xl">
                <FileCheck className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-neutral-400">
                  No Custom Fields
                </h4>
                <p className="text-sm text-neutral-300 font-medium mt-1">
                  Standard fields (Name, Father Name, Roll No, etc.) are always
                  included. Add extra fields like Mother's Name or CNIC here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 mb-2">
                  <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Order
                  </div>
                  <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Label
                  </div>
                  <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Type
                  </div>
                  <div className="col-span-4 text-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Visibility & Rules
                  </div>
                  <div className="col-span-2"></div>
                </div>

                {customFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="group p-4 bg-neutral-50 rounded-2xl ring-1 ring-neutral-200/60 hover:ring-primary/40 hover:bg-white transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Order & Drag Handle */}
                      <div className="col-span-1 flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-black text-neutral-400">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Label & Key */}
                      <div className="col-span-3 space-y-1">
                        <Input
                          value={field.fieldLabel}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              fieldLabel: e.target.value,
                            })
                          }
                          className="font-bold rounded-lg h-9 text-sm"
                          placeholder="Field Label"
                        />
                        <div className="text-[9px] font-mono text-neutral-400 px-1 truncate">
                          ID: {field.fieldKey}
                        </div>
                      </div>

                      {/* Type Selection */}
                      <div className="col-span-2">
                        <Select
                          value={field.fieldType}
                          onValueChange={(val) =>
                            handleUpdateField(field.id, { fieldType: val })
                          }
                        >
                          <SelectTrigger className="h-9 rounded-lg text-xs font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="text">Plain Text</SelectItem>
                            <SelectItem value="number">Number Only</SelectItem>
                            <SelectItem value="date">Date Picker</SelectItem>
                            <SelectItem value="select">
                              Selection Menu
                            </SelectItem>
                            <SelectItem value="textarea">Long Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Visibility Toggles */}
                      <div className="col-span-4 flex justify-between gap-2 px-4 border-x border-neutral-200">
                        <div className="flex flex-col items-center gap-1.5">
                          <Switch
                            checked={field.isRequired}
                            onCheckedChange={(val) =>
                              handleUpdateField(field.id, { isRequired: val })
                            }
                            className="scale-75 data-[state=checked]:bg-rose-500"
                          />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400">
                            Required
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Switch
                            checked={field.showOnForm}
                            onCheckedChange={(val) =>
                              handleUpdateField(field.id, { showOnForm: val })
                            }
                            className="scale-75"
                          />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400">
                            Show on Form
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Switch
                            checked={field.showOnCard}
                            onCheckedChange={(val) =>
                              handleUpdateField(field.id, { showOnCard: val })
                            }
                            className="scale-75"
                          />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400">
                            PDF Card
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Switch
                            checked={field.showInAdmin}
                            onCheckedChange={(val) =>
                              handleUpdateField(field.id, { showInAdmin: val })
                            }
                            className="scale-75"
                          />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-neutral-400">
                            Admin View
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteField(field.id)}
                          className="h-9 w-9 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Options Configuration for Selection Menus */}
                    {field.fieldType === "select" && (
                      <div className="mt-4 pt-4 border-t border-neutral-100 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col gap-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <PlusCircle className="w-3 h-3" /> Menu Options
                          </Label>

                          {/* Options List (Badges) */}
                          <div className="flex flex-wrap gap-2 min-h-[42px] p-3 rounded-2xl bg-neutral-100/50 ring-1 ring-neutral-200/40">
                            {(field.options || []).length === 0 && (
                              <span className="text-[10px] text-neutral-400 font-medium italic ml-1">
                                No options added yet.
                              </span>
                            )}
                            {(field.options || []).map(
                              (opt: string, optIdx: number) => (
                                <div
                                  key={`${opt}-${optIdx}`}
                                  className="flex items-center gap-2 px-3 py-1 bg-white ring-1 ring-neutral-200 rounded-xl shadow-sm animate-in zoom-in-95 duration-200 group/opt"
                                >
                                  <span className="text-xs font-bold text-neutral-700">
                                    {opt}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newOpts = field.options.filter(
                                        (_: any, i: number) => i !== optIdx,
                                      );
                                      handleUpdateField(field.id, {
                                        options: newOpts,
                                      });
                                    }}
                                    className="text-neutral-300 hover:text-rose-500 transition-all active:scale-90"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>

                          {/* Add New Option Input */}
                          <div className="flex gap-2">
                            <Input
                              value={newOptionTexts[field.id] || ""}
                              onChange={(e) =>
                                setNewOptionTexts((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const val = newOptionTexts[field.id]?.trim();
                                  if (val) {
                                    const currentOpts = Array.isArray(
                                      field.options,
                                    )
                                      ? field.options
                                      : [];
                                    if (!currentOpts.includes(val)) {
                                      handleUpdateField(field.id, {
                                        options: [...currentOpts, val],
                                      });
                                      setNewOptionTexts((prev) => ({
                                        ...prev,
                                        [field.id]: "",
                                      }));
                                    } else {
                                      toast({
                                        title: "Already exists",
                                        description:
                                          "This option is already in the list.",
                                        variant: "destructive",
                                      });
                                    }
                                  }
                                }
                              }}
                              placeholder="Add an option (Class 11, BSc, Computer Science...)"
                              className="font-bold text-xs bg-white rounded-xl h-10 flex-1 px-4"
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const val = newOptionTexts[field.id]?.trim();
                                if (val) {
                                  const currentOpts = Array.isArray(
                                    field.options,
                                  )
                                    ? field.options
                                    : [];
                                  if (!currentOpts.includes(val)) {
                                    handleUpdateField(field.id, {
                                      options: [...currentOpts, val],
                                    });
                                    setNewOptionTexts((prev) => ({
                                      ...prev,
                                      [field.id]: "",
                                    }));
                                  } else {
                                    toast({
                                      title: "Already exists",
                                      description:
                                        "This option is already in the list.",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                              className="rounded-xl h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black uppercase text-[10px] tracking-widest px-6 shadow-sm shadow-primary/5 active:scale-95"
                            >
                              Add
                            </Button>
                          </div>
                          <p className="text-[9px] text-neutral-400 font-medium italic">
                            Type an option and press Enter or click 'Add' to
                            insert into the list.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-8 flex flex-col items-center gap-4">
                  <p className="text-[10px] text-neutral-400 font-medium max-w-lg text-center leading-relaxed">
                    Changes to field properties are saved automatically.
                    However, standard branding changes must still be saved using
                    the main button above.
                  </p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-neutral-500">
                        Live Sync Enabled
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-neutral-500">
                        Auto-Scaling Layouts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeBranding;
