"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "animejs";
import { ShieldCheck, Flame, AlertCircle, ArrowDownRight, Zap } from "lucide-react";

interface KineticGaugeProps {
  score?: number; // 0 (worst) to 100 (cleanest)
  cyclomatic?: number; // e.g., 28 -> 4
  cognitive?: number; // e.g., 34 -> 3
  maintainability?: number; // 0 to 100
  title?: string;
  isInteractive?: boolean;
  className?: string;
}

export function KineticGauge({
  score = 88,
  cyclomatic = 4,
  cognitive = 3,
  maintainability = 94,
  title = "AST Complexity Rating",
  className = "",
}: KineticGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const glowCircleRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const prevScoreRef = useRef<number>(score);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Determine dynamic accent color
  const getColor = (s: number) => {
    if (s >= 75) return "#10B981"; // Emerald clean
    if (s >= 45) return "#F59E0B"; // Caramel Amber
    return "#F43F5E"; // Sharp Crimson
  };

  useEffect(() => {
    const targetOffset = circumference - (score / 100) * circumference;
    const targetColor = getColor(score);

    // 1. Morph the SVG ring stroke with spring-like cubic ease
    if (circleRef.current) {
      animate(circleRef.current, {
        strokeDashoffset: targetOffset,
        stroke: targetColor,
        duration: 1200,
      });
    }

    // 2. Pulse radial ambient glow
    if (glowCircleRef.current) {
      animate(glowCircleRef.current, {
        stroke: targetColor,
        opacity: [0.15, 0.45, 0.2],
        duration: 900,
      });
    }

    // 3. Animate the numeric score counter
    const counterObj = { val: prevScoreRef.current };
    animate(counterObj, {
      val: score,
      duration: 1000,
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.textContent = String(Math.round(counterObj.val));
        }
      },
    });

    prevScoreRef.current = score;
  }, [score, circumference]);

  const currentColor = getColor(score);
  const isHealthy = score >= 75;

  return (
    <div
      className={`relative p-6 rounded-2xl bg-[#0e0e11]/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Background Accent Gradients */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: `${currentColor}15` }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-colors duration-500"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[11px] font-mono text-zinc-300">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Tree-sitter AST</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Dial */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
            {/* Outer track */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="#27272a"
              strokeWidth="9"
              opacity="0.6"
            />
            {/* Ambient Glow */}
            <circle
              ref={glowCircleRef}
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke={currentColor}
              strokeWidth="15"
              opacity="0.25"
              strokeLinecap="round"
            />
            {/* Dynamic Kinetic Morphing Ring */}
            <circle
              ref={circleRef}
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke={currentColor}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
            <span
              ref={numberRef}
              className="text-4xl font-extrabold font-mono tracking-tighter text-white leading-none"
            >
              {score}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mt-1 font-semibold">
              Health / 100
            </span>
          </div>
        </div>

        {/* Metric Insights */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs text-zinc-400">Cyclomatic Branches</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold">
              <span className={isHealthy ? "text-emerald-400" : "text-rose-400"}>
                {cyclomatic}
              </span>
              <span className="text-zinc-500 text-xs">paths</span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs text-zinc-400">Cognitive Weight</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold">
              <span className={isHealthy ? "text-emerald-400" : "text-amber-400"}>
                {cognitive}
              </span>
              <span className="text-zinc-500 text-xs">pts</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Maintainability Index</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-white">
              <span>{maintainability}</span>
              <span className="text-xs text-emerald-400 flex items-center">
                <ArrowDownRight className="w-3.5 h-3.5 rotate-180" /> +62%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
