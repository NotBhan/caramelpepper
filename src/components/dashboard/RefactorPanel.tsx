
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
      <div className="h-full flex flex-col items-center justify-center space-y-3 bg-[#1e1e1e]">
        <div className="relative">
          <Wand2 className="w-8 h-8 text-[#007acc] animate-pulse" />
          <div className="absolute inset-0 bg-[#007acc] blur-xl opacity-20 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-[#858585] uppercase tracking-widest">AI Refactoring Engine Active</p>
      </div>
    )
  }

  if (!suggestions) {
    return (
      <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-[#3c3c3c]">
        <div className="px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between bg-[#252526]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#858585]" />
            <h3 className="text-xs font-bold text-[#ffffff]">pepper-shell v1.0</h3>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={store.toggleBottomPanel}
                  className="h-6 w-6 text-[#858585] hover:text-[#ffffff] hover:bg-[#333333]"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#252526] border-[#3c3c3c] text-[10px]">
                Minimize Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-[#858585]">Run an analysis to generate refactoring suggestions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-[#3c3c3c]">
      <div className="px-4 py-2 border-b border-[#3c3c3c] flex items-center justify-between bg-[#252526]">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="w-4 h-4 text-[#007acc]" />
          <h3 className="text-xs font-bold text-[#ffffff]">Refactoring Strategy</h3>
        </div>
        <div className="flex gap-2 items-center">
          {suggestions.refactoredCode && (
            <Button 
              size="sm" 
              onClick={() => onApply(suggestions.refactoredCode)}
              className="h-7 px-3 text-[10px] bg-[#007acc] text-[#ffffff] font-bold hover:bg-[#0062a3]"
            >
              <Check className="w-3 h-3 mr-1" /> Commit Changes
            </Button>
          )}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={store.toggleBottomPanel}
                  className="h-6 w-6 text-[#858585] hover:text-[#ffffff] hover:bg-[#333333]"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#252526] border-[#3c3c3c] text-[10px]">
                Minimize Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 border-r border-[#3c3c3c]">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">Linguistic Analysis</h4>
              <p className="text-[13px] leading-relaxed text-[#cccccc] font-mono italic">
                {suggestions.complexityAnalysis}
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">Optimization Tasks</h4>
            {suggestions.suggestions.map((suggestion, i) => (
              <div key={i} className="group p-2.5 rounded-sm bg-[#252526] border border-[#3c3c3c] hover:border-[#007acc]/30 transition-colors flex gap-3">
                <div className="w-5 h-5 rounded-sm bg-[#1e1e1e] flex items-center justify-center shrink-0 border border-[#3c3c3c]">
                  <span className="text-[10px] font-bold text-[#858585]">{i + 1}</span>
                </div>
                <p className="text-[12px] leading-snug text-[#cccccc] flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
