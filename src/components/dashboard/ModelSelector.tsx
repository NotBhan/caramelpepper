"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Cpu, 
  Cloud, 
  Key, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  HardDrive, 
  Sparkles, 
  Lock, 
  Server, 
  ChevronRight, 
  Flame, 
  Trash2, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Info
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModelStore, ModelInfo, KeyValidationStatus } from "@/store/useModelStore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ModelSelectorProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ModelSelector({ isOpen, onOpenChange }: ModelSelectorProps) {
  const store = useModelStore()
  const { toast } = useToast()

  const openState = isOpen !== undefined ? isOpen : store.isDrawerOpen;
  const setOpenState = onOpenChange || store.setIsDrawerOpen;

  const [activeTab, setActiveTab] = useState<string>("local")
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({})
  const [isRescanning, setIsRescanning] = useState<boolean>(false)

  useEffect(() => {
    if (openState) {
      store.fetchModels()
      store.fetchKeyStatuses()
    }
  }, [openState])

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleKeyInputChange = (provider: string, value: string) => {
    setKeyInputs(prev => ({ ...prev, [provider]: value }))
  }

  const handleValidateAndSave = async (provider: string) => {
    const rawKey = keyInputs[provider]
    if (!rawKey) {
      toast({
        title: "Key Required",
        description: `Please enter an API key for ${provider.toUpperCase()}.`,
        variant: "destructive"
      })
      return
    }

    const status = await store.validateKey(provider, rawKey)

    if (status === 'VALID') {
      toast({
        title: "Authentication Verified",
        description: `${provider.toUpperCase()} API key validated and securely stored in encrypted vault.`,
      })
      // Clear raw input for security
      setKeyInputs(prev => ({ ...prev, [provider]: "" }))
      setShowKeys(prev => ({ ...prev, [provider]: false }))
    } else {
      const messages: Record<KeyValidationStatus, string> = {
        INVALID_KEY: "Invalid key format or prefix.",
        EXPIRED: "This API key has expired or was revoked.",
        QUOTA_EXCEEDED: "Account quota exhausted (HTTP 429).",
        NETWORK_ERROR: "Network timeout contacting provider.",
        IDLE: "Untested.",
        VALIDATING: "Validating...",
        VALID: "Valid."
      }

      toast({
        title: "Validation Failed",
        description: messages[status] || "Could not verify credentials.",
        variant: "destructive"
      })
    }
  }

  const handleSelectModel = async (model: ModelInfo) => {
    const success = await store.selectModel(model.id, model.provider)
    if (success) {
      toast({
        title: "Model Hot-Swapped",
        description: `Active runtime switched to ${model.name}.`,
      })
    } else if (store.fallbackActive && store.fallbackReason) {
      toast({
        title: "Graceful Fallback Activated",
        description: store.fallbackReason,
        variant: "destructive"
      })
    } else {
      toast({
        title: "Hot-Swap Failed",
        description: store.swapError || "Could not load selected model.",
        variant: "destructive"
      })
    }
  }

  const handleRescan = async () => {
    setIsRescanning(true)
    await store.fetchModels()
    setTimeout(() => {
      setIsRescanning(false)
      toast({
        title: "Directory Rescanned",
        description: "Scanned backend/models/ for updated .gguf weights.",
      })
    }, 600)
  }

  const localModels = store.models.filter(m => m.isLocal)
  const cloudModels = store.models.filter(m => !m.isLocal)

  const providers = [
    {
      id: "openai",
      name: "OpenAI",
      desc: "GPT-4o, GPT-4o Mini, o3-mini",
      placeholder: "sk-proj-...",
      prefix: "sk-"
    },
    {
      id: "anthropic",
      name: "Anthropic",
      desc: "Claude 3.5 Sonnet, Claude 3.5 Haiku",
      placeholder: "sk-ant-api03-...",
      prefix: "sk-ant-"
    },
    {
      id: "gemini",
      name: "Google Gemini",
      desc: "Gemini 2.0 Flash, Gemini 1.5 Pro",
      placeholder: "AIzaSy...",
      prefix: "AIza"
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      desc: "DeepSeek R1, Llama 3.3, Unified Gateway",
      placeholder: "sk-or-v1-...",
      prefix: "sk-or-"
    }
  ]

  const renderStatusBadge = (status: KeyValidationStatus) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            VALID
          </span>
        )
      case 'INVALID_KEY':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            INVALID KEY
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            EXPIRED
          </span>
        )
      case 'QUOTA_EXCEEDED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3 text-purple-400" />
            QUOTA EXCEEDED
          </span>
        )
      case 'NETWORK_ERROR':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3 text-red-400" />
            NETWORK ERROR
          </span>
        )
      case 'VALIDATING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
            VALIDATING...
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
            UNCONFIGURED
          </span>
        )
    }
  }

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="sm:max-w-[700px] bg-[#09090B] border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl shadow-black/80 font-sans">
        
        {/* Header with Dual-Inference Paradigm Status */}
        <div className="p-6 pb-4 border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-transparent">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                  <Flame className="w-4 h-4 fill-rose-500" />
                </div>
                <div>
                  <DialogTitle className="font-headline text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    Model Selection & Key Vault
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs">
                    Dual-inference engine: Local offline llama.cpp & remote cloud LLMs.
                  </DialogDescription>
                </div>
              </div>

              {/* Mode Status Pill */}
              <div className={cn(
                "px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-2 tracking-tight transition-all",
                store.isLocalMode 
                  ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                  : "bg-amber-950/50 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  store.isLocalMode ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"
                )} />
                {store.isLocalMode ? "Local Mode (Zero-Egress)" : "Hybrid Cloud Mode"}
              </div>
            </div>
          </DialogHeader>

          {/* Active Model Indicator Strip */}
          <div className="mt-4 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Active Engine</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-rose-500/40 text-rose-400 bg-rose-500/10 px-1.5 py-0">
                    {store.activeModel?.quantization || "Q4_K_M"}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight">
                  {store.activeModel?.name || store.activeModelId}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-zinc-800 text-zinc-200 border-zinc-700 text-[10px] font-mono">
                {store.isLocalMode 
                  ? `${store.activeModel?.ramRequiredMB || 1450} MB VRAM` 
                  : "0 MB Local RAM"}
              </Badge>
              {store.isLocalMode && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={store.unloadModel}
                  className="h-6 px-2 text-[10px] text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Unload model weights from VRAM to release memory"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Free VRAM
                </Button>
              )}
            </div>
          </div>

          {/* Graceful Fallback Warning Banner */}
          {store.fallbackActive && store.fallbackReason && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-2.5 p-2 rounded bg-amber-950/50 border border-amber-500/40 flex items-center justify-between text-[11px] text-amber-300"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{store.fallbackReason}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={store.resetFallback}
                className="h-5 px-2 text-[10px] text-amber-400 hover:bg-amber-900/40"
              >
                Dismiss
              </Button>
            </motion.div>
          )}
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-3">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-950 border border-zinc-800/80">
              <TabsTrigger 
                value="local" 
                className="text-xs font-bold gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
                Local Models ({localModels.length})
              </TabsTrigger>
              <TabsTrigger 
                value="cloud" 
                className="text-xs font-bold gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                Cloud Providers ({cloudModels.length})
              </TabsTrigger>
              <TabsTrigger 
                value="keys" 
                className="text-xs font-bold gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400"
              >
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Key Vault & Security
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[380px] px-6 py-4">
            
            {/* TAB 1: Local Offline Models */}
            <TabsContent value="local" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Local GGUF Models (backend/models/)</h4>
                  <p className="text-[11px] text-zinc-400">
                    Offline inference with zero telemetry egress. Directly loaded into local VRAM/RAM.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRescan}
                  disabled={isRescanning}
                  className="h-7 text-[10px] font-bold border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
                >
                  <RefreshCw className={cn("w-3 h-3 mr-1.5", isRescanning && "animate-spin text-rose-500")} />
                  {isRescanning ? "Scanning..." : "Rescan Folder"}
                </Button>
              </div>

              <div className="space-y-3">
                {localModels.map((m) => {
                  const isActive = store.activeModelId === m.id
                  return (
                    <motion.div
                      key={m.id}
                      whileHover={{ scale: 1.005 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-200 relative overflow-hidden",
                        isActive 
                          ? "bg-rose-500/5 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.08)]" 
                          : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                      )}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                          <div className="absolute transform rotate-45 bg-rose-500 text-white text-[8px] font-bold py-0.5 right-[-35px] top-[18px] w-[120px] text-center uppercase tracking-widest">
                            Active
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="space-y-1 pr-12">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white tracking-tight">{m.name}</h4>
                            <Badge className="bg-zinc-800/80 border-zinc-700 text-zinc-300 text-[9px] font-mono">
                              {m.quantization}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[440px]">
                            {m.description}
                          </p>
                        </div>
                        
                        <Button
                          size="sm"
                          disabled={isActive || store.isHotSwapping}
                          onClick={() => handleSelectModel(m)}
                          className={cn(
                            "h-7 px-3 text-[10px] font-bold uppercase tracking-tight shrink-0",
                            isActive 
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-default" 
                              : "bg-zinc-800 hover:bg-rose-600 hover:text-white text-zinc-200"
                          )}
                        >
                          {store.isHotSwapping && store.activeModelId === m.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          ) : isActive ? (
                            "Loaded"
                          ) : (
                            "Hot-Swap"
                          )}
                        </Button>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center gap-4 text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <HardDrive className="w-3 h-3 text-zinc-500" />
                          File: {m.sizeFormatted}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Cpu className="w-3 h-3 text-rose-400" />
                          VRAM: ~{m.ramRequiredMB} MB
                        </span>
                        <span className="text-zinc-600 truncate max-w-[200px]" title={m.path}>
                          {m.filename}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Offline Hint Guide */}
              <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-800/80 flex items-start gap-3 text-zinc-400">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-zinc-200">How to add custom local models: </span>
                  Download any <code className="text-rose-300 font-mono text-[10px]">.gguf</code> model from Hugging Face and drop it into <code className="text-zinc-300 font-mono text-[10px]">backend/models/</code>. Click "Rescan Folder" to enable zero-egress hot-swapping immediately.
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Cloud Providers */}
            <TabsContent value="cloud" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Remote Cloud Inference (Optional)</h4>
                  <p className="text-[11px] text-zinc-400">
                    Route inference to ultra-large frontier models. Requires an API key in the Key Vault.
                  </p>
                </div>
              </div>

              {cloudModels.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-zinc-950/40 rounded-xl border border-zinc-800/80 border-dashed">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-zinc-200">No Cloud Models Configured</h3>
                    <p className="text-[11px] text-zinc-400 max-w-[320px] mx-auto">
                      Add and validate an API key in the <strong>Key Vault</strong> tab to unlock OpenAI, Claude, Gemini, or OpenRouter models.
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setActiveTab("keys")}
                    className="h-7 text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 px-4"
                  >
                    Open Key Vault
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cloudModels.map((m) => {
                    const isActive = store.activeModelId === m.id
                    return (
                      <motion.div
                        key={m.id}
                        whileHover={{ scale: 1.005 }}
                        className={cn(
                          "p-4 rounded-xl border transition-all duration-200 relative overflow-hidden",
                          isActive 
                            ? "bg-amber-500/5 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]" 
                            : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 pr-12">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white tracking-tight">{m.name}</h4>
                              <Badge className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9px] uppercase font-mono">
                                {m.provider}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[440px]">
                              {m.description}
                            </p>
                          </div>

                          <Button
                            size="sm"
                            disabled={isActive || store.isHotSwapping}
                            onClick={() => handleSelectModel(m)}
                            className={cn(
                              "h-7 px-3 text-[10px] font-bold uppercase tracking-tight shrink-0",
                              isActive 
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-default" 
                                : "bg-zinc-800 hover:bg-amber-600 hover:text-white text-zinc-200"
                            )}
                          >
                            {store.isHotSwapping && store.activeModelId === m.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            ) : isActive ? (
                              "Active"
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center gap-4 text-[10px] font-mono text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Cloud className="w-3 h-3 text-amber-400" />
                            Cloud Route
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <Cpu className="w-3 h-3" />
                            Zero Local VRAM
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: API Key Vault & Security Management */}
            <TabsContent value="keys" className="mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">API Key Encryption & Verification Vault</h4>
                  <p className="text-[11px] text-zinc-400">
                    Keys are AES-256 encrypted locally (chmod 0600) and automatically redacted from server logs.
                  </p>
                </div>
              </div>

              {/* Automatic Fallback Switch */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-200">Auto-Fallback Protection</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Automatically fallback to an available cloud or local model if the active local model encounters an Out-Of-Memory (OOM) or corrupted weight crash.
                  </p>
                </div>
                <Switch 
                  checked={store.isAutoFallbackEnabled} 
                  onCheckedChange={store.toggleAutoFallback}
                  className="scale-90"
                />
              </div>

              {/* Providers Key Grid */}
              <div className="space-y-3">
                {providers.map((p) => {
                  const keyInfo = store.keyStatuses[p.id] || { status: 'IDLE', configured: false, maskedKey: '' }
                  const isVisible = showKeys[p.id] || false
                  const rawInput = keyInputs[p.id] || ""
                  const isValidating = store.isValidatingKey[p.id] || false

                  return (
                    <div 
                      key={p.id}
                      className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{p.name}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono">({p.desc})</span>
                          </div>
                          {keyInfo.maskedKey && (
                            <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                              Active: <span className="text-emerald-400">{keyInfo.maskedKey}</span>
                            </p>
                          )}
                        </div>

                        {renderStatusBadge(keyInfo.status)}
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={isVisible ? "text" : "password"}
                            placeholder={keyInfo.configured ? "Enter new key to replace..." : p.placeholder}
                            value={rawInput}
                            onChange={(e) => handleKeyInputChange(p.id, e.target.value)}
                            className="h-8 text-xs bg-zinc-900 border-zinc-700/80 text-white pr-9 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(p.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <Button
                          size="sm"
                          disabled={!rawInput || isValidating}
                          onClick={() => handleValidateAndSave(p.id)}
                          className="h-8 px-3 text-[10px] font-bold bg-zinc-800 hover:bg-emerald-600 text-white shrink-0"
                        >
                          {isValidating ? (
                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          Validate & Save
                        </Button>
                      </div>

                      {keyInfo.message && (
                        <p className={cn(
                          "text-[10px]",
                          keyInfo.status === 'VALID' ? "text-emerald-400/90" : "text-rose-400/90"
                        )}>
                          {keyInfo.message}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer Guarantee */}
        <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-zinc-400 px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono">
              Zero plain-text logging &bull; AES-256 local vault &bull; No egress in Local Mode
            </span>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setOpenState(false)}
            className="h-7 text-xs text-zinc-300 hover:text-white"
          >
            Done
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}
