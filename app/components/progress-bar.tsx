"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
      style={{ scaleX: progress / 100 }}
      initial={{ scaleX: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
    />
  );
};