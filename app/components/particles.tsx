"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useMousePosition } from "@/util/mouse";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  color?: string;
  size?: [number, number];
  speed?: number;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
  initialX: number;
  initialY: number;
}

export default function Particles({
  className = "",
  quantity = 30,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = "255, 255, 255",
  size = [0.1, 2],
  speed = 0.2,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const animationId = useRef<number>();
  const mousePosition = useMousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const dpr = useMemo(() =>
    typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1
    , []);

  // OffscreenCanvas for better performance when available
  const offscreenCanvas = useMemo(() => {
    if (typeof window !== 'undefined' && 'OffscreenCanvas' in window) {
      return new (window as any).OffscreenCanvas(800, 600);
    }
    return null;
  }, []);

  // Particle pooling to avoid garbage collection
  const particlePool = useMemo(() => {
    return Array.from({ length: quantity * 2 }, () => ({
      x: 0, y: 0, dx: 0, dy: 0,
      size: 0, alpha: 0, active: false
    }));
  }, [quantity]);

  const resizeTimeoutRef = useRef<NodeJS.Timeout>();
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      initCanvas();
    }, 100);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (!entry.isIntersecting && animationId.current) {
          cancelAnimationFrame(animationId.current);
        } else if (entry.isIntersecting) {
          animate();
        }
      },
      { threshold: 0.1 }
    );

    if (canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });
    }
    initCanvas();

    if (isVisible) {
      animate();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [isVisible, handleResize]);

  useEffect(() => {
    onMouseMove();
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    if (isVisible) {
      initCanvas();
    }
  }, [refresh, isVisible]);

  const initCanvas = useCallback(() => {
    resizeCanvas();
    drawParticles();
  }, []);

  const onMouseMove = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  }, [mousePosition.x, mousePosition.y]);

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  }, [dpr]);

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const particleSize = Math.random() * (size[1] - size[0]) + size[0];
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * speed;
    const dy = (Math.random() - 0.5) * speed;
    const magnetism = 0.1 + Math.random() * 4;

    return {
      x,
      y,
      initialX: x,
      initialY: y,
      translateX: 0,
      translateY: 0,
      size: particleSize,
      alpha: 0,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }, [size, speed]);

  const drawCircle = useCallback((circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size: circleSize, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, circleSize, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${color}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  }, [color, dpr]);

  const clearContext = useCallback(() => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
    }
  }, []);

  const drawParticles = useCallback(() => {
    clearContext();
    const particleCount = Math.min(quantity, 500);
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }, [quantity, circleParams, drawCircle, clearContext]);

  const remapValue = useCallback((
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }, []);

  const animate = useCallback(() => {
    if (!isVisible) return;

    clearContext();

    for (let i = circles.current.length - 1; i >= 0; i--) {
      const circle = circles.current[i];

      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ];

      const closestEdge = Math.min(...edge);
      const remapClosestEdge = parseFloat(remapValue(closestEdge, 0, 20, 0, 1).toFixed(2));

      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }

      circle.x += circle.dx;
      circle.y += circle.dy;

      const mouseInfluence = staticity / circle.magnetism;
      circle.translateX += (mouse.current.x / mouseInfluence - circle.translateX) / ease;
      circle.translateY += (mouse.current.y / mouseInfluence - circle.translateY) / ease;

      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        const newCircle = circleParams();
        circles.current[i] = newCircle;
        drawCircle(newCircle);
      } else {
        drawCircle(circle, true);
      }
    }

    animationId.current = requestAnimationFrame(animate);
  }, [isVisible, clearContext, remapValue, staticity, ease, circleParams, drawCircle]);

  return (
    <div className={className} ref={canvasContainerRef} aria-hidden="true">
      <canvas
        ref={canvasRef}
        style={{
          willChange: isVisible ? 'transform' : 'auto',
          contain: 'layout style paint'
        }}
      />
    </div>
  );
}