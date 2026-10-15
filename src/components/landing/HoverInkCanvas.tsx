"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { animate } from "animejs";

interface InkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  alpha: number;
  decay: number;
  color: string;
  glowColor: string;
  bleedAngle: number;
  bleedSpeed: number;
  turbulentOffset: number;
}

interface HoverInkCanvasProps {
  className?: string;
  triggerFlood?: boolean;
  onFloodComplete?: () => void;
  interactive?: boolean;
}

const INK_PALETTE = [
  { color: "rgba(244, 63, 94, ", glow: "rgba(244, 63, 94, 0.4)" }, // Crimson Pepper
  { color: "rgba(245, 158, 11, ", glow: "rgba(245, 158, 11, 0.35)" }, // Warm Caramel Amber
  { color: "rgba(225, 29, 72, ", glow: "rgba(225, 29, 72, 0.4)" }, // Deep Ruby
  { color: "rgba(251, 146, 60, ", glow: "rgba(251, 146, 60, 0.3)" }, // Sweet Amber
];

export function HoverInkCanvas({
  className = "",
  triggerFlood = false,
  onFloodComplete,
  interactive = true,
}: HoverInkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<InkParticle[]>([]);
  const lastMousePos = useRef<{ x: number; y: number; time: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const floodRadiusRef = useRef<{ radius: number; alpha: number }>({ radius: 0, alpha: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize & Retina DPR
  const updateSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    setDimensions({ width, height });
  }, []);

  useEffect(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  // Create an ink drop at (x, y) with velocity
  const spawnInkDrop = useCallback(
    (x: number, y: number, speed: number, dx: number, dy: number) => {
      const palette = INK_PALETTE[Math.floor(Math.random() * INK_PALETTE.length)];
      const baseRadius = Math.min(Math.max(speed * 0.9, 12), 48);
      const targetRadius = baseRadius + Math.random() * 25 + 10;

      // Primary ink drop
      particlesRef.current.push({
        x,
        y,
        vx: dx * 0.15 + (Math.random() - 0.5) * 1.5,
        vy: dy * 0.15 + (Math.random() - 0.5) * 1.5,
        radius: 3,
        targetRadius,
        alpha: 0.85,
        decay: 0.008 + Math.random() * 0.006,
        color: palette.color,
        glowColor: palette.glow,
        bleedAngle: Math.random() * Math.PI * 2,
        bleedSpeed: 0.2 + Math.random() * 0.4,
        turbulentOffset: Math.random() * 10,
      });

      // Splatter capillary micro-droplets if moving fast
      if (speed > 10) {
        const microCount = Math.min(Math.floor(speed / 8), 4);
        for (let i = 0; i < microCount; i++) {
          const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
          const dist = Math.random() * 24 + 10;
          particlesRef.current.push({
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            vx: Math.cos(angle) * (speed * 0.1),
            vy: Math.sin(angle) * (speed * 0.1),
            radius: 1,
            targetRadius: Math.random() * 8 + 3,
            alpha: 0.7,
            decay: 0.015 + Math.random() * 0.01,
            color: palette.color,
            glowColor: palette.glow,
            bleedAngle: angle,
            bleedSpeed: 0.4,
            turbulentOffset: Math.random() * 5,
          });
        }
      }

      // Limit particle array size for 60fps performance
      if (particlesRef.current.length > 220) {
        particlesRef.current.splice(0, particlesRef.current.length - 220);
      }
    },
    []
  );

  // Mouse / Pointer Move listener
  const handlePointerMove = useCallback(
    (e: PointerEvent | MouseEvent) => {
      if (!interactive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();

      if (lastMousePos.current) {
        const dx = x - lastMousePos.current.x;
        const dy = y - lastMousePos.current.y;
        const dt = Math.max(now - lastMousePos.current.time, 1);
        const dist = Math.hypot(dx, dy);
        const speed = (dist / dt) * 16;

        // Interpolate along movement vector if mouse moved rapidly
        const steps = Math.min(Math.max(Math.floor(dist / 14), 1), 6);
        for (let i = 0; i < steps; i++) {
          const t = i / steps;
          const px = lastMousePos.current.x + dx * t;
          const py = lastMousePos.current.y + dy * t;
          spawnInkDrop(px, py, speed, dx, dy);
        }
      } else {
        spawnInkDrop(x, y, 4, 0, 0);
      }

      lastMousePos.current = { x, y, time: now };
    },
    [interactive, spawnInkDrop]
  );

  // Click burst for interactive tactile punch
  const handlePointerDown = useCallback(
    (e: MouseEvent) => {
      if (!interactive) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Burst of ink droplets spreading radially
      const burstCount = 18;
      for (let i = 0; i < burstCount; i++) {
        const angle = (i / burstCount) * Math.PI * 2 + Math.random() * 0.2;
        const force = Math.random() * 8 + 4;
        const palette = INK_PALETTE[i % INK_PALETTE.length];

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * force,
          vy: Math.sin(angle) * force,
          radius: 4,
          targetRadius: Math.random() * 32 + 16,
          alpha: 0.95,
          decay: 0.007,
          color: palette.color,
          glowColor: palette.glow,
          bleedAngle: angle,
          bleedSpeed: 0.5,
          turbulentOffset: Math.random() * 10,
        });
      }
    },
    [interactive]
  );

  // Trigger Fullscreen Flood Transition (Workspace launch wave)
  useEffect(() => {
    if (triggerFlood) {
      const maxDist = Math.hypot(dimensions.width, dimensions.height) * 1.15;
      floodRadiusRef.current = { radius: 0, alpha: 0 };

      animate(floodRadiusRef.current, {
        radius: maxDist,
        alpha: 1,
        duration: 950,
        ease: "cubicBezier(0.16, 1, 0.3, 1)",
        onComplete: () => {
          if (onFloodComplete) onFloodComplete();
        },
      });
    }
  }, [triggerFlood, dimensions, onFloodComplete]);

  // Bind mouse listeners to window for fluid drag across full hero
  useEffect(() => {
    const handleMove = (e: MouseEvent) => handlePointerMove(e);
    const handleClick = (e: MouseEvent) => handlePointerDown(e);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleClick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleClick);
    };
  }, [handlePointerMove, handlePointerDown]);

  // Main 60fps Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = dimensions.width || canvas.clientWidth;
      const height = dimensions.height || canvas.clientHeight;

      // Soft trail clearing for atmospheric fluid ink persistence
      ctx.clearRect(0, 0, width, height);

      // Render each ink drop particle
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Physics: expand radius organically toward target
        p.radius += (p.targetRadius - p.radius) * 0.08;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.alpha -= p.decay;

        // Bleed diffusion capillary edges
        p.bleedAngle += 0.03;

        if (p.alpha <= 0.01) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Draw soft radial ink bloom
        const grad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          Math.max(p.radius, 1)
        );
        grad.addColorStop(0, `${p.color}${p.alpha.toFixed(3)})`);
        grad.addColorStop(0.4, `${p.color}${(p.alpha * 0.55).toFixed(3)})`);
        grad.addColorStop(0.8, `${p.color}${(p.alpha * 0.15).toFixed(3)})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // High-density ink core
        ctx.fillStyle = `${p.color}${(p.alpha * 0.9).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius * 0.22, 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Render Fullscreen Transition Ink Flood if Active
      if (floodRadiusRef.current.radius > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "source-over";

        const centerX = width / 2;
        const centerY = height / 2;
        const fRadius = floodRadiusRef.current.radius;
        const fAlpha = floodRadiusRef.current.alpha;

        const floodGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          fRadius
        );
        floodGrad.addColorStop(0, `rgba(244, 63, 94, ${fAlpha})`);
        floodGrad.addColorStop(0.4, `rgba(225, 29, 72, ${fAlpha * 0.95})`);
        floodGrad.addColorStop(0.7, `rgba(245, 158, 11, ${fAlpha * 0.9})`);
        floodGrad.addColorStop(1, `rgba(9, 9, 11, ${fAlpha})`);

        ctx.fillStyle = floodGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, fRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}
