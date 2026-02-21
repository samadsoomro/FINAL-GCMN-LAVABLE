import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import {
  BookOpen,
  Wifi,
  Users,
  Computer,
  Library,
  Percent,
  Check,
  ArrowRight,
  ArrowLeft,
  Download,
  CreditCard,
  Eye,
  EyeOff,
  RefreshCcw,
} from "lucide-react";
import { jsPDF } from "jspdf";
import collegeLogo from "@/assets/images/college-logo.png";

const getQRCodeUrl = (text: string, size: number = 100) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
};

const benefits = [
  { icon: BookOpen, title: "Borrow books, DVDs, and audiobooks" },
  { icon: Wifi, title: "Access digital resources from anywhere" },
  { icon: Users, title: "Reserve meeting rooms" },
  { icon: Computer, title: "Free computer and WiFi access" },
  { icon: Library, title: "Interlibrary loan services" },
  { icon: Percent, title: "Discounts at local partners" },
];

const getFieldCode = (field: string): string => {
  const fieldCodeMap: Record<string, string> = {
    "Computer Science": "CS",
    Commerce: "COM",
    Humanities: "HM",
    "Pre-Engineering": "PE",
    "Pre-Medical": "PM",
  };
  return (
    fieldCodeMap[field] || (field ? field.substring(0, 3).toUpperCase() : "XX")
  );
};

interface CustomField {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  showOnForm: boolean;
  showOnCard: boolean;
  showInAdmin: boolean;
  displayOrder: number;
}
interface FormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  dob: string;
  studentClass: string;
  field: string;
  rollNo: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  password?: string;
  dynamicFields?: Record<string, string>;
}

interface SubmissionResult {
  cardNumber: string;
  studentId: string;
  issueDate: string;
  validThrough: string;
  formData: FormData;
}

const LibraryCard = () => {
  const { settings } = useBranding();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isFieldsLoading, setIsFieldsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    fatherName: "",
    dob: "",
    studentClass: "",
    field: "",
    rollNo: "",
    email: "",
    phone: "",
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressZip: "",
    password: "",
    dynamicFields: {},
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchFields = async () => {
      try {
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
    fetchFields();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDynamicFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      dynamicFields: {
        ...(prev.dynamicFields || {}),
        [key]: value,
      },
    }));
  };

  const validateStep1 = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.fatherName ||
      !formData.dob ||
      !formData.studentClass ||
      !formData.field ||
      !formData.rollNo
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    // Validate dynamic fields
    const missingRequired = customFields
      .filter((f) => f.isRequired && f.showOnForm)
      .filter((f) => !formData.dynamicFields?.[f.fieldKey]);

    if (missingRequired.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in required field: ${missingRequired[0].fieldLabel}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including password.",
        variant: "destructive",
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (
      !formData.addressStreet ||
      !formData.addressCity ||
      !formData.addressState ||
      !formData.addressZip
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/library-card-applications", {
        userId: user?.id || null,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fatherName: formData.fatherName,
        dob: formData.dob,
        class: formData.studentClass,
        field: formData.field,
        rollNo: formData.rollNo,
        email: formData.email,
        phone: formData.phone,
        addressStreet: formData.addressStreet,
        addressCity: formData.addressCity,
        addressState: formData.addressState,
        addressZip: formData.addressZip,
        password: formData.password,
        dynamicFields: formData.dynamicFields,
      });

      const data = await res.json();

      setSubmissionResult({
        cardNumber: data.cardNumber,
        studentId: data.studentId,
        issueDate: data.issueDate,
        validThrough: data.validThrough,
        formData,
      });

      toast({
        title: "Application Submitted!",
        description:
          "Your library card application has been submitted successfully.",
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    if (!submissionResult) return;

    const doc = new jsPDF("p", "mm", "a4");
    const { cardNumber, studentId, issueDate, validThrough, formData } =
      submissionResult;

    const qrDestination = settings.cardQrEnabled
      ? settings.cardQrUrl
      : `https://gcmn-library.replit.dev/library-card/${cardNumber}`;
    const qrCodeUrl = getQRCodeUrl(qrDestination, 100);

    // Fetch QR Code
    const response = await fetch(qrCodeUrl);
    const blob = await response.blob();
    const qrCodeDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // Load Logo (Dynamic or Default)
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = settings.cardLogoUrl || collegeLogo;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // Fallback to avoid hanging
    });

    // Draw Logo to Canvas to get Data URL (standardize format)
    const canvas = document.createElement("canvas");
    canvas.width = logoImg.width;
    canvas.height = logoImg.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(logoImg, 0, 0);
    const logoDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    // --- CONSTANTS ---
    const pageW = 210;
    const margin = 15;
    const boxW = 180;
    const boxH = 120; // Approx half page
    const topY = 15; // Top box start Y
    const botY = 150; // Bottom box start Y

    // Helper to convert hex to RGB for jsPDF
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [22, 78, 59];
    };

    const primaryColorRgb = hexToRgb(settings.primaryColor);
    const whiteColor: [number, number, number] = [255, 255, 255];

    // ==========================================
    // TOP HALF - FRONT SIDE
    // ==========================================

    // Border
    doc.setDrawColor(...primaryColorRgb);
    doc.setLineWidth(0.8);
    doc.rect(margin, topY, boxW, boxH);

    // Header Background (Color Strip)
    doc.setFillColor(...primaryColorRgb);
    doc.rect(margin, topY, boxW, 28, "F");

    // Logo
    doc.addImage(logoDataUrl, "JPEG", margin + 5, topY + 2, 24, 24);

    // Header Text (White on Color)
    doc.setTextColor(...whiteColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Government of Sindh", pageW / 2, topY + 8, { align: "center" });
    doc.text("College Education Department", pageW / 2, topY + 12, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(
      settings.cardHeaderText || settings.instituteFullName.toUpperCase(),
      pageW / 2,
      topY + 19,
      { align: "center" },
    );

    doc.setFontSize(10);
    doc.text(
      settings.cardSubheaderText || "LIBRARY CARD",
      pageW / 2,
      topY + 25,
      { align: "center" },
    );

    // --- DETAILS SECTION ---
    doc.setTextColor(0, 0, 0);
    const detailsX = margin + 10;
    let currentY = topY + 36;
    const lineHeight = 6; // Compacted for dynamic fields

    // Photo Box (Right side)
    const photoW = 30;
    const photoH = 35;
    const photoX = margin + boxW - photoW - 10;
    const photoY = topY + 35;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(photoX, photoY, photoW, photoH);
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("Paste", photoX + photoW / 2, photoY + photoH / 2 - 2, {
      align: "center",
    });
    doc.text("Photograph", photoX + photoW / 2, photoY + photoH / 2 + 2, {
      align: "center",
    });
    doc.text("Here", photoX + photoW / 2, photoY + photoH / 2 + 6, {
      align: "center",
    });

    // Details Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);

    const labelW = 35;

    const addDetail = (
      label: string,
      value: string,
      boldValue = false,
      highlight = false,
    ) => {
      // Don't overflow boxH
      if (currentY > topY + boxH - 20) return;

      doc.setFont("helvetica", "bold");
      doc.text(label, detailsX, currentY);

      if (highlight) {
        doc.setTextColor(...primaryColorRgb);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(value, detailsX + labelW, currentY);
        doc.setFontSize(9); // Reset
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
      } else {
        doc.setFont("helvetica", boldValue ? "bold" : "normal");
        doc.text(value, detailsX + labelW, currentY);
      }
      currentY += lineHeight;
    };

    addDetail(
      "Name:",
      `${formData.firstName} ${formData.lastName}`,
      true,
      true,
    );
    addDetail("Father Name:", formData.fatherName || "-");
    addDetail(
      "Date of Birth:",
      new Date(formData.dob).toLocaleDateString("en-GB"),
    );
    addDetail("Class:", formData.studentClass, true, true);
    addDetail(
      "Field:",
      `${formData.field} (${getFieldCode(formData.field)})`,
      true,
      true,
    );
    addDetail("Roll Number:", formData.rollNo);

    // Render Dynamic Fields (that were configured for card)
    customFields
      .filter((f) => f.showOnCard)
      .forEach((f) => {
        const val = formData.dynamicFields?.[f.fieldKey] || "-";
        addDetail(`${f.fieldLabel}:`, val);
      });

    // HIGHLIGHT LIBRARY CARD ID
    currentY += 1;
    addDetail("Library Card ID:", cardNumber, true, true);
    currentY += 1;

    addDetail("Issue Date:", new Date(issueDate).toLocaleDateString("en-GB"));
    addDetail(
      "Valid Through:",
      new Date(validThrough).toLocaleDateString("en-GB"),
    );

    // QR Code (Bottom Right of Front Box)
    if (settings.cardQrEnabled) {
      const qrSize = 25;
      const qrX = margin + boxW - qrSize - 10;
      const qrY = topY + boxH - qrSize - 10;
      doc.addImage(qrCodeDataUrl, "JPEG", qrX, qrY, qrSize, qrSize);
    }

    // Signature (Between Valid Through text and QR Code)
    const sigLineX = detailsX + 80;
    const sigLineY = topY + boxH - 15;
    const sigLineW = 45;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(sigLineX, sigLineY, sigLineX + sigLineW, sigLineY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Principal's Signature", sigLineX + sigLineW / 2, sigLineY + 4, {
      align: "center",
    });

    // ==========================================
    // BOTTOM HALF - BACK SIDE
    // ==========================================

    // Border
    doc.setDrawColor(...primaryColorRgb);
    doc.setLineWidth(0.8);
    doc.rect(margin, botY, boxW, boxH);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TERMS & CONDITIONS", pageW / 2, botY + 15, { align: "center" });

    // Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    let termY = botY + 25;
    const termX = margin + 12;
    const termSpacing = 5;

    const terms = (settings.cardTermsText || "").split("\n");

    terms.forEach((line) => {
      if (termY > botY + boxH - 25) return;
      doc.text(line, termX, termY);
      termY += termSpacing;
    });

    // Contact Details
    termY = botY + boxH - 20;
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT DETAILS:", termX, termY);
    termY += termSpacing;
    doc.setFont("helvetica", "normal");
    doc.text(
      settings.cardContactAddress || `Library, ${settings.instituteShortName}`,
      termX,
      termY,
    );
    termY += termSpacing;
    doc.text(
      `Email: ${settings.cardContactEmail || "library@example.edu"} | Phone: ${settings.cardContactPhone || "+92 21 XXXX XXXX"}`,
      termX,
      termY,
    );

    doc.save(`library-card-${cardNumber}.pdf`);
  };

  if (submissionResult) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your library card PDF is ready for download.
            </p>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <CreditCard className="w-8 h-8 text-primary" />
                  <span className="text-xl font-mono font-bold text-foreground">
                    {submissionResult.cardNumber}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Library Card ID - Use this to register for library access
                </p>
                <p className="text-xs text-muted-foreground">
                  Student ID: {submissionResult.studentId}
                </p>
              </CardContent>
            </Card>

            <Button
              onClick={generatePDF}
              size="lg"
              className="gap-2"
              data-testid="button-download-pdf"
            >
              <Download className="w-5 h-5" />
              Download Library Card PDF
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 md:whitespace-nowrap">
            Get Your Library Card
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A library card is your key to unlimited learning. Apply online and
            start exploring today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Card Benefits
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Everything included with your free library card:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">
                      {benefit.title}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    s <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors ${
                      s < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Application Form - Step {step} of 3</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          placeholder="Enter first name"
                          data-testid="input-first-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="Enter last name"
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father Name *</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) =>
                          handleInputChange("fatherName", e.target.value)
                        }
                        placeholder="Enter father's name"
                        data-testid="input-father-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) =>
                          handleInputChange("dob", e.target.value)
                        }
                        data-testid="input-dob"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class">Class *</Label>
                        <Select
                          value={formData.studentClass}
                          onValueChange={(value) =>
                            handleInputChange("studentClass", value)
                          }
                        >
                          <SelectTrigger data-testid="select-class">
                            <SelectValue placeholder="Select your class" />
                          </SelectTrigger>
                          <SelectContent>
                            {customFields
                              .find((f) => f.fieldKey === "class")
                              ?.options?.map((c: string) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="field">Field / Group *</Label>
                        <Select
                          value={formData.field}
                          onValueChange={(value) =>
                            handleInputChange("field", value)
                          }
                        >
                          <SelectTrigger data-testid="select-field">
                            <SelectValue placeholder="Select your field" />
                          </SelectTrigger>
                          <SelectContent>
                            {customFields
                              .find((f) => f.fieldKey === "field")
                              ?.options?.map((f: string) => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll Number *</Label>
                      <Input
                        id="rollNo"
                        value={formData.rollNo}
                        onChange={(e) =>
                          handleInputChange("rollNo", e.target.value)
                        }
                        placeholder="e.g., E-125"
                        data-testid="input-roll-no"
                      />
                    </div>
                    {/* Dynamic Fields from Builder */}
                    {isFieldsLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <RefreshCcw className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Loading specific fields...
                        </span>
                      </div>
                    ) : (
                      customFields
                        .filter(
                          (f) =>
                            f.showOnForm &&
                            f.fieldKey !== "class" &&
                            f.fieldKey !== "field",
                        )
                        .map((field) => (
                          <div key={field.id} className="space-y-2">
                            <Label htmlFor={field.fieldKey}>
                              {field.fieldLabel} {field.isRequired ? "*" : ""}
                            </Label>
                            {field.fieldType === "date" ? (
                              <Input
                                id={field.fieldKey}
                                type="date"
                                value={
                                  formData.dynamicFields?.[field.fieldKey] || ""
                                }
                                onChange={(e) =>
                                  handleDynamicFieldChange(
                                    field.fieldKey,
                                    e.target.value,
                                  )
                                }
                                placeholder={field.fieldLabel}
                              />
                            ) : field.fieldType === "number" ? (
                              <Input
                                id={field.fieldKey}
                                type="number"
                                value={
                                  formData.dynamicFields?.[field.fieldKey] || ""
                                }
                                onChange={(e) =>
                                  handleDynamicFieldChange(
                                    field.fieldKey,
                                    e.target.value,
                                  )
                                }
                                placeholder={field.fieldLabel}
                              />
                            ) : field.fieldType === "select" ? (
                              <Select
                                value={
                                  formData.dynamicFields?.[field.fieldKey] || ""
                                }
                                onValueChange={(val) =>
                                  handleDynamicFieldChange(field.fieldKey, val)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={`Select ${field.fieldLabel}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.isArray(field.options) &&
                                    field.options.map((opt: string) => (
                                      <SelectItem key={opt} value={opt}>
                                        {opt}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={field.fieldKey}
                                value={
                                  formData.dynamicFields?.[field.fieldKey] || ""
                                }
                                onChange={(e) =>
                                  handleDynamicFieldChange(
                                    field.fieldKey,
                                    e.target.value,
                                  )
                                }
                                placeholder={field.fieldLabel}
                              />
                            )}
                          </div>
                        ))
                    )}

                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleNext}
                        className="gap-2"
                        data-testid="button-next-step1"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="Enter phone number"
                        data-testid="input-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Login Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          placeholder="Create a password for your card login"
                          data-testid="input-card-password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-md font-medium">
                        You must remember your password. This password will be
                        required when logging in with your Card ID.
                      </p>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="gap-2"
                        data-testid="button-back-step2"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="gap-2"
                        data-testid="button-next-step2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="addressStreet">Street Address *</Label>
                      <Input
                        id="addressStreet"
                        value={formData.addressStreet}
                        onChange={(e) =>
                          handleInputChange("addressStreet", e.target.value)
                        }
                        placeholder="Enter street address"
                        data-testid="input-address-street"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="addressCity">City *</Label>
                        <Input
                          id="addressCity"
                          value={formData.addressCity}
                          onChange={(e) =>
                            handleInputChange("addressCity", e.target.value)
                          }
                          placeholder="Enter city"
                          data-testid="input-address-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="addressState">State/Province *</Label>
                        <Input
                          id="addressState"
                          value={formData.addressState}
                          onChange={(e) =>
                            handleInputChange("addressState", e.target.value)
                          }
                          placeholder="Enter state"
                          data-testid="input-address-state"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressZip">ZIP/Postal Code *</Label>
                      <Input
                        id="addressZip"
                        value={formData.addressZip}
                        onChange={(e) =>
                          handleInputChange("addressZip", e.target.value)
                        }
                        placeholder="Enter ZIP code"
                        data-testid="input-address-zip"
                      />
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="gap-2"
                        data-testid="button-back-step3"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2"
                        data-testid="button-submit-application"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LibraryCard;
