"use client"

import React from "react"
import { Zap, ShieldAlert, Fingerprint, Database, CheckCircle2, Layers } from "lucide-react"
import { type ComplexityMetrics } from "@/lib/complexity"
import { type CodeStyleOutput } from "@/ai/flows/code-style-alignment"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"

interface AnalysisPanelProps {
  metrics: ComplexityMetrics | null;
  style: CodeStyleOutput | null;
  isAnalyzing: boolean;
  activeFilePath?: string | null;
}

export function AnalysisPanel({ metrics, style, isAnalyzing, activeFilePath }: AnalysisPanelProps) {
  const { styleRules, ragSnippets } = useWorkspaceStore();

  // If no file is open or no metrics available, display clean empty state with NO metrics
  if (!activeFilePath || !metrics) {
    return (
      <div className="h-full flex flex-col bg-[#09090B] border-l border-[#222226] text-[#FAFAFA] font-sans">
        <div className="p-4 border-b border-[#222226] flex items-center justify-between shrink-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            AST & Analysis
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-800 bg-[#121215] text-zinc-500 uppercase">
            No File Active
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-12 h-12 rounded-xl bg-[#121215] border border-[#222226] flex items-center justify-center mb-3 text-zinc-600">
            <Layers className="w-5 h-5 text-zinc-600" />
          </div>
          <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-300 mb-1.5 font-medium">
            No Metrics Available
          </h3>
          <p className="text-[11px] text-zinc-500 max-w-[210px] leading-relaxed">
            Open a file from the explorer or create a new scratchpad to inspect real-time AST complexity metrics.
          </p>
        </div>
      </div>
    );
  }

  const cyclomatic = metrics.cyclomatic;
  const cognitive = metrics.cognitive;
  const maintainability = metrics.maintainability;
  const risk = metrics.risk;
  const fileName = activeFilePath.split(/[/\\]/).pop() || activeFilePath;

  return (
    <div className="h-full flex flex-col overflow-y-auto scroll-thin bg-[#09090B] border-l border-[#222226] text-[#FAFAFA] font-sans">
      <div className="p-4 space-y-5">
        
        {/* Section 1: AST Complexity Metrics */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                AST Complexity
              </span>
              <span className="font-mono text-[10px] text-zinc-500 truncate" title={activeFilePath}>
                {fileName} {metrics.loc !== undefined ? `(${metrics.loc} LOC)` : ''}
              </span>
            </div>
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0",
              risk === 'critical' ? "bg-red-950/30 text-red-400 border-red-800/40" :
              risk === 'high' ? "bg-red-950/20 text-red-300 border-red-800/30" :
              risk === 'moderate' ? "bg-amber-950/20 text-amber-300 border-amber-800/30" :
              "bg-zinc-900 text-zinc-300 border-zinc-700/50"
            )}>
              {risk} Risk
            </span>
          </div>

          {/* Minimal Metric Score Tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#121215] border border-[#222226] rounded-lg p-3.5 flex flex-col text-left">
              <span className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Cyclomatic</span>
              <span className="font-mono text-2xl font-semibold text-[#FAFAFA] tracking-tight">
                {isAnalyzing ? "..." : cyclomatic}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1">Branch score</span>
            </div>

            <div className="bg-[#121215] border border-[#222226] rounded-lg p-3.5 flex flex-col text-left">
              <span className="text-[10px] font-mono uppercase text-zinc-500 mb-1">Cognitive</span>
              <span className="font-mono text-2xl font-semibold text-[#FAFAFA] tracking-tight">
                {isAnalyzing ? "..." : cognitive}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1">Nesting load</span>
            </div>
          </div>

          {/* Minimal Progress Bar */}
          <div className="p-3 bg-[#121215] rounded-lg border border-[#222226] space-y-2.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-400">Maintainability</span>
              <span className="text-zinc-200 font-semibold">{maintainability}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#222226] rounded-full overflow-hidden">
              <div 
                className="h-full bg-zinc-200 transition-all duration-500 rounded-full" 
                style={{ width: `${maintainability}%` }}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Style Detective Rules */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Style Rules
            </h3>
          </div>
          
          <div className="bg-[#121215] border border-[#222226] rounded-lg overflow-hidden divide-y divide-[#222226]">
            {[
              { label: 'Naming', value: style?.namingConvention || 'snake_case' },
              { label: 'Indentation', value: style?.indentation || '4 spaces' },
              { label: 'Braces', value: style?.braceStyle || 'OTBS (1TBS)' },
              { label: 'Quotes', value: style?.quoteStyle || 'double quotes' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 text-xs font-mono">
                <span className="text-zinc-500 text-[11px]">{item.label}</span>
                <span className="text-[11px] text-zinc-200">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: RAG Memory Vault */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                Code Memory
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Local VSS
            </span>
          </div>

          <div className="space-y-2">
            {ragSnippets.map((snippet) => (
              <div 
                key={snippet.id}
                className="bg-[#121215] border border-[#222226] rounded-lg p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400 truncate max-w-[140px]">{snippet.fileSource.split('/').pop()}</span>
                  <span className="text-zinc-400">
                    {Math.round(snippet.similarity * 100)}% match
                  </span>
                </div>
                <div className="bg-[#09090B] rounded p-2 border border-[#222226] font-mono text-[11px] text-zinc-400 overflow-x-auto">
                  <code>{snippet.snippet}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Muted Warning if critical */}
        {risk === 'critical' && (
          <div className="p-3 rounded-lg bg-[#141416] border border-red-900/40 flex gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-300">Technical Debt Alert</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Nesting depth exceeds threshold. Recommend splitting into smaller member functions.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}