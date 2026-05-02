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
      <div className="h-full flex flex-col items-center justify-center space-y-3 bg-background">
        <div className="relative">
          <Wand2 className="w-8 h-8 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary blur-xl opacity-20 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Refactoring Engine Active</p>
      </div>
    )
  }

  if (!suggestions) {
    return (
      <div className="h-full flex flex-col bg-background border-t border-border">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-foreground">pepper-shell v1.0</h3>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={store.toggleBottomPanel}
                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-popover border-border text-[10px]">
                Minimize Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs text-muted-foreground">Run an analysis to generate refactoring suggestions.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background border-t border-border">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Refactoring Strategy</h3>
        </div>
        <div className="flex gap-2 items-center">
          {suggestions.refactoredCode && (
            <Button 
              size="sm" 
              onClick={() => onApply(suggestions.refactoredCode)}
              className="h-7 px-3 text-[10px] bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              <Check className="w-3 h-3 mr-1" /> Commit Changes
            </Button>
          )}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={store.toggleBottomPanel}
                  className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-popover border-border text-[10px]">
                Minimize Panel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden bg-background">
        <ScrollArea className="flex-1 border-r border-border">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Linguistic Analysis</h4>
              <p className="text-[13px] leading-relaxed text-foreground/90 font-mono italic">
                {suggestions.complexityAnalysis}
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Optimization Tasks</h4>
            {suggestions.suggestions.map((suggestion, i) => (
              <div key={i} className="group p-2.5 rounded-sm bg-card border border-border hover:border-primary/30 transition-colors flex gap-3">
                <div className="w-5 h-5 rounded-sm bg-background flex items-center justify-center shrink-0 border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                </div>
                <p className="text-[12px] leading-snug text-foreground/90 flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}