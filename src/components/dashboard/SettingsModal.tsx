
"use client"

import React from "react"
import { 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Key, 
  Globe, 
  Server, 
  Cloud, 
  Laptop, 
  Lock, 
  Github, 
  CheckCircle2,
  AlertCircle
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
import { type InferenceProvider, useAppStore } from "@/store/use-app-store"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  provider: activeProvider,
  onProviderChange,
  keyStatus,
  onSaveKey,
  ollamaConfig,
  onSaveOllama,
  llamacppConfig,
  onSaveLlamacpp
}: SettingsModalProps) {
  const store = useAppStore()
  const [tempKeys, setTempKeys] = React.useState<Record<string, string>>({})
  const [useDefaultOllama, setUseDefaultOllama] = React.useState(ollamaConfig?.useDefaultUrl ?? true)
  const [tempOllamaUrl, setTempOllamaUrl] = React.useState(ollamaConfig?.url || "http://127.0.0.1:11434")
  const [tempOllamaModel, setTempOllamaModel] = React.useState(ollamaConfig?.model || "qwen2.5-coder")
  const [tempLlamacppUrl, setTempLlamacppUrl] = React.useState(llamacppConfig?.url || "http://127.0.0.1:8080")
  const [isSaving, setIsSaving] = React.useState<string | null>(null)
  const [isTesting, setIsTesting] = React.useState<string | null>(null)
  const { toast } = useToast()

  const isGuest = store.user?.isAnonymous || false
  const activeOllamaUrl = useDefaultOllama ? "http://127.0.0.1:11434" : tempOllamaUrl

  const handleSaveKey = async (provider: string) => {
    const key = tempKeys[provider]
    if (!key) return
    setIsSaving(provider)
    const success = await onSaveKey(provider, key)
    if (success) {
      setTempKeys(prev => ({ ...prev, [provider]: "" }))
      toast({
        title: "Vault Updated",
        description: `${provider.toUpperCase()} credentials secured in local vault.`,
      })
    }
    setIsSaving(null)
  }

  const handleSaveOllama = async () => {
    if (!activeOllamaUrl || !tempOllamaModel || !onSaveOllama) return
    setIsSaving('ollama')
    const success = await onSaveOllama(activeOllamaUrl, tempOllamaModel)
    if (success) {
      toast({
        title: "Ollama Config Saved",
        description: "Local inference settings updated.",
      })
    }
    setIsSaving(null)
  }

  const handleSaveLlamacpp = async () => {
    if (!tempLlamacppUrl || !onSaveLlamacpp) return
    setIsSaving('llamacpp')
    const success = await onSaveLlamacpp(tempLlamacppUrl)
    if (success) {
      toast({
        title: "llama.cpp Config Saved",
        description: "Local inference settings updated.",
      })
    }
    setIsSaving(null)
  }

  const testConnection = async (id: string, url: string, endpoint: string = '/api/tags') => {
    setIsTesting(id)
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
      setIsTesting(null)
    }
  }

  const cloudProviders = [
    { id: 'gemini', name: 'Google Gemini', desc: 'Gemini 2.0 Flash (Fast & Capable)' },
    { id: 'openai', name: 'OpenAI GPT-4o', desc: 'Industry standard for complex reasoning' },
    { id: 'anthropic', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet (Expert Coder)' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border text-foreground p-0 overflow-hidden shadow-2xl">
        <div className="p-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-primary" />
              <DialogTitle className="font-headline text-xl">Engine Configuration</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-xs">
              Configure your local or cloud inference hierarchy. Active provider is used for all refactoring tasks.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue={['openai', 'anthropic', 'gemini'].includes(activeProvider) ? 'cloud' : 'local'} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 bg-background border border-border">
              <TabsTrigger value="cloud" className="text-xs font-bold gap-2">
                <Cloud className="w-3.5 h-3.5" />
                Cloud Engines
              </TabsTrigger>
              <TabsTrigger value="local" className="text-xs font-bold gap-2">
                <Laptop className="w-3.5 h-3.5" />
                Local Inference
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[420px] px-6 py-4">
            <TabsContent value="cloud" className="mt-0 space-y-6">
              {isGuest ? (
                <div className="py-12 text-center space-y-4 bg-background/50 rounded-lg border border-border/50 border-dashed">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground font-headline">Premium APIs Locked</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                      Cloud providers require a secure GitHub account to manage persistent credentials in our encrypted vault.
                    </p>
                  </div>
                  <Button 
                    onClick={() => store.login()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold h-9 px-6 gap-2"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Sign in with GitHub
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cloudProviders.map((cp) => (
                    <div 
                      key={cp.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all duration-200",
                        activeProvider === cp.id ? "bg-primary/5 border-primary/30" : "bg-background border-border"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">{cp.name}</h4>
                            {activeProvider === cp.id && (
                              <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Active</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{cp.desc}</p>
                        </div>
                        <Button
                          variant={activeProvider === cp.id ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => onProviderChange(cp.id as InferenceProvider)}
                          className="h-7 text-[10px] font-bold uppercase tracking-tight"
                          disabled={activeProvider === cp.id}
                        >
                          {activeProvider === cp.id ? "Selected" : "Set Active"}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">API Key</Label>
                          {keyStatus[cp.id] && (
                            <div className="flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="w-3 h-3" />
                              <span className="text-[9px] font-bold uppercase">Configured</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder={keyStatus[cp.id] ? "••••••••••••••••" : "Enter API key..."}
                            value={tempKeys[cp.id] || ""}
                            onChange={(e) => setTempKeys(prev => ({ ...prev, [cp.id]: e.target.value }))}
                            className="h-8 text-xs bg-background border-border"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveKey(cp.id)}
                            disabled={!tempKeys[cp.id] || isSaving === cp.id}
                            className="h-8 px-4 text-[10px] font-bold"
                          >
                            {isSaving === cp.id ? "..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="local" className="mt-0 space-y-6">
              {/* Ollama Section */}
              <div className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                activeProvider === 'ollama' ? "bg-primary/5 border-primary/30" : "bg-background border-border"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">Ollama (Local API)</h4>
                      {activeProvider === 'ollama' && (
                        <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">High-performance inference for macOS, Linux, and Windows.</p>
                  </div>
                  <Button
                    variant={activeProvider === 'ollama' ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onProviderChange('ollama')}
                    className="h-7 text-[10px] font-bold uppercase tracking-tight"
                    disabled={activeProvider === 'ollama'}
                  >
                    {activeProvider === 'ollama' ? "Selected" : "Set Active"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-background border border-border rounded-sm">
                    <span className="text-[11px] font-bold text-foreground">Use Default URL (127.0.0.1:11434)</span>
                    <Switch checked={useDefaultOllama} onCheckedChange={setUseDefaultOllama} className="scale-75" />
                  </div>

                  {!useDefaultOllama && (
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        Base URL
                      </Label>
                      <Input
                        value={tempOllamaUrl}
                        onChange={(e) => setTempOllamaUrl(e.target.value)}
                        className="h-8 text-xs bg-background border-border"
                        placeholder="http://127.0.0.1:11434"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Server className="w-3 h-3" />
                      Model Name
                    </Label>
                    <Input
                      value={tempOllamaModel}
                      onChange={(e) => setTempOllamaModel(e.target.value)}
                      className="h-8 text-xs bg-background border-border"
                      placeholder="qwen2.5-coder"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => testConnection('ollama', activeOllamaUrl, '/api/tags')}
                      disabled={isTesting === 'ollama'}
                      className="h-8 text-[10px] border-border"
                    >
                      {isTesting === 'ollama' ? "Testing..." : "Ping Service"}
                    </Button>
                    <Button 
                      onClick={handleSaveOllama}
                      disabled={isSaving === 'ollama' || !tempOllamaModel}
                      className="h-8 text-[10px] font-bold"
                    >
                      {isSaving === 'ollama' ? "Applying..." : "Apply Config"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Llama.cpp Section */}
              <div className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                activeProvider === 'llamacpp' ? "bg-primary/5 border-primary/30" : "bg-background border-border"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">llama.cpp Server</h4>
                      {activeProvider === 'llamacpp' && (
                        <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Active</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">Universal GGUF inference via local server endpoint.</p>
                  </div>
                  <Button
                    variant={activeProvider === 'llamacpp' ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onProviderChange('llamacpp')}
                    className="h-7 text-[10px] font-bold uppercase tracking-tight"
                    disabled={activeProvider === 'llamacpp'}
                  >
                    {activeProvider === 'llamacpp' ? "Selected" : "Set Active"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Server URL
                    </Label>
                    <Input
                      value={tempLlamacppUrl}
                      onChange={(e) => setTempLlamacppUrl(e.target.value)}
                      className="h-8 text-xs bg-background border-border"
                      placeholder="http://127.0.0.1:8080"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => testConnection('llamacpp', tempLlamacppUrl, '/health')}
                      disabled={isTesting === 'llamacpp'}
                      className="h-8 text-[10px] border-border"
                    >
                      {isTesting === 'llamacpp' ? "Testing..." : "Ping Service"}
                    </Button>
                    <Button 
                      onClick={handleSaveLlamacpp}
                      disabled={isSaving === 'llamacpp' || !tempLlamacppUrl}
                      className="h-8 text-[10px] font-bold"
                    >
                      {isSaving === 'llamacpp' ? "Applying..." : "Apply Config"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 bg-background border-t border-border flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest font-bold">Encrypted local secret vault active</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
