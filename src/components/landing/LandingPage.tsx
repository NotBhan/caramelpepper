"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  ArrowRight,
  Shield,
  Cpu,
  Layers,
  Terminal,
  Code2,
  Check,
  ChevronRight,
  Sliders,
  Sparkles
} from "lucide-react";
import { useWorkspaceTransition } from "@/hooks/useWorkspaceTransition";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const { launchWorkspace, isTransitioning } = useWorkspaceTransition();
  const [activeTab, setActiveTab] = useState<"refactored" | "original">("refactored");
  const [sliderVal, setSliderVal] = useState<number>(85); // 0 to 100

  // Computed metrics based on scrubber
  const cyclomatic = Math.max(3, Math.round(28 - (sliderVal / 100) * 24));
  const cognitive = Math.max(2, Math.round(36 - (sliderVal / 100) * 33));
  const maintainability = Math.min(98, Math.round(38 + (sliderVal / 100) * 58));

  const originalSnippet = `// Original legacy code (Cyclomatic: 28 | Cognitive: 36)
int dispatchEvents(Node* root, int flags, Context& ctx) {
    if (root == nullptr) return -1;
    if (flags & 0x01) {
        for (int i = 0; i < root->count; ++i) {
            if (root->children[i] != nullptr) {
                while (root->children[i]->status == PENDING) {
                    if (ctx.timeoutExpired()) {
                        for (auto& err : ctx.errors) {
                            if (err.critical) return -99;
                        }
                    }
                    // nested branching accumulator...
                }
            }
        }
    }
    return 0;
}`;

  const refactoredSnippet = `// Optimized with CaramelPepper (Cyclomatic: 4 | Cognitive: 3)
int dispatchEvents(Node* root, int flags, Context& ctx) {
    if (!root || !(flags & FLAG_ACTIVE)) return 0;

    auto pendingNodes = root->activeChildren() 
                      | std::views::filter(&Node::isPending);

    return ctx.evaluateWithTimeout(pendingNodes);
}`;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={
        isTransitioning
          ? { opacity: 0, scale: 0.99, transition: { duration: 0.35 } }
          : { opacity: 1, scale: 1 }
      }
      className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-zinc-800 selection:text-white"
    >
      {/* Subtle Grid Lines */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 1. MINIMAL HEADER */}
      <header className="relative z-30 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between border-b border-[#222226]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#E11D48]">
            <Flame className="w-4 h-4 fill-[#E11D48]" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#FAFAFA]">
            CaramelPepper
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-zinc-500 bg-[#121215] px-2 py-0.5 rounded border border-[#222226]">
            v1.0 Local
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => document.getElementById("architecture-section")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden sm:block text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1"
          >
            Architecture
          </button>
          <Button
            onClick={launchWorkspace}
            className="h-8 px-3.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] text-xs font-medium rounded-md transition-all gap-1.5"
          >
            Launch Studio
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative z-20 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        {/* Subtle Announcement Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141416] border border-[#222226] text-xs font-mono text-zinc-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Zero-Egress C++20 Refactoring Studio</span>
        </div>

        {/* High-Impact Minimal Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#FAFAFA] leading-[1.08] mb-6 font-headline">
          Refactor at native speed.
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400 leading-relaxed font-sans font-normal mb-10">
          Analyze cyclomatic complexity with Tree-Sitter AST inspection. Clean up legacy technical debt and hot-swap quantized local models with zero code leaving your workstation.
        </p>

        {/* Minimal Action Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={launchWorkspace}
            className="h-11 px-6 text-xs font-semibold bg-[#FAFAFA] text-[#09090B] hover:bg-zinc-200 rounded-lg transition-all gap-2"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => document.getElementById("interactive-preview")?.scrollIntoView({ behavior: "smooth" })}
            className="h-11 px-5 text-xs font-semibold border-[#27272A] bg-[#141416] hover:bg-[#18181B] text-zinc-300 rounded-lg"
          >
            Interactive Demo
          </Button>
        </div>

        {/* Feature Specs Ticker */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            100% Offline Runtime
          </span>
          <span className="text-zinc-700">&bull;</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            Tree-Sitter AST Parsing
          </span>
          <span className="text-zinc-700">&bull;</span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            C++20 &amp; Python Support
          </span>
        </div>
      </section>

      {/* 3. INTERACTIVE PRODUCT PREVIEW (The Playground) */}
      <section id="interactive-preview" className="relative z-20 max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-xl border border-[#27272A] bg-[#121215] overflow-hidden shadow-2xl">
          
          {/* Mockup Window Header */}
          <div className="h-10 px-4 bg-[#18181B] border-b border-[#222226] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
              <span className="ml-3 text-xs font-mono text-zinc-400">
                caramel-pepper &mdash; refactor_demo.cpp
              </span>
            </div>

            {/* Toggle view tabs */}
            <div className="flex items-center p-0.5 rounded bg-[#09090B] border border-[#222226] text-xs font-mono">
              <button
                onClick={() => setActiveTab("refactored")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === "refactored"
                    ? "bg-[#18181B] text-[#FAFAFA] font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Refactored (AST: 4)
              </button>
              <button
                onClick={() => setActiveTab("original")}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === "original"
                    ? "bg-[#18181B] text-[#FAFAFA] font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Original (Debt: 28)
              </button>
            </div>
          </div>

          {/* Code Viewer Stage */}
          <div className="p-5 font-mono text-xs overflow-x-auto bg-[#09090B] text-zinc-300 leading-relaxed min-h-[260px]">
            <pre>
              <code>{activeTab === "refactored" ? refactoredSnippet : originalSnippet}</code>
            </pre>
          </div>

          {/* Interactive Metric Scrubber Footer */}
          <div className="p-4 bg-[#141416] border-t border-[#222226] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-zinc-500 shrink-0">Simulate AST Scrubber:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full md:w-48 h-1.5 bg-[#27272A] rounded-lg appearance-none cursor-pointer accent-[#FAFAFA]"
              />
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
              <span>Cyclomatic: <strong className="text-white">{cyclomatic}</strong></span>
              <span className="text-zinc-700">|</span>
              <span>Cognitive: <strong className="text-white">{cognitive}</strong></span>
              <span className="text-zinc-700">|</span>
              <span>Maintainability: <strong className="text-white">{maintainability}%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE CLEAN ARCHITECTURE PILLARS */}
      <section id="architecture-section" className="relative z-20 max-w-5xl mx-auto px-6 py-20 border-t border-[#222226]">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA] font-headline mb-3">
            Minimal. Local. Deterministic.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Designed for engineering teams who require strict source-code privacy and compiler-level refactoring accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222226] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-200">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white font-headline">Zero-Egress llama.cpp</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Runs quantized GGUF models directly in C++ on your local CPU/GPU. No source code ever transmits over the network.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222226] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-200">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white font-headline">Tree-Sitter AST Analysis</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Compiler-accurate syntax trees calculate cyclomatic nesting and cognitive complexity while strictly preserving code semantics.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-xl bg-[#121215] border border-[#222226] space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-zinc-200">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white font-headline">Style Memory Vault</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Local SQLite-VSS vector store matches naming patterns, brace styles, and formatting conventions to your existing codebase.
            </p>
          </div>
        </div>
      </section>

      {/* 5. MINIMAL CTA BANNER */}
      <section className="relative z-20 max-w-3xl mx-auto px-6 py-16 text-center border-t border-[#222226]">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-headline mb-3">
          Ready to eliminate technical debt?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-6">
          Launch the multi-tab workspace with Monaco editing, side-by-side diffing, and local AI refactoring.
        </p>
        <Button
          size="lg"
          onClick={launchWorkspace}
          className="h-11 px-7 text-xs font-semibold bg-[#FAFAFA] text-[#09090B] hover:bg-zinc-200 rounded-lg transition-all gap-2"
        >
          <span>Launch Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </section>

      {/* 6. MINIMAL FOOTER */}
      <footer className="relative z-20 border-t border-[#222226] py-6 px-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>CaramelPepper</span>
            <span className="text-zinc-600">&bull;</span>
            <span className="text-zinc-500">C++20 Developer Tool</span>
          </div>
          <div>Zero Egress &bull; MIT License</div>
        </div>
      </footer>
    </motion.div>
  );
}
