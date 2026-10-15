"use client"

import React from "react"
import { FolderOpen, FileX, Laptop, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/use-app-store"
import { useToast } from "@/hooks/use-toast"

interface WorkspacePickerModalProps {
  isOpen: boolean;
  onSelect?: (path: string) => Promise<boolean>;
  onSkip: () => void;
}

export function WorkspacePickerModal({ isOpen, onSkip }: WorkspacePickerModalProps) {
  const store = useAppStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleBrowserOpen = async () => {
    setIsSubmitting(true)
    try {
      const success = await store.openBrowserWorkspace()
      if (success) {
        toast({
          title: "Workspace Loaded",
          description: "Folder access granted via local browser filesystem.",
        })
      }
    } catch (err: any) {
      toast({
        title: "Workspace Error",
        description: err.message || "Failed to load directory.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
      <DialogContent className="sm:max-w-[480px] bg-[#09090B] border border-[#27272A] text-[#FAFAFA] p-0 overflow-hidden shadow-2xl">
        <div className="p-6 pb-2">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5 text-[#E11D48]" />
              <DialogTitle className="font-headline text-lg text-[#FAFAFA] tracking-tight">Open Workspace</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed">
              Select a project folder on your machine to begin editing. All code stays 100% private and runs entirely locally in your browser.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="p-4 rounded-lg bg-[#141416] border border-[#222226] space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <Laptop className="w-3.5 h-3.5 text-[#E11D48]" />
              Universal Browser Filesystem
            </div>
            <Button 
              onClick={handleBrowserOpen}
              disabled={isSubmitting}
              className="w-full h-11 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-semibold text-xs gap-2.5 transition-all shadow-md group"
            >
              <FolderOpen className="w-4 h-4 text-[#E11D48] group-hover:scale-110 transition-transform" />
              {isSubmitting ? "Accessing Directory..." : "Open Local Folder"}
            </Button>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero-egress offline access. Compatible with all modern browsers.</span>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-[#121215] px-6 py-3 flex items-center justify-between border-t border-[#222226] gap-4">
          <Button 
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#18181B] text-xs h-8 px-3 group"
          >
            <FileX className="w-3.5 h-3.5 mr-2 group-hover:text-amber-500 transition-colors" />
            Skip (Single File Mode)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}