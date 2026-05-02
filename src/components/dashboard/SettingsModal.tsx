"use client"

import React from "react"
import { Settings, Cpu, ShieldCheck, Key, Globe, Server, Cloud, Laptop, Lock, Github } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { type InferenceProvider, useAppStore } from "@/store/use-app-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: InferenceProvider;
  onProviderChange: (p: InferenceProvider) => void;
  keyStatus: Record<string, boolean>;
  onSaveKey: (provider: string, key: string) => Promise<boolean>;
  ollamaConfig?: { url: string; model: string; useDefaultUrl: boolean };
  onSaveOllama?: (url: string, model: string) => Promise<boolean>;
  llamacppConfig?: { url: string };
  onSaveLlamacpp?: (url: string) => Promise<boolean>;
}

export function SettingsModal({
  isOpen,
  onOpenChange,
  provider,
  onProviderChange,
  keyStatus,
  onSaveKey,
  ollamaConfig,
  onSaveOllama,
  llamacppConfig,
  onSaveLlamacpp
}: SettingsModalProps) {
  const store = useAppStore()
  const [tempKey, setTempKey] = React.useState("")
  const [useDefaultOllama, setUseDefaultOllama] = React.useState(ollamaConfig?.useDefaultUrl ?? true)
  const [tempOllamaUrl, setTempOllamaUrl] = React.useState(ollamaConfig?.url || "http://127.0.0.1:11434")
  const [tempOllamaModel, setTempOllamaModel] = React.useState(ollamaConfig?.model || "qwen2.5-coder")
  const [tempLlamacppUrl, setTempLlamacppUrl] = React.useState(llamacppConfig?.url || "http://127.0.0.1:8080")
  const [isSaving, setIsSaving] = React.useState(false)
  const [isTesting, setIsTesting] = React.useState(false)
  const { toast } = useToast()

  const isCloudProvider = ['openai', 'anthropic', 'gemini'].includes(provider)
  const [activeGroup, setActiveGroup] = React.useState<'cloud' | 'local'>(isCloudProvider ? 'cloud' : 'local')

  const isGuest = store.user?.isAnonymous || false
  const activeOllamaUrl = useDefaultOllama ? "http://127.0.0.1:11434" : tempOllamaUrl

  const handleSaveKey = async () => {
    if (!tempKey) return
    setIsSaving(true)
    const success = await onSaveKey(provider, tempKey)
    if (success) {
      setTempKey("")
      toast({
        title: "Vault Updated",
        description: `${provider.toUpperCase()} credentials secured in local vault.`,
      })
    }
    setIsSaving(false)
  }

  const handleSaveOllama = async () => {
    if (!activeOllamaUrl || !tempOllamaModel || !onSaveOllama) return
    setIsSaving(true)
    const success = await onSaveOllama(activeOllamaUrl, tempOllamaModel)
    if (success) {
      toast({
        title: "Ollama Config Saved",
        description: "Local inference settings updated.",
      })
    }
    setIsSaving(false)
  }

  const handleSaveLlamacpp = async () => {
    if (!tempLlamacppUrl || !onSaveLlamacpp) return
    setIsSaving(true)
    const success = await onSaveLlamacpp(tempLlamacppUrl)
    if (success) {
      toast({
        title: "llama.cpp Config Saved",
        description: "Local inference settings updated.",
      })
    }
    setIsSaving(false)
  }

  const testConnection = async (url: string, endpoint: string = '/api/tags') => {
    setIsTesting(true)
    try {
      const fullUrl = endpoint.startsWith('/') ? `${url}${endpoint}` : `${url}/${endpoint}`
      const response = await fetch(fullUrl, { method: 'GET' })
      if (response.ok) {
        toast({
          title: "Connection Success",
          description: `Successfully pinged ${url}.`,
        })
      } else {
        throw new Error("Failed to connect")
      }
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: `Could not reach ${url}. Ensure it is running and accessible.`,
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border text-foreground p-0 overflow-hidden shadow-2xl">
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-primary" />
              <DialogTitle className="font-headline text-xl">Engine Configuration</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Configure local or cloud inference. Credentials are stored in a secure backend vault.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <div className="p-1 bg-background border border-border rounded-lg flex">
            <button
              onClick={() => setActiveGroup('cloud')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all rounded-md",
                activeGroup === 'cloud' 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Cloud className="w-3.5 h-3.5" />
              Cloud Providers
            </button>
            <button
              onClick={() => setActiveGroup('local')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all rounded-md",
                activeGroup === 'local' 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Laptop className="w-3.5 h-3.5" />
              Local Inference
            </button>
          </div>

          <div className="space-y-4">
            {activeGroup === 'cloud' && isGuest ? (
              <div className="py-8 px-4 text-center space-y-4 animate-in fade-in zoom-in duration-300 bg-background/50 rounded-lg border border-border/50 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">Premium APIs Locked</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                    Cloud providers like Gemini, OpenAI, and Anthropic require a secure GitHub account to manage persistent credentials.
                  </p>
                </div>
                <Button 
                  onClick={() => store.login()}
                  className="bg-foreground text-background hover:bg-muted-foreground text-xs font-bold h-9 px-6 gap-2"
                >
                  <Github className="w-3.5 h-3.5" />
                  Sign in with GitHub
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" />
                    Active Model Provider
                  </Label>
                  <Select 
                    value={provider} 
                    onValueChange={(v) => {
                      onProviderChange(v as InferenceProvider)
                    }}
                  >
                    <SelectTrigger className="bg-background border-border h-10">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-foreground">
                      {activeGroup === 'cloud' ? (
                        <>
                          <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                          <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
                          <SelectItem value="gemini">Google (Gemini 2.0)</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="ollama">Ollama (Local API)</SelectItem>
                          <SelectItem value="llamacpp">llama.cpp (Local Server)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {activeGroup === 'cloud' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Key className="w-3.5 h-3.5" />
                          {provider.toUpperCase()} API Key
                        </Label>
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder={keyStatus[provider] ? "••••••••••••••••" : "Enter API Key"}
                          value={tempKey}
                          onChange={(e) => setTempKey(e.target.value)}
                          className="bg-background border-border focus:ring-primary h-10"
                        />
                        <Button 
                          onClick={handleSaveKey} 
                          disabled={!tempKey || isSaving}
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-10"
                        >
                          Save
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 italic">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        Stored securely in backend secrets vault.
                      </p>
                    </div>
                  </div>
                )}

                {activeGroup === 'local' && provider === 'ollama' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-background border border-border rounded-lg flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-[11px] font-bold text-foreground uppercase">Use Default URL</Label>
                        <p className="text-[10px] text-muted-foreground font-mono">http://127.0.0.1:11434</p>
                      </div>
                      <Switch checked={useDefaultOllama} onCheckedChange={setUseDefaultOllama} />
                    </div>

                    {!useDefaultOllama && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          Ollama Base URL
                        </Label>
                        <Input
                          placeholder="http://127.0.0.1:11434"
                          value={tempOllamaUrl}
                          onChange={(e) => setTempOllamaUrl(e.target.value)}
                          className="bg-background border-border h-10"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Server className="w-3 h-3" />
                        Local Model Name
                      </Label>
                      <Input
                        placeholder="qwen2.5-coder"
                        value={tempOllamaModel}
                        onChange={(e) => setTempOllamaModel(e.target.value)}
                        className="bg-background border-border h-10"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline"
                        onClick={() => testConnection(activeOllamaUrl, '/api/tags')}
                        disabled={isTesting}
                        className="flex-1 border-border text-xs h-10"
                      >
                        Test Connection
                      </Button>
                      <Button 
                        onClick={handleSaveOllama}
                        disabled={isSaving || !tempOllamaModel}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10"
                      >
                        Apply Config
                      </Button>
                    </div>
                  </div>
                )}

                {activeGroup === 'local' && provider === 'llamacpp' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        llama.cpp Server URL
                      </Label>
                      <Input
                        placeholder="http://127.0.0.1:8080"
                        value={tempLlamacppUrl}
                        onChange={(e) => setTempLlamacppUrl(e.target.value)}
                        className="bg-background border-border h-10"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline"
                        onClick={() => testConnection(tempLlamacppUrl, '/health')}
                        disabled={isTesting}
                        className="flex-1 border-border text-xs h-10"
                      >
                        Test Connection
                      </Button>
                      <Button 
                        onClick={handleSaveLlamacpp}
                        disabled={isSaving || !tempLlamacppUrl}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10"
                      >
                        Apply Config
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}