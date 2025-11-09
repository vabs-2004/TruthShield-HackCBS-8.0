import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react"; // optional: npm i lucide-react

const LoadingScreen = ({ onFinish }) => {
  const [loading, setLoading] = useState(true);
  const [textIndex, setTextIndex] = useState(0);

  const phrases = [
    "Initializing TruthShield Core...",
    "Establishing Secure Connection...",
    "Scanning News Networks...",
    "Analyzing Media Authenticity...",
    "Verifying Deepfake Signatures...",
    "System Integrity Confirmed ✅",
  ];

  useEffect(() => {
    // sequence text every 700ms
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % phrases.length);
    }, 700);
    // total duration before redirect
    const timer = setTimeout(() => {
      setLoading(false);
      if (onFinish) onFinish();
    }, 4000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#010b16] text-white overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
        >
          {/* Background matrix dots */}
          <div className="absolute inset-0 grid grid-cols-[repeat(auto-fit,minmax(40px,1fr))] grid-rows-[repeat(auto-fit,minmax(40px,1fr))] opacity-10">
            {Array.from({ length: 400 }).map((_, i) => (
              <motion.span
                key={i}
                className="block w-1 h-1 bg-cyan-400 rounded-full"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Rotating glowing shield */}
          <motion.div
            className="relative flex items-center justify-center mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute w-40 h-40 rounded-full border border-cyan-500 blur-[2px] opacity-70 animate-pulse" />
            <div className="absolute w-28 h-28 rounded-full border border-cyan-300 opacity-40" />
            <ShieldCheck
              className="w-16 h-16 text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]"
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Animated Text */}
          <motion.h1
            key={textIndex}
            className="text-lg font-mono text-cyan-300"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.5 }}
          >
            {phrases[textIndex]}
          </motion.h1>

          {/* Progress bar */}
          <motion.div
            className="mt-6 w-64 h-[2px] bg-cyan-900 overflow-hidden rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 3.8, ease: "easeInOut" }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Overlay scanning line */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            animate={{ background: ["rgba(0,255,255,0.05)", "transparent"] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            <motion.div
              className="absolute w-full h-[2px] bg-cyan-400/20 blur-[1px]"
              animate={{ y: ["0%", "100%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
