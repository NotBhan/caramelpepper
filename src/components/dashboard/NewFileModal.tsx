
"use client"

import React from "react"
import { 
  FileCode, 
  FileJson, 
  FileText, 
  Terminal, 
  Code2, 
  Layers,
  FileSearch,
  FileType
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-app-store"
import { cn } from "@/lib/utils"

interface NewFileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewFileModal({ isOpen, onOpenChange }: NewFileModalProps) {
  const store = useAppStore()

  const languages = [
    { name: "TypeScript", ext: "ts", icon: FileCode, color: "text-[#007acc]" },
    { name: "JavaScript", ext: "js", icon: FileCode, color: "text-amber-400" },
    { name: "Python", ext: "py", icon: Terminal, color: "text-emerald-400" },
    { name: "C++", ext: "cpp", icon: Code2, color: "text-blue-500" },
    { name: "Rust", ext: "rs", icon: Layers, color: "text-orange-500" },
    { name: "Go", ext: "go", icon: FileSearch, color: "text-cyan-400" },
    { name: "Java", ext: "java", icon: FileType, color: "text-red-400" },
    { name: "Markdown", ext: "md", icon: FileText, color: "text-[#858585]" },
    { name: "JSON", ext: "json", icon: FileJson, color: "text-amber-200" },
    { name: "HTML/CSS", ext: "html", icon: Code2, color: "text-orange-400" },
    { name: "Plain Text", ext: "txt", icon: FileText, color: "text-[#858585]" },
  ]

  const handleSelect = (ext: string) => {
    store.newFile(ext)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[#252526] border-[#3c3c3c] p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-5 h-5 text-[#007acc]" />
              <DialogTitle className="font-headline text-xl text-[#ffffff]">New Scratchpad</DialogTitle>
            </div>
            <DialogDescription className="text-[#858585] text-xs">
              Select a programming language for your new workspace. CaramelPepper will optimize its AI engine based on your choice.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.ext}
                variant="outline"
                onClick={() => handleSelect(lang.ext)}
                className="h-14 border-[#3c3c3c] bg-[#1e1e1e] hover:bg-[#2a2d2e] hover:border-[#007acc]/40 justify-start px-4 group transition-all duration-200"
              >
                <lang.icon className={cn("w-5 h-5 mr-3 shrink-0", lang.color)} />
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-bold text-[#ffffff]">{lang.name}</span>
                  <span className="text-[10px] text-[#858585] uppercase">.{lang.ext}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-[#1e1e1e] px-6 py-3 border-t border-[#3c3c3c] flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#007acc] animate-pulse" />
          <span className="text-[10px] text-[#858585] font-mono uppercase tracking-widest">Select an environment to boot</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
