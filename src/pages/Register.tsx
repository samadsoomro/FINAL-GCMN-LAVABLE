import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  Phone,
  CheckCircle,
  CreditCard,
  Briefcase,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBranding } from "@/contexts/BrandingContext";
import collegeLogo from "@/assets/images/college-logo.png";

interface LibraryCardData {
  cardNumber: string;
  firstName: string;
  lastName: string;
  class: string;
  field: string;
  rollNo: string;
  status: string;
}

const Register = () => {
  const [activeTab, setActiveTab] = useState<"student" | "non-student">(
    "student",
  );

  const [nonStudentForm, setNonStudentForm] = useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, register: authRegister } = useAuth();
  const { settings } = useBranding();
  const navigate = useNavigate();

  const roles = ["Professor", "Lecturer", "Staff Member", "Visitor", "Other"];

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleNonStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !nonStudentForm.fullName ||
      !nonStudentForm.role ||
      !nonStudentForm.email ||
      !nonStudentForm.password ||
      !nonStudentForm.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (nonStudentForm.password !== nonStudentForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (nonStudentForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await authRegister({
        email: nonStudentForm.email,
        password: nonStudentForm.password,
        full_name: nonStudentForm.fullName,
        phone: nonStudentForm.phone,
        classification: nonStudentForm.role,
      });

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl border border-border text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Registration Successful!
          </h1>
          <p className="text-muted-foreground mb-6">
            Your account has been created successfully. You can now log in to
            access the library.
          </p>
          <Link to="/login">
            <Button className="w-full" data-testid="button-go-to-login">
              Go to Login
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-4 pakistan-bg pt-24 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-lg bg-card p-8 rounded-2xl shadow-xl border border-border"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg bg-white p-2">
            <img
              src={settings.navbarLogo || collegeLogo}
              alt={`${settings.instituteShortName} College Logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">
            Register for {settings.instituteShortName} access
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "student" | "non-student")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="student"
              className="gap-2"
              data-testid="tab-student"
            >
              <CreditCard size={16} />
              Student
            </TabsTrigger>
            <TabsTrigger
              value="non-student"
              className="gap-2"
              data-testid="tab-non-student"
            >
              <Briefcase size={16} />
              Staff/Visitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <div className="space-y-6 py-4">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <CreditCard size={40} className="text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Students Do Not Need to Register
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Students do not need to create an account. Please log in
                  directly using your Library Card ID.
                </p>
              </div>

              <div className="bg-muted/30 border border-muted rounded-lg p-4">
                <p className="text-sm text-foreground font-medium mb-2">
                  How to Log In:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                  <li>✓ Visit the Login page</li>
                  <li>✓ Select "Library Card ID Login"</li>
                  <li>✓ Enter your approved Library Card ID</li>
                  <li>✓ Access the library immediately</li>
                </ul>
              </div>

              <Link to="/login">
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                  data-testid="button-student-login"
                >
                  <CreditCard size={18} />
                  Login with Library Card ID
                </Button>
              </Link>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              <Link to="/library-card">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  data-testid="button-student-apply-card"
                >
                  <UserPlus size={18} />
                  Don't Have a Library Card? Apply Now
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="non-student">
            <form onSubmit={handleNonStudentSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <User size={16} />
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={nonStudentForm.fullName}
                  onChange={(e) =>
                    setNonStudentForm({
                      ...nonStudentForm,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                  data-testid="input-full-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Briefcase size={16} />
                  Role *
                </label>
                <Select
                  value={nonStudentForm.role}
                  onValueChange={(value) =>
                    setNonStudentForm({ ...nonStudentForm, role: value })
                  }
                >
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Mail size={16} />
                  Email *
                </label>
                <Input
                  type="email"
                  value={nonStudentForm.email}
                  onChange={(e) =>
                    setNonStudentForm({
                      ...nonStudentForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="your@email.com"
                  data-testid="input-non-student-email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={nonStudentForm.phone}
                  onChange={(e) =>
                    setNonStudentForm({
                      ...nonStudentForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+92 300 1234567"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Lock size={16} />
                  Password *
                </label>
                <Input
                  type="password"
                  value={nonStudentForm.password}
                  onChange={(e) =>
                    setNonStudentForm({
                      ...nonStudentForm,
                      password: e.target.value,
                    })
                  }
                  placeholder="At least 6 characters"
                  data-testid="input-non-student-password"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  <Lock size={16} />
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  value={nonStudentForm.confirmPassword}
                  onChange={(e) =>
                    setNonStudentForm({
                      ...nonStudentForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm your password"
                  data-testid="input-non-student-confirm-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading}
                data-testid="button-non-student-register"
              >
                <UserPlus size={18} />
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {activeTab === "non-student" && (
          <>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in here
              </Link>
            </p>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Don't have a Library Card?{" "}
              <Link
                to="/library-card"
                className="text-primary font-medium hover:underline"
              >
                Apply for one here
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Register;
