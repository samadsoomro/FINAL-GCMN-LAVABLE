import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Save, RefreshCcw, ExternalLink } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

const InstituteAddress: React.FC = () => {
  const { toast } = useToast();
  const { settings, updateSettings } = useBranding();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contactAddress: "",
    mapEmbedUrl: "",
    contactPhone: "",
    contactEmail: "",
  });

  useEffect(() => {
    setFormData({
      contactAddress: settings.contactAddress || "",
      mapEmbedUrl: settings.mapEmbedUrl || "",
      contactPhone: settings.contactPhone || "",
      contactEmail: settings.contactEmail || "",
    });
  }, [settings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(formData);
      toast({
        title: "Success",
        description: "Address and Map settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractSrc = (input: string) => {
    if (input.includes("<iframe")) {
      const match = input.match(/src="([^"]+)"/);
      return match ? match[1] : input;
    }
    return input;
  };

  const handleMapBlur = () => {
    const cleanUrl = extractSrc(formData.mapEmbedUrl);
    if (cleanUrl !== formData.mapEmbedUrl) {
      setFormData((prev) => ({ ...prev, mapEmbedUrl: cleanUrl }));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-black text-neutral-900 tracking-tight">
          Institute Address
        </h2>
        <p className="text-neutral-500 mt-2 font-medium">
          Manage your campus location and public contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-none bg-white shadow-xl shadow-neutral-200/40 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-neutral-700">
                Physical Address
              </label>
              <Textarea
                name="contactAddress"
                value={formData.contactAddress}
                onChange={handleChange}
                className="rounded-xl min-h-[100px]"
                placeholder="Enter full address..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-black text-neutral-700">
                  Contact Phone
                </label>
                <Input
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-neutral-700">
                  Contact Email
                </label>
                <Input
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="font-bold text-gray-900">Map Configuration</h3>

              <div className="space-y-2">
                <label className="text-sm font-black text-neutral-700 flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  Google Map Embed Code (for Map View)
                </label>
                <Input
                  name="mapEmbedUrl"
                  value={formData.mapEmbedUrl}
                  onChange={handleChange}
                  onBlur={handleMapBlur}
                  className="h-12 rounded-xl font-mono text-xs"
                  placeholder="Paste the embed link or iframe code"
                />
                <p className="text-xs text-neutral-400 font-medium ml-1">
                  Used for the map display on the Contact page.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-black text-lg gap-2"
            >
              {loading ? (
                <RefreshCcw className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Location
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <label className="text-sm font-black text-neutral-700 block">
            Live Metadata Preview
          </label>
          <div className="aspect-video w-full rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-neutral-100 relative group">
            {formData.mapEmbedUrl ? (
              <iframe
                src={
                  formData.mapEmbedUrl?.includes("google.com/maps/embed")
                    ? formData.mapEmbedUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(formData.contactAddress || "Karachi, Pakistan")}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300">
                <MapPin size={48} className="mb-2 opacity-50" />
                <span className="font-bold">No Map Configured</span>
              </div>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
          </div>
          {formData.contactAddress && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
              <MapPin className="shrink-0 mt-1" size={18} />
              <div>
                <p className="font-bold text-sm">Location set to:</p>
                <p className="text-sm leading-relaxed opacity-90">
                  {formData.contactAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteAddress;
