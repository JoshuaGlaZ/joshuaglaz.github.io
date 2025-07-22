"use client";
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  blurDataURL?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = "", 
  priority = false,
  blurDataURL
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`
          transition-all duration-700 ease-out
          ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
        `}
      />
      {!isLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2 }}
          className="absolute inset-0 bg-zinc-800/20 animate-pulse"
        />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-400">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};