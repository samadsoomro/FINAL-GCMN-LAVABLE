import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Award, Calendar } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import FAQ from "@/components/FAQ";

const About: React.FC = () => {
  const { settings } = useBranding();
  const stats = [
    { icon: <Calendar size={32} />, number: "1953", label: "Established" },
    { icon: <BookOpen size={32} />, number: "25,000+", label: "Books" },
    { icon: <Users size={32} />, number: "2,000+", label: "Students" },
    { icon: <Award size={32} />, number: "70+", label: "Years of Excellence" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
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
            About {settings.instituteShortName}
          </motion.h1>
          <motion.p
            className="text-lg text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {settings.instituteFullName} - Empowering Education Since 1953
          </motion.p>
        </div>
      </div>
      <div className="py-12 lg:py-16">
        <div className="container">
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg hover:-translate-y-1 transition-all"
                variants={itemVariants}
              >
                <div className="text-primary mb-3">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="prose max-w-3xl mx-auto text-muted-foreground"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Our History
            </h2>
            <p className="mb-4">
              {settings.instituteFullName} was established in 1953 and has been
              a pillar of higher education in Karachi for over seven decades.
            </p>
            <p>
              Our library houses over 25,000 books covering various subjects
              including science, humanities, literature, and Islamic studies,
              serving thousands of students annually.
            </p>
          </motion.div>
        </div>
      </div>
      <FAQ />
    </motion.div>
  );
};

export default About;
