
"use client"

import React from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-app-store"
import { MaterialFileIcon } from "./MaterialIcon"

interface NewFileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewFileModal({ isOpen, onOpenChange }: NewFileModalProps) {
  const store = useAppStore()

  const languages = [
    { name: "C++ Source", ext: "cpp" },
    { name: "C++ Header", ext: "hpp" },
    { name: "C Source", ext: "c" },
    { name: "Python", ext: "py" },
    { name: "TypeScript", ext: "ts" },
    { name: "React TSX", ext: "tsx" },
    { name: "Rust", ext: "rs" },
    { name: "Go", ext: "go" },
    { name: "Markdown", ext: "md" },
    { name: "JSON", ext: "json" },
  ]

  const handleSelect = (ext: string) => {
    store.newFile(ext)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[#09090B] border border-[#27272A] p-0 overflow-hidden shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Plus className="w-4 h-4 text-[#E11D48]" />
              <DialogTitle className="font-headline text-lg text-[#FAFAFA]">New Scratchpad</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed">
              Select a language to boot an instant tree-sitter AST analysis environment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.ext}
                variant="outline"
                onClick={() => handleSelect(lang.ext)}
                className="h-12 border-[#222226] bg-[#141416] hover:bg-[#18181B] hover:border-zinc-600 justify-start px-3.5 group transition-all"
              >
                <MaterialFileIcon fileName={`file.${lang.ext}`} className="w-4 h-4 mr-3 shrink-0" />
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-xs font-medium text-[#FAFAFA]">{lang.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">.{lang.ext}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-[#121215] px-6 py-2.5 border-t border-[#222226] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Local C++20 Core</span>
          </div>
          <span>Fast AST Mode</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
