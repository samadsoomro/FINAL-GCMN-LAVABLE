import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I get a library card?",
    answer:
      "Bring your student ID to the circulation desk or sign up online through your student portal. The library card will be issued within 24 hours of verification.",
  },
  {
    question: "Can I access e-resources from home?",
    answer:
      "Yes, log in with your campus credentials through our digital library portal. You'll have access to e-books, journals, and other digital resources from anywhere.",
  },
  {
    question: "How long can I borrow books?",
    answer:
      "Undergraduates can borrow books for 2 weeks, while graduates and faculty can borrow for 4 weeks. Extensions may be granted if there are no pending reservations.",
  },
  {
    question: "Does the library have study rooms?",
    answer:
      "Yes, we have individual and group study rooms available. You can book them online in advance through the library portal or at the circulation desk.",
  },
  {
    question: "Can alumni use the library?",
    answer:
      "Alumni may use on-site resources for reading and reference. For borrowing privileges, alumni can apply for a membership at the library office.",
  },
  {
    question: "Where can I get research help?",
    answer:
      "Reference librarians are available Monday through Friday during office hours. You can also schedule a consultation for in-depth research assistance.",
  },
];

const FAQ: React.FC = () => {
  return (
    <motion.section
      className="py-12 lg:py-16 bg-muted/30"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find answers to common questions about our library services
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </motion.section>
  );
};

export default FAQ;
