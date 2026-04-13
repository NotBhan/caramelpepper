
"use client"

import React from "react"
import { Cookie, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface CookieConsentProps {
  onConsent: () => void;
}

export function CookieConsent({ onConsent }: CookieConsentProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const consent = localStorage.getItem("caramelpepper-cookie-consent")
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("caramelpepper-cookie-consent", "true")
    setIsVisible(false)
    onConsent()
  }

  const handleDecline = () => {
    localStorage.setItem("caramelpepper-cookie-consent", "declined")
    setIsVisible(false)
    onConsent()
  }

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md bg-[#252526] border-[#3c3c3c] p-0 overflow-hidden [&>button]:hidden shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#007acc]/10 flex items-center justify-center border border-[#007acc]/20">
              <Cookie className="w-8 h-8 text-[#007acc]" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-headline font-bold text-[#ffffff]">
                Workspace Persistence
              </DialogTitle>
              <DialogDescription className="text-sm text-[#858585] leading-relaxed">
                CaramelPepper uses essential cookies and local storage to persist your IDE configuration, 
                workspace roots, and editor preferences across sessions.
              </DialogDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              onClick={handleDecline}
              className="h-11 border-[#3c3c3c] hover:bg-[#2a2d2e] text-[#858585] font-bold"
            >
              Decline
            </Button>
            <Button 
              onClick={handleAccept}
              className="h-11 bg-[#007acc] hover:bg-[#0062a3] text-[#ffffff] font-bold"
            >
              Accept All
            </Button>
          </div>

          <div className="pt-4 border-t border-[#3c3c3c] flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] text-[#858585] uppercase tracking-widest font-bold">Privacy First Architecture</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
