"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

interface ComplexityGaugeProps {
  score?: number | null; // 0 to 100
  cyclomatic?: number | null;
  cognitive?: number | null;
  maintainability?: number | null;
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showDetails?: boolean;
}

export function ComplexityGauge({
  score = null,
  cyclomatic = null,
  cognitive = null,
  maintainability = null,
  title = "AST Health",
  size = "md",
  className = "",
  showDetails = true,
}: ComplexityGaugeProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const prevScoreRef = useRef<number>(score ?? 0);

  // Dimension scaling
  const dimensions = {
    sm: { radius: 18, stroke: 3, box: 44, fontSize: "text-xs" },
    md: { radius: 42, stroke: 4, box: 100, fontSize: "text-2xl" },
    lg: { radius: 52, stroke: 5, box: 124, fontSize: "text-3xl" },
  }[size];

  const circumference = 2 * Math.PI * dimensions.radius;

  // Minimal, calm color palette - restrained, not neon
  const getStrokeColor = (s: number | null) => {
    if (s === null) return "#3F3F46";
    if (s >= 75) return "#FAFAFA"; // Crisp clean neutral
    if (s >= 45) return "#F59E0B"; // Warm amber
    return "#E11D48"; // Muted pepper
  };

  useEffect(() => {
    if (score === null) {
      if (circleRef.current) {
        animate(circleRef.current, {
          strokeDashoffset: circumference,
          stroke: "#27272A",
          duration: 400,
          ease: "easeOutQuad",
        });
      }
      if (numberRef.current) {
        numberRef.current.textContent = "--";
      }
      prevScoreRef.current = 0;
      return;
    }

    const targetOffset = circumference - (score / 100) * circumference;
    const targetColor = getStrokeColor(score);

    if (circleRef.current) {
      animate(circleRef.current, {
        strokeDashoffset: targetOffset,
        stroke: targetColor,
        duration: 600,
        ease: "cubicBezier(0.16, 1, 0.3, 1)",
      });
    }

    if (numberRef.current) {
      const obj = { val: prevScoreRef.current };
      animate(obj, {
        val: score,
        duration: 500,
        ease: "easeOutQuad",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = `${Math.round(obj.val)}`;
          }
        },
      });
      prevScoreRef.current = score;
    }
  }, [score, circumference]);

  const strokeColor = getStrokeColor(score);

  if (size === "sm") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="relative flex items-center justify-center shrink-0" style={{ width: dimensions.box, height: dimensions.box }}>
          <svg className="w-full h-full -rotate-90">
            <circle
              cx={dimensions.box / 2}
              cy={dimensions.box / 2}
              r={dimensions.radius}
              stroke="#27272A"
              strokeWidth={dimensions.stroke}
              fill="none"
            />
            <circle
              ref={circleRef}
              cx={dimensions.box / 2}
              cy={dimensions.box / 2}
              r={dimensions.radius}
              stroke={strokeColor}
              strokeWidth={dimensions.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={score !== null ? circumference - (score / 100) * circumference : circumference}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span ref={numberRef} className="absolute text-[10px] font-mono font-medium text-[#FAFAFA]">
            {score !== null ? score : "--"}
          </span>
        </div>
        {showDetails && (
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500">Complexity</span>
            <span className="text-xs font-mono font-medium text-zinc-300">
              {cyclomatic !== null ? `${cyclomatic} score` : "--"}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-[#121215] border border-[#27272A] font-sans ${className}`}>
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-3 text-xs font-mono">
        <span className="text-zinc-400 uppercase tracking-wider text-[10px]">{title}</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181B] text-zinc-300 border border-[#27272A]">
          {score === null ? "No Data" : score >= 75 ? "Optimal" : score >= 45 ? "Moderate" : "High Debt"}
        </span>
      </div>

      {/* Ring Meter */}
      <div className="flex items-center justify-center py-2 relative">
        <div className="relative flex items-center justify-center" style={{ width: dimensions.box, height: dimensions.box }}>
          <svg className="w-full h-full -rotate-90">
            <circle
              cx={dimensions.box / 2}
              cy={dimensions.box / 2}
              r={dimensions.radius}
              stroke="#222226"
              strokeWidth={dimensions.stroke}
              fill="none"
            />
            <circle
              ref={circleRef}
              cx={dimensions.box / 2}
              cy={dimensions.box / 2}
              r={dimensions.radius}
              stroke={strokeColor}
              strokeWidth={dimensions.stroke}
              strokeDasharray={circumference}
              strokeDashoffset={score !== null ? circumference - (score / 100) * circumference : circumference}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Center Readout */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span ref={numberRef} className={`${dimensions.fontSize} font-mono font-bold text-[#FAFAFA] tracking-tight`}>
              {score !== null ? score : "--"}
            </span>
            <span className="text-[9px] font-mono uppercase text-zinc-500">AST Score</span>
          </div>
        </div>
      </div>

      {/* Minimal Details */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-[#222226] text-center">
          <div className="p-2 rounded-lg bg-[#09090B] border border-[#222226]">
            <p className="text-[9px] font-mono text-zinc-500 uppercase">Cyclo</p>
            <p className="text-xs font-mono font-semibold text-zinc-200 mt-0.5">
              {cyclomatic !== null ? cyclomatic : "--"}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#09090B] border border-[#222226]">
            <p className="text-[9px] font-mono text-zinc-500 uppercase">Cognitive</p>
            <p className="text-xs font-mono font-semibold text-zinc-200 mt-0.5">
              {cognitive !== null ? cognitive : "--"}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-[#09090B] border border-[#222226]">
            <p className="text-[9px] font-mono text-zinc-500 uppercase">Maint.</p>
            <p className="text-xs font-mono font-semibold text-zinc-200 mt-0.5">
              {maintainability !== null ? `${maintainability}%` : "--"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
