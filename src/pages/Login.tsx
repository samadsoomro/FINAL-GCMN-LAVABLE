import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Key,
  CreditCard,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranding } from "@/contexts/BrandingContext";
import collegeLogo from "@/assets/images/college-logo.png";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    secretKey: "",
    libraryCardId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [useLibraryCard, setUseLibraryCard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, isAdmin } = useAuth();
  const { settings } = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from =
        (location.state as any)?.from?.pathname ||
        (isAdmin ? "/admin-dashboard" : "/");
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (useLibraryCard) {
      if (!formData.libraryCardId || !formData.password) {
        setError("Please enter both Library Card ID and Password.");
        setLoading(false);
        return;
      }

      const result = await login(
        undefined,
        formData.password,
        undefined,
        formData.libraryCardId,
      );

      if (!result.success) {
        const errorMessage = result.error || "Login failed";
        if (errorMessage.toLowerCase().includes("write correct details")) {
          setError("Write correct details");
        } else if (
          errorMessage.toLowerCase().includes("wait for approval by library")
        ) {
          setError("Wait for approval by library");
        } else if (errorMessage.toLowerCase().includes("rejected")) {
          setError("Your library card application was rejected.");
        } else if (errorMessage.toLowerCase().includes("not active")) {
          setError("Library card is not active. Please contact the library.");
        } else {
          setError(errorMessage);
        }
      }
    } else {
      if (!formData.email || !formData.password) {
        setError("Please fill in email and password");
        setLoading(false);
        return;
      }

      const result = await login(
        formData.email,
        formData.password,
        formData.secretKey || undefined,
      );
      if (!result.success) {
        setError(result.error || "Login failed");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
            <img
              src={settings.navbarLogo || collegeLogo}
              alt={`${settings.instituteShortName} College Logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your {settings.instituteShortName} account
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setUseLibraryCard(false)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                !useLibraryCard
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Mail size={14} className="inline mr-1" />
              Email Login
            </button>
            <button
              type="button"
              onClick={() => setUseLibraryCard(true)}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                useLibraryCard
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <CreditCard size={14} className="inline mr-1" />
              Card ID
            </button>
          </div>

          {!useLibraryCard ? (
            <>
              <p className="text-sm text-center text-muted-foreground mb-4 bg-muted/30 p-2 rounded-lg border border-border/50">
                Staff/Visitor login through their Email & Password
              </p>
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Mail size={16} />
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-center text-muted-foreground mb-4 bg-muted/30 p-2 rounded-lg border border-border/50">
                Students login through their Card ID & Password
              </p>
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <CreditCard size={16} />
                  Library Card ID
                </label>
                <Input
                  type="text"
                  value={formData.libraryCardId}
                  onChange={(e) =>
                    setFormData({ ...formData, libraryCardId: e.target.value })
                  }
                  placeholder="e.g., CS-E-09-12"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
              <Lock size={16} />
              {useLibraryCard ? "Card Login Password" : "Password"}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!useLibraryCard && (
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <Key size={16} />
                Secret Key (Required for Admin)
              </label>
              <Input
                type="password"
                value={formData.secretKey}
                onChange={(e) =>
                  setFormData({ ...formData, secretKey: e.target.value })
                }
                placeholder="Required for Admin Access"
              />
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <LogIn size={18} />
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {useLibraryCard ? (
            <>
              Don't have a library card?{" "}
              <Link
                to="/library-card"
                className="text-primary font-medium hover:underline"
              >
                Apply for it
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Register here
              </Link>
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
