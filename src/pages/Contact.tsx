import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  User,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useBranding } from "@/contexts/BrandingContext";

const Contact = () => {
  const { toast } = useToast();
  const { settings } = useBranding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("POST", "/api/contact-messages", formData);

      try {
        await apiRequest("POST", "/api/send-contact-confirmation", formData);
      } catch (emailError) {
        console.error("Email error:", emailError);
      }

      setShowSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });

      toast({
        title: "Message Sent!",
        description:
          "Thank you for contacting us. Your query has been received.",
      });
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    { icon: <MapPin />, title: "Address", content: settings.contactAddress },
    { icon: <Phone />, title: "Phone", content: settings.contactPhone },
    { icon: <Mail />, title: "Email", content: settings.contactEmail },
    { icon: <Clock />, title: "Hours", content: "Mon-Fri: 9AM - 1PM" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="py-12 lg:py-16 gradient-dark text-white text-center overflow-hidden">
        <div className="container">
          <motion.h1
            className="text-3xl lg:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-lg text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Get in touch with us for official information, student support, and
            general inquiries.
          </motion.p>
        </div>
      </div>

      <div className="py-12 lg:py-16">
        <div className="container">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {contactCards.map((item) => (
              <motion.div
                key={item.title}
                className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg hover:-translate-y-1 transition-all"
                variants={itemVariants}
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm">{item.content}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              className="bg-card p-8 rounded-xl border border-border"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MessageSquare className="text-primary" />
                Send Us a Message
              </h2>

              {showSuccess ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-primary/20 rounded-full">
                    <Send className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Thank You!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for contacting us. Your query has been received.
                    <br />
                    We'll get back to you soon.
                  </p>
                  <Button onClick={() => setShowSuccess(false)}>
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <User size={16} />
                      Name
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your full name"
                      required
                      data-testid="input-name"
                    />
                  </div>

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
                      placeholder="your.email@example.com"
                      required
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <FileText size={16} />
                      Subject
                    </label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Topic of your message"
                      required
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                      <MessageSquare size={16} />
                      Message
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="How can we help you?"
                      rows={5}
                      required
                      data-testid="input-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-submit-contact"
                  >
                    {isSubmitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.div
              className="rounded-xl overflow-hidden border border-border h-full min-h-[400px]"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <iframe
                src={
                  settings.mapEmbedUrl &&
                  settings.mapEmbedUrl.includes("google.com/maps/embed")
                    ? settings.mapEmbedUrl
                    : `https://maps.google.com/maps?q=${encodeURIComponent(settings.contactAddress || "Karachi, Pakistan")}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${settings.instituteShortName} Location`}
              />
            </motion.div>
          </div>

          <motion.div
            className="bg-card p-8 rounded-xl border border-border mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Clock className="text-primary" />
              Office Hours
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">
                  Monday - Friday
                </h4>
                <p className="text-primary text-lg font-medium">
                  9:00 AM - 1:00 PM
                </p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Saturday</h4>
                <p className="text-primary text-lg font-medium">
                  9:00 AM - 12:00 PM
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Sunday</h4>
                <p className="text-muted-foreground text-lg font-medium">
                  Closed
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
