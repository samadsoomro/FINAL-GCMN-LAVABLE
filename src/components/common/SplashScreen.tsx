import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";
import collegeLogo from "@/assets/images/college-logo.png";

interface SplashScreenProps {
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { settings } = useBranding();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background with Pakistan Flag Colors */}
          <div className="absolute inset-0 flex">
            <motion.div
              className="flex-[3]"
              style={{
                background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.primaryColor}dd 100%)`,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <motion.div
              className="flex-1 bg-gradient-to-br from-white to-gray-50"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl px-8">
            {/* College Logo Animation */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                type: "spring",
                bounce: 0.4,
              }}
            >
              <motion.div
                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center overflow-hidden"
                animate={{
                  boxShadow: [
                    `0 0 20px ${settings.primaryColor}44`,
                    `0 0 40px ${settings.primaryColor}66`,
                    `0 0 20px ${settings.primaryColor}44`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img
                  src={
                    settings.loadingLogo || settings.navbarLogo || collegeLogo
                  }
                  alt={`${settings.instituteShortName} College Logo`}
                  className="w-full h-full object-contain p-2"
                  style={{ imageRendering: "high-quality" as any }} // Force high quality scaling
                />
              </motion.div>

              {/* Sparkles around logo */}
              <motion.div
                className="absolute -top-2 -right-2 text-pakistan-gold"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 1.5, delay: 1.2 }}
              >
                <Sparkles size={24} />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 text-pakistan-gold"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1, 1.2, 1], rotate: [0, -360] }}
                transition={{ duration: 1.5, delay: 1.4 }}
              >
                <Sparkles size={20} />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-white text-center mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
            >
              {settings.instituteShortName}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg text-white/80 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
            >
              {settings.instituteFullName}
            </motion.p>

            {/* Loading Indicator */}
            <motion.div
              className="mt-8 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
            >
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: settings.primaryColor,
                  animationDelay: "0ms",
                }}
              />
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: settings.primaryColor,
                  animationDelay: "150ms",
                }}
              />
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: settings.primaryColor,
                  animationDelay: "300ms",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
