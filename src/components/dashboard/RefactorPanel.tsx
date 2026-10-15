"use client"

import React from "react"
import { Wand2, Check, MessageSquareCode, Terminal, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type LocalCodeRefactoringOutput } from "@/ai/flows/local-code-refactoring"
import { useAppStore } from "@/store/use-app-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RefactorPanelProps {
  suggestions: LocalCodeRefactoringOutput | null;
  isRefactoring: boolean;
  onApply: (code: string) => void;
}

export function RefactorPanel({ suggestions, isRefactoring, onApply }: RefactorPanelProps) {
  const store = useAppStore();

  if (isRefactoring) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-2 bg-[#09090B] text-zinc-400">
        <Wand2 className="w-5 h-5 animate-spin text-zinc-300" />
        <p className="text-xs font-mono">Refactoring engine running...</p>
      </div>
    )
  }

  if (!suggestions) {
    return (
      <div className="h-full flex flex-col bg-[#09090B] border-t border-[#222226]">
        <div className="px-3 py-1.5 border-b border-[#222226] flex items-center justify-between bg-[#121215]">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <h3 className="text-xs font-mono font-medium text-zinc-300">pepper-shell console</h3>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={store.toggleBottomPanel}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#18181B]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#141416] border-[#222226] text-[10px] text-zinc-300">
                Minimize Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs font-mono text-zinc-500">Run an optimization scan to review AST refactoring tasks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#09090B] border-t border-[#222226]">
      <div className="px-3 py-1.5 border-b border-[#222226] flex items-center justify-between bg-[#121215]">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="w-3.5 h-3.5 text-zinc-400" />
          <h3 className="text-xs font-mono font-medium text-zinc-200">Refactoring Analysis</h3>
        </div>
        <div className="flex gap-2 items-center">
          {suggestions.refactoredCode && (
            <Button 
              size="sm" 
              onClick={() => onApply(suggestions.refactoredCode)}
              className="h-6 px-2.5 text-xs bg-[#FAFAFA] text-[#09090B] font-medium hover:bg-zinc-200 rounded"
            >
              <Check className="w-3 h-3 mr-1" /> Accept All
            </Button>
          )}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={store.toggleBottomPanel}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#18181B]"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#141416] border-[#222226] text-[10px] text-zinc-300">
                Minimize Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden bg-[#09090B]">
        <ScrollArea className="flex-1 border-r border-[#222226]">
          <div className="p-3.5 space-y-3">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Overview</h4>
            <p className="text-xs leading-relaxed text-zinc-300 font-mono">
              {suggestions.complexityAnalysis}
            </p>
          </div>
        </ScrollArea>
        
        <ScrollArea className="flex-1">
          <div className="p-3.5 space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Transformations</h4>
            {suggestions.suggestions.map((suggestion, i) => (
              <div key={i} className="p-2.5 rounded bg-[#121215] border border-[#222226] flex gap-2.5 text-xs">
                <span className="text-[10px] font-mono text-zinc-500 mt-0.5">{i + 1}.</span>
                <p className="text-zinc-300 flex-1 leading-snug">{suggestion}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}