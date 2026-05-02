"use client"

import React from "react"
import { FolderOpen, MapPin, AlertCircle, Loader2, FileX, Laptop } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppStore } from "@/store/use-app-store"
import { useToast } from "@/hooks/use-toast"

interface WorkspacePickerModalProps {
  isOpen: boolean;
  onSelect: (path: string) => Promise<boolean>;
  onSkip: () => void;
}

export function WorkspacePickerModal({ isOpen, onSelect, onSkip }: WorkspacePickerModalProps) {
  const store = useAppStore()
  const { toast } = useToast()
  const [path, setPath] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // @ts-ignore
  const isBrowserApiSupported = typeof window !== 'undefined' && !!window.showDirectoryPicker;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedPath = path.trim()
    if (!trimmedPath) return

    setError(null)
    setIsSubmitting(true)
    
    try {
      const success = await onSelect(trimmedPath)
      if (!success) {
        setError("Directory not found. Please ensure the absolute path is correct and accessible by the backend.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize workspace.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBrowserOpen = async () => {
    if (!isBrowserApiSupported) {
      toast({
        title: "Browser API Not Supported",
        description: "The File System Access API is only available in modern Chromium-based browsers (Chrome, Edge).",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true)
    const success = await store.openBrowserWorkspace()
    if (success) {
      toast({
        title: "Workspace Loaded",
        description: "Folder access granted via Browser File System API.",
      })
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border text-foreground/80 p-0 overflow-hidden shadow-2xl">
        <div className="p-6 pb-0">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <DialogTitle className="font-headline text-xl text-foreground">Select Workspace</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
              CaramelPepper supports two modes: Local Path (for backend access) or Browser API (for client-side local folder access).
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5" />
              Direct Client Access
            </Label>
            <Button 
              onClick={handleBrowserOpen}
              variant={isBrowserApiSupported ? "default" : "outline"}
              className={`w-full h-12 ${isBrowserApiSupported ? 'bg-secondary hover:bg-muted' : 'opacity-50 cursor-not-allowed bg-transparent'} border border-border text-foreground font-bold text-sm gap-3 group`}
            >
              <FolderOpen className={`w-5 h-5 ${isBrowserApiSupported ? 'text-primary group-hover:scale-110' : 'text-muted-foreground'} transition-transform`} />
              {isBrowserApiSupported ? "Open Local Folder (Browser API)" : "Browser API Not Supported"}
            </Button>
            {!isBrowserApiSupported && (
              <p className="text-[10px] text-destructive italic">
                Requires Chrome/Edge and a secure (HTTPS) connection.
              </p>
            )}
            {isBrowserApiSupported && (
              <p className="text-[10px] text-muted-foreground italic">Recommended for privacy-first hosted environments.</p>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-bold">OR PROVIDE PATH</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="path" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Absolute Project Path
              </Label>
              <Input
                id="path"
                placeholder="e.g., C:/Projects/App or /home/user/app"
                value={path}
                onChange={(e) => {
                  setPath(e.target.value);
                  if (error) setError(null);
                }}
                className="bg-background border-border focus:ring-primary h-10 text-foreground font-mono text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Only works if the CaramelPepper backend is running on your machine.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                type="submit" 
                disabled={!path.trim() || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 px-6 min-w-[140px]"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Backend Path"}
              </Button>
            </div>
          </form>
        </div>

        <DialogFooter className="bg-background px-6 py-4 flex items-center justify-between border-t border-border gap-4">
          <Button 
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground hover:bg-muted text-xs h-9 px-3 group"
          >
            <FileX className="w-4 h-4 mr-2 group-hover:text-amber-500 transition-colors" />
            Skip (Single File Mode)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}