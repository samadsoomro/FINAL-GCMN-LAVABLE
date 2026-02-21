import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Heart,
  Smartphone,
  CreditCard,
  Check,
  Copy,
  Loader2,
} from "lucide-react";

const donationAmounts = [500, 1000, 2000, 5000, 10000];

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminDonationInfo, setAdminDonationInfo] = useState<any>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDonationInfo = async () => {
      try {
        const res = await fetch("/api/admin/stats"); // Use existing stats endpoint or similar
        if (res.ok) {
          const data = await res.json();
          setAdminDonationInfo(data);
        }
      } catch (e) {
        console.error("Failed to fetch donation info", e);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchDonationInfo();
  }, []);

  const getAmount = () => {
    if (customAmount) return parseFloat(customAmount);
    return selectedAmount || 0;
  };

  const handleDonation = async (method: string) => {
    const amount = getAmount();
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (!name || !email) {
      toast({
        title: "Missing Information",
        description:
          "Please provide your name and email so we can acknowledge your donation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/donations", {
        amount: amount.toString(),
        method,
        donorName: name,
        email: email,
        message: message || null,
      });

      setIsSuccess(true);
      toast({
        title: "Thank You!",
        description:
          "Your donation has been recorded. We appreciate your support!",
      });
    } catch (error: any) {
      console.error("Error recording donation:", error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
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
              Thank You for Your Generosity!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your donation of PKR {getAmount().toLocaleString()} has been
              recorded. Your support helps us provide better resources and
              services to our students.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              data-testid="button-return-home"
            >
              Return to Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Support Our Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generous donations help us acquire new books, maintain our
            facilities, and provide better services to students and the
            community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Select Amount</CardTitle>
                <CardDescription>
                  Choose a preset amount or enter a custom value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {donationAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={
                        selectedAmount === amount ? "default" : "outline"
                      }
                      className="h-14"
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      data-testid={`button-amount-${amount}`}
                    >
                      PKR {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or enter custom amount
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customAmount">Custom Amount (PKR)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    data-testid="input-custom-amount"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-donor-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-donor-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Leave a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      data-testid="input-donor-message"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Donation Methods</CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="easypaisa" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="easypaisa" className="gap-2">
                      <Smartphone className="w-4 h-4" />
                      EasyPaisa
                    </TabsTrigger>
                    <TabsTrigger value="card" className="gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="easypaisa" className="space-y-6 mt-6">
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <div className="w-32 h-32 bg-background rounded-lg mx-auto mb-4 flex items-center justify-center border">
                        <div className="text-center">
                          <Smartphone className="w-12 h-12 text-primary mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            Scan QR
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        EasyPaisa Number
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <p className="text-2xl font-mono font-bold text-primary">
                          0300-1234567
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            navigator.clipboard.writeText("03001234567");
                            toast({
                              title: "Copied!",
                              description:
                                "EasyPaisa number copied to clipboard",
                            });
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Account Title: GC Men Nazimabad Library
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleDonation("easypaisa")}
                      disabled={isSubmitting || !getAmount()}
                      data-testid="button-confirm-easypaisa"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : `Confirm Donation - PKR ${getAmount().toLocaleString()}`}
                    </Button>
                  </TabsContent>

                  <TabsContent value="card" className="space-y-6 mt-6">
                    <div className="p-6 bg-muted rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Account Number
                          </p>
                          <p className="font-mono font-bold">
                            1234567890123456
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText("1234567890123456");
                            toast({
                              title: "Copied!",
                              description: "Account number copied to clipboard",
                            });
                          }}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Bank Name
                        </p>
                        <p className="font-bold">Habib Bank Limited (HBL)</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Branch</p>
                        <p className="font-bold">Nazimabad Branch, Karachi</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          Or pay with card
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" type="password" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" placeholder="Enter name on card" />
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleDonation("card")}
                      disabled={isSubmitting || !getAmount()}
                      data-testid="button-confirm-card"
                    >
                      {isSubmitting
                        ? "Processing..."
                        : `Donate PKR ${getAmount().toLocaleString()}`}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Your payment information is secure and encrypted.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
