import React, { createContext, useContext, useEffect, useState } from "react";

interface SiteSettings {
  id: string;
  primaryColor: string;
  navbarLogo: string | null;
  loadingLogo: string | null;
  instituteShortName: string;
  instituteFullName: string;
  footerTitle: string;
  footerDescription: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  creditsText: string;
  contributorsText: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  mapEmbedUrl: string;
  googleMapLink: string;
  footerTagline: string;
  // Hero Background
  heroBackgroundLogo: string | null;
  heroBackgroundOpacity: number;
  // Library Card Layout
  cardHeaderText: string;
  cardSubheaderText: string;
  cardLogoUrl: string | null;
  cardQrEnabled: boolean;
  cardQrUrl: string;
  cardTermsText: string;
  cardContactAddress: string;
  cardContactEmail: string;
  cardContactPhone: string;
  // Rare Book Preview
  rbWatermarkText: string;
  rbWatermarkOpacity: number;
  rbDisclaimerText: string;
  rbWatermarkEnabled: boolean;
  updatedAt: string;
}

interface BrandingContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
}

const defaultSettings: SiteSettings = {
  id: "00000000-0000-0000-0000-000000000000",
  primaryColor: "#1f6be5",
  navbarLogo:
    "https://okxbrjdtqukxsumksexf.supabase.co/storage/v1/object/public/branding/1769789487705-980090963-seccap-logo.png",
  loadingLogo:
    "https://okxbrjdtqukxsumksexf.supabase.co/storage/v1/object/public/branding/1769789489037-648912146-seccap-logo.png",
  instituteShortName: "DJ GOV. SCIENCE COLLEGE",
  instituteFullName: "DJ GOV. SCIENCE COLLEGE",
  footerTitle: "DJ Gov. Science College Library",
  footerDescription:
    "DJ Government Science College Library is committed to providing quality educational resources and fostering a culture of learning and academic excellence.",
  facebookUrl: "https://facebook.com",
  twitterUrl: "https://twitter.com",
  instagramUrl: "https://instagram.com",
  youtubeUrl: "https://youtube.com",
  creditsText: "Made by  Abdul Samad, Muhammad Salman Bhatti (CS Field)",
  contributorsText:
    "Sir Ubaid Anwar (Head of Computer Department), Abdul Samad, Muhammad Salman Bhatti (CS Field)",
  contactAddress: "Nazimabad, Karachi, Pakistan",
  contactPhone: "+92 21 XXXX XXXX",
  contactEmail: "library@gcfm.edu.pk",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.680!2d67.0318857!3d24.909972...!", // truncated for brevity
  googleMapLink: "https://maps.app.goo.gl/ZL8emjpGbgZsknKA7",
  footerTagline: "Empowering Education Since 1953",
  heroBackgroundLogo: null,
  heroBackgroundOpacity: 0.35,
  // Library Card Layout Defaults
  cardHeaderText: "DJ GOV. SCIENCE COLLEGE",
  cardSubheaderText: "COLLEGE CARD",
  cardLogoUrl:
    "https://okxbrjdtqukxsumksexf.supabase.co/storage/v1/object/public/branding/1769846074511-358185530-Gsindh_Logo.png",
  cardQrEnabled: true,
  cardQrUrl: "https://gcmn-formen.vercel.app/",
  cardTermsText:
    "• Login using your Library Card ID\n• Use the password created at the time of application.\n• Your library card will work only after approval by the library administration.",
  cardContactAddress: "Karachi, Pakistan",
  cardContactEmail: "library@gcfm.edu.pk",
  cardContactPhone: "+92 21 X2111XXX XXXX",
  // Rare Book Preview Defaults
  rbWatermarkText: "DJ GOV. SCIENCE COLLEGE",
  rbWatermarkOpacity: 0.1,
  rbDisclaimerText: "Confidential • Do Not Distribute • DJGSC Library Archive",
  rbWatermarkEnabled: true,
  updatedAt: new Date().toISOString(),
};

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined,
);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};

/**
 * Append a cache-buster query parameter to Supabase Storage logo URLs.
 * This forces browsers to re-fetch the image whenever settings are updated.
 */
function cacheBustLogoUrl(url: string | null, timestamp: string): string | null {
  if (!url) return url;
  try {
    // Only bust Supabase storage URLs to avoid breaking external URLs
    const ts = new Date(timestamp).getTime() || Date.now();
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}t=${ts}`;
  } catch {
    return url;
  }
}

/**
 * Apply cache-busting to all logo fields in a settings object.
 */
function applyLogoCacheBusting(data: SiteSettings): SiteSettings {
  const ts = data.updatedAt || new Date().toISOString();
  return {
    ...data,
    navbarLogo: cacheBustLogoUrl(data.navbarLogo, ts),
    loadingLogo: cacheBustLogoUrl(data.loadingLogo, ts),
    heroBackgroundLogo: cacheBustLogoUrl(data.heroBackgroundLogo, ts),
    cardLogoUrl: cacheBustLogoUrl(data.cardLogoUrl, ts),
  };
}

// Helper to convert Hex to HSL components
function hexToHslComponents(hex: string): string {
  // Remove the hash if it exists
  const cleanHex = hex.replace(/^#/, "");

  // Expand 3-digit hex
  const rHex =
    cleanHex.length === 3
      ? cleanHex[0] + cleanHex[0]
      : cleanHex.substring(0, 2);
  const gHex =
    cleanHex.length === 3
      ? cleanHex[1] + cleanHex[1]
      : cleanHex.substring(2, 4);
  const bHex =
    cleanHex.length === 3
      ? cleanHex[2] + cleanHex[2]
      : cleanHex.substring(4, 6);

  let r = parseInt(rHex, 16) / 255;
  let g = parseInt(gHex, 16) / 255;
  let b = parseInt(bHex, 16) / 255;

  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem("gcfm-full-settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        // Ensure we immediately update CSS variables too if we have them
        // This is redundant with index.html script but ensures React sync
        if (typeof window !== "undefined") {
          // We can't easily call updateGlobalStyles here as it's not defined yet in scope
          // But the index.html script handles the CSS vars. 
          // This handles the React State (Text/Logos).
          return parsed;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to load cached settings:", e);
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          updateGlobalStyles(applyLogoCacheBusting(data));
        } else {
          // No settings found, use defaults
          updateGlobalStyles(defaultSettings);
        }
      } else {
        // API error, use defaults
        updateGlobalStyles(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      // On error, use defaults
      updateGlobalStyles(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update settings");
      }

      const updated = await res.json();
      updateGlobalStyles(updated);
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  };

  const updateGlobalStyles = (newSettings: SiteSettings) => {
    const color = newSettings.primaryColor;
    if (!color) return;

    console.log("[BrandingContext] Updating theme color to:", color);
    const hslComponents = hexToHslComponents(color);
    console.log("[BrandingContext] HSL components:", hslComponents);

    // Update all theme-related CSS variables
    document.documentElement.style.setProperty("--primary", hslComponents);
    document.documentElement.style.setProperty("--ring", hslComponents);
    document.documentElement.style.setProperty(
      "--pakistan-green",
      hslComponents,
    );
    document.documentElement.style.setProperty(
      "--pakistan-green-light",
      hslComponents,
    );
    document.documentElement.style.setProperty(
      "--pakistan-green-lighter",
      hslComponents,
    );
    document.documentElement.style.setProperty(
      "--pakistan-green-dark",
      hslComponents,
    );
    document.documentElement.style.setProperty(
      "--pakistan-green-darkest",
      hslComponents,
    );
    document.documentElement.style.setProperty("--accent", hslComponents);

    // Update the state as well
    setSettings(newSettings);

    // Cache the full settings in localStorage to prevent flash on next load
    try {
      localStorage.setItem("gcfm-full-settings", JSON.stringify(newSettings));
    } catch (e) {
      console.warn("[BrandingContext] Failed to cache settings:", e);
    }

    console.log("[BrandingContext] Theme variables updated successfully");
  };

  useEffect(() => {
    if (settings.instituteFullName) {
      document.title = settings.instituteFullName;
    }

    // Update favicon dynamically
    if (settings.navbarLogo) {
      const link: HTMLLinkElement =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = settings.navbarLogo;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
  }, [settings.instituteFullName, settings.navbarLogo]);

  useEffect(() => {
    // Apply cached settings immediately to prevent flash on load
    try {
      const cachedData = localStorage.getItem("gcfm-full-settings");
      if (cachedData) {
        const parsedSettings = JSON.parse(cachedData);
        // Re-apply cache-busting in case the timestamp changed since last save
        const busted = applyLogoCacheBusting(parsedSettings);
        console.log("[BrandingContext] Applying cached settings");
        setSettings(busted);
        updateGlobalStyles(busted);
      }
    } catch (e) {
      console.warn("[BrandingContext] Failed to load cached settings:", e);
    }

    // Then fetch fresh settings from the server
    fetchSettings();
  }, []);

  return (
    <BrandingContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};
