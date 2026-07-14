"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  id: number;
  type: "RECT" | "PIXEL" | "LINE";
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  life: number;
  decay: number;
  w?: number;
  h?: number;
  length?: number;
  size?: number;
  shapeIndex?: number;
}

const SHAPES = [
  [[0, 0]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 1], [2, 2]]
];

const COLORS = {
  cyan: "rgba(0, 255, 249, ",
  magenta: "rgba(255, 0, 193, ",
  green: "rgba(0, 255, 102, ",
  white: "rgba(244, 244, 245, ",
};

export default function GlitchCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, lastActive: 0 });
  const cursorRef = useRef({ x: 0, y: 0 });
  const reticleSizeRef = useRef({ current: 8, target: 8 });
  const hoverRef = useRef(false);
  const visibleRef = useRef(false);
  const reticleOpacityRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mediaQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Particle[] = [];
    let particleIdCounter = 0;
    let isLoopRunning = false;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    mouseRef.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      prevX: window.innerWidth / 2,
      prevY: window.innerHeight / 2,
      lastActive: Date.now()
    };
    cursorRef.current = { x: mouseRef.current.x, y: mouseRef.current.y };

    const spawnParticle = (
      type: "RECT" | "PIXEL" | "LINE",
      x: number,
      y: number,
      speedMultiplier = 1,
      forceSmallSize = false
    ) => {
      const colorKeys = Object.keys(COLORS) as Array<keyof typeof COLORS>;
      const selectedColor = COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
      const decay = 0.04 + Math.random() * 0.04;

      const baseParticle = {
        id: particleIdCounter++,
        type,
        x,
        y,
        color: selectedColor,
        alpha: 0.3 + Math.random() * 0.3,
        life: 1.0,
        decay,
      };

      if (type === "RECT") {
        particles.push({
          ...baseParticle,
          speedX: (Math.random() - 0.5) * 2 * speedMultiplier,
          speedY: (Math.random() - 0.5) * 2 * speedMultiplier,
          w: forceSmallSize ? (3 + Math.random() * 4) : (6 + Math.random() * 12),
          h: forceSmallSize ? 2 : (4 + Math.floor(Math.random() * 3)),
        });
      } else if (type === "PIXEL") {
        const shapeIndex = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[shapeIndex];

        let size = 1;
        if (shape.length <= 2) {
          size = forceSmallSize ? (Math.random() < 0.5 ? 3 : 2) : (4 + Math.floor(Math.random() * 3));
        } else {
          size = forceSmallSize ? 2 : (3 + Math.floor(Math.random() * 2));
        }

        particles.push({
          ...baseParticle,
          speedX: (Math.random() - 0.5) * 1.2 * speedMultiplier,
          speedY: (-0.3 - Math.random() * 1.2) * speedMultiplier,
          size,
          shapeIndex
        });
      } else if (type === "LINE") {
        particles.push({
          ...baseParticle,
          speedX: (Math.random() - 0.5) * 0.5 * speedMultiplier,
          speedY: (Math.random() - 0.5) * 0.5 * speedMultiplier,
          length: forceSmallSize ? (6 + Math.random() * 6) : (12 + Math.random() * 16),
        });
      }
    };

    const drawReticle = (
      x: number,
      y: number,
      size: number,
      colorStr: string,
      offsetX = 0,
      offsetY = 0,
      alpha = 1.0
    ) => {
      ctx.save();
      ctx.strokeStyle = colorStr + alpha + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const rx = x + offsetX;
      const ry = y + offsetY;
      const len = size * 0.4;
      
      ctx.moveTo(rx - size, ry - size + len);
      ctx.lineTo(rx - size, ry - size);
      ctx.lineTo(rx - size + len, ry - size);

      ctx.moveTo(rx + size - len, ry - size);
      ctx.lineTo(rx + size, ry - size);
      ctx.lineTo(rx + size, ry + size - len);

      ctx.moveTo(rx - size, ry + size - len);
      ctx.lineTo(rx - size, ry + size);
      ctx.lineTo(rx - size + len, ry + size);

      ctx.moveTo(rx + size - len, ry + size);
      ctx.lineTo(rx + size, ry + size);
      ctx.lineTo(rx + size, ry + size - len);

      ctx.stroke();

      ctx.fillStyle = colorStr + alpha + ")";
      ctx.fillRect(rx - 1, ry - 1, 2, 2);

      if (hoverRef.current) {
        ctx.strokeStyle = colorStr + (alpha * 0.4) + ")";
        ctx.beginPath();
        ctx.arc(rx, ry, size * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const m = mouseRef.current;
      const c = cursorRef.current;
      const r = reticleSizeRef.current;

      r.current += (r.target - r.current) * 0.2;

      const lerpVal = hoverRef.current ? 0.22 : 0.15;
      c.x += (m.x - c.x) * lerpVal;
      c.y += (m.y - c.y) * lerpVal;

      const targetOpacity = visibleRef.current ? 1.0 : 0.0;
      reticleOpacityRef.current += (targetOpacity - reticleOpacityRef.current) * 0.15;

      const isJittering = Math.random() < 0.04;
      const jX = isJittering ? (Math.random() - 0.5) * 3 : 0;
      const jY = isJittering ? (Math.random() - 0.5) * 3 : 0;

      if (reticleOpacityRef.current > 0.01) {
        drawReticle(c.x, c.y, r.current, COLORS.cyan, -2 + jX, jY, 0.7 * reticleOpacityRef.current);
        drawReticle(c.x, c.y, r.current, COLORS.magenta, 2 + jX, jY, 0.7 * reticleOpacityRef.current);
        drawReticle(c.x, c.y, r.current, COLORS.white, jX, jY, 0.95 * reticleOpacityRef.current);
      }

      if (Math.random() < 0.002) {
        ctx.save();
        ctx.strokeStyle = Math.random() < 0.5 ? "rgba(0, 255, 249, 0.18)" : "rgba(255, 0, 193, 0.18)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, c.y + (Math.random() - 0.5) * 20);
        ctx.lineTo(window.innerWidth, c.y + (Math.random() - 0.5) * 20);
        ctx.stroke();
        ctx.restore();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        ctx.save();

        if (p.type === "RECT") {
          const jitterWidth = (p.w || 8) * (0.8 + Math.random() * 0.4);
          const jitterOffset = Math.random() < 0.2 ? (Math.random() - 0.5) * 6 : 0;
          ctx.fillStyle = p.color + (p.alpha * p.life) + ")";
          ctx.fillRect(p.x + jitterOffset, p.y, jitterWidth, p.h || 3);
        } 
        else if (p.type === "PIXEL") {
          ctx.fillStyle = p.color + (p.alpha * p.life) + ")";
          const shape = SHAPES[p.shapeIndex !== undefined ? p.shapeIndex : 0];
          const subSize = p.size || 1;
          const px = Math.floor(p.x);
          const py = Math.floor(p.y);
          
          for (let s = 0; s < shape.length; s++) {
            const cell = shape[s];
            ctx.fillRect(px + cell[0] * subSize, py + cell[1] * subSize, subSize, subSize);
          }
        } 
        else if (p.type === "LINE") {
          ctx.strokeStyle = p.color + (p.alpha * p.life) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const l = p.length || 20;
          ctx.moveTo(p.x - l / 2, p.y);
          ctx.lineTo(p.x + l / 2, p.y);
          ctx.stroke();
        }

        ctx.restore();
      }

      const isIdle = Date.now() - m.lastActive > 2000;
      const hasCaughtUp = Math.abs(c.x - m.x) < 0.1 && Math.abs(c.y - m.y) < 0.1;
      const sizeReached = Math.abs(r.current - r.target) < 0.1;
      const opacityReached = Math.abs(reticleOpacityRef.current - targetOpacity) < 0.01;

      const canStop = particles.length === 0 && hasCaughtUp && sizeReached && opacityReached && (!visibleRef.current || isIdle);

      if (canStop) {
        if (!visibleRef.current) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        isLoopRunning = false;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.prevX = m.x;
      m.prevY = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
      m.lastActive = Date.now();
      visibleRef.current = true;

      const dx = m.x - m.prevX;
      const dy = m.y - m.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 0.5) {
        const isSpeedSmall = speed < 4.0;
        const numParticles = isSpeedSmall ? 2 : 1; 
        const spreadRadius = isSpeedSmall ? 18 : 8; 

        for (let i = 0; i < numParticles; i++) {
          const offsetX = (Math.random() - 0.5) * spreadRadius;
          const offsetY = (Math.random() - 0.5) * spreadRadius;
          
          const rand = Math.random();
          let type: "RECT" | "PIXEL" | "LINE" = "PIXEL";
          if (rand < 0.3) {
            type = "RECT";
          } else if (rand < 0.8) {
            type = "PIXEL";
          } else {
            type = "LINE";
          }
          
          spawnParticle(type, m.x + offsetX, m.y + offsetY, 1, !isSpeedSmall);
        }
      }

      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.lastActive = Date.now();
      visibleRef.current = true;

      const count = 4 + Math.floor(Math.random() * 3); 
      for (let i = 0; i < count; i++) {
        const offsetR = Math.random() * 24;
        const angle = Math.random() * Math.PI * 2;
        const px = e.clientX + Math.cos(angle) * offsetR;
        const py = e.clientY + Math.sin(angle) * offsetR;
        
        spawnParticle("RECT", px, py, 1.8, true);
        if (Math.random() < 0.5) {
          spawnParticle("PIXEL", px, py, 1.5, false);
        } else {
          spawnParticle("LINE", px, py, 1.5, true);
        }
      }

      const pixelCount = 12 + Math.floor(Math.random() * 6);
      for (let j = 0; j < pixelCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 2.0;
        const colorKeys = Object.keys(COLORS) as Array<keyof typeof COLORS>;
        const selectedColor = COLORS[colorKeys[Math.floor(Math.random() * colorKeys.length)]];
        
        const shapeIndex = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[shapeIndex];
        const size = shape.length <= 2 
          ? (4 + Math.floor(Math.random() * 3)) 
          : (3 + Math.floor(Math.random() * 2));

        particles.push({
          id: particleIdCounter++,
          type: "PIXEL",
          x: e.clientX,
          y: e.clientY,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed - 0.2,
          color: selectedColor,
          alpha: 0.5 + Math.random() * 0.3,
          life: 1.0,
          decay: 0.03 + Math.random() * 0.03,
          size,
          shapeIndex
        });
      }

      reticleSizeRef.current.current = 24;

      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest("a, button, [role='button'], input, textarea, select");
      
      if (isInteractive) {
        hoverRef.current = true;
        reticleSizeRef.current.target = 13;
      } else {
        hoverRef.current = false;
        reticleSizeRef.current.target = 8;
      }

      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    const handleMouseLeave = () => {
      visibleRef.current = false;
      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    const handleMouseEnter = () => {
      visibleRef.current = true;
      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    const handleWindowBlur = () => {
      visibleRef.current = false;
      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    const handleWindowFocus = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        render();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    isLoopRunning = true;
    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 mix-blend-screen"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}
