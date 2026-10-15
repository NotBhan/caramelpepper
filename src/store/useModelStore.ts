import { create } from 'zustand';

export type ProviderType = 'local' | 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export type KeyValidationStatus = 
  | 'IDLE' 
  | 'VALIDATING' 
  | 'VALID' 
  | 'INVALID_KEY' 
  | 'EXPIRED' 
  | 'QUOTA_EXCEEDED' 
  | 'NETWORK_ERROR';

export interface ModelInfo {
  id: string;
  name: string;
  filename: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  ramRequiredMB: number;
  quantization: string;
  status: 'Loaded' | 'Available' | 'Error';
  isLocal: boolean;
  provider: ProviderType | string;
  description: string;
}

export interface KeyStatusInfo {
  status: KeyValidationStatus;
  configured: boolean;
  maskedKey: string;
  message?: string;
  lastChecked?: number;
}

export interface ModelStoreState {
  models: ModelInfo[];
  activeModelId: string;
  activeModel: ModelInfo | null;
  isLocalMode: boolean;
  isLoadingModels: boolean;
  isHotSwapping: boolean;
  swapError: string | null;
  
  // API Key Management
  keyStatuses: Record<string, KeyStatusInfo>;
  isValidatingKey: Record<string, boolean>;

  // Fallback Logic
  isAutoFallbackEnabled: boolean;
  fallbackActive: boolean;
  fallbackReason: string | null;

  // Drawer / Modal View
  isDrawerOpen: boolean;

  // Actions
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string, provider?: string) => Promise<boolean>;
  validateKey: (provider: string, key: string) => Promise<KeyValidationStatus>;
  fetchKeyStatuses: () => Promise<void>;
  setIsDrawerOpen: (open: boolean) => void;
  toggleAutoFallback: (enabled?: boolean) => void;
  resetFallback: () => void;
  unloadModel: () => Promise<void>;
}

export const useModelStore = create<ModelStoreState>((set, get) => ({
  models: [],
  activeModelId: 'qwen2.5-coder-1.5b-instruct-q4_k_m',
  activeModel: null,
  isLocalMode: true,
  isLoadingModels: false,
  isHotSwapping: false,
  swapError: null,

  keyStatuses: {
    openai: { status: 'IDLE', configured: false, maskedKey: '' },
    anthropic: { status: 'IDLE', configured: false, maskedKey: '' },
    gemini: { status: 'IDLE', configured: false, maskedKey: '' },
    openrouter: { status: 'IDLE', configured: false, maskedKey: '' },
  },
  isValidatingKey: {},

  isAutoFallbackEnabled: true,
  fallbackActive: false,
  fallbackReason: null,

  isDrawerOpen: false,

  fetchModels: async () => {
    set({ isLoadingModels: true });
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data: ModelInfo[] = await res.json();
        const currentActiveId = get().activeModelId;
        const matched = data.find(m => m.id === currentActiveId) || data[0] || null;

        set({
          models: data,
          activeModel: matched,
          activeModelId: matched ? matched.id : currentActiveId,
          isLocalMode: matched ? matched.isLocal : true,
          isLoadingModels: false,
        });
      } else {
        set({ isLoadingModels: false });
      }
    } catch (err) {
      console.warn('[ModelStore]: Failed to fetch models:', err);
      set({ isLoadingModels: false });
    }
  },

  selectModel: async (modelId: string, provider?: string) => {
    const state = get();
    const targetModel = state.models.find(m => m.id === modelId);
    const targetProvider = provider || targetModel?.provider || (targetModel?.isLocal ? 'local' : 'openai');

    set({ isHotSwapping: true, swapError: null });

    try {
      const res = await fetch('/api/models/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, provider: targetProvider }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const isLocal = Boolean(data.isLocal ?? (targetProvider === 'local'));
        const updatedModels = state.models.map(m => ({
          ...m,
          status: m.id === modelId ? ('Loaded' as const) : ('Available' as const),
        }));

        const updatedActive = updatedModels.find(m => m.id === modelId) || targetModel || null;

        set({
          activeModelId: modelId,
          activeModel: updatedActive,
          isLocalMode: isLocal,
          isHotSwapping: false,
          models: updatedModels,
          swapError: null,
          fallbackActive: false,
          fallbackReason: null,
        });
        return true;
      } else {
        throw new Error(data.error || 'Failed to switch model.');
      }
    } catch (err: any) {
      console.error('[ModelStore]: Hot swap error:', err);

      // Trigger Graceful Fallback if Enabled
      if (state.isAutoFallbackEnabled) {
        console.warn('[ModelStore]: Initiating automated fallback routine...');
        
        // Find alternative model (cloud if local failed, or fallback local)
        const altModel = state.models.find(m => m.id !== modelId && (!targetModel?.isLocal || !m.isLocal));
        const fallbackTarget = altModel || state.models[0];

        if (fallbackTarget && fallbackTarget.id !== modelId) {
          set({
            isHotSwapping: false,
            swapError: err.message,
            fallbackActive: true,
            fallbackReason: `Model ${modelId} failed to load. Gracefully switched to ${fallbackTarget.name}.`,
            activeModelId: fallbackTarget.id,
            activeModel: fallbackTarget,
            isLocalMode: fallbackTarget.isLocal,
          });
          return false;
        }
      }

      set({
        isHotSwapping: false,
        swapError: err.message || 'Model load failure.',
      });
      return false;
    }
  },

  validateKey: async (provider: string, key: string) => {
    set(prev => ({
      isValidatingKey: { ...prev.isValidatingKey, [provider]: true },
      keyStatuses: {
        ...prev.keyStatuses,
        [provider]: {
          ...(prev.keyStatuses[provider] || { configured: false, maskedKey: '' }),
          status: 'VALIDATING',
        },
      },
    }));

    try {
      const res = await fetch('/api/keys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key }),
      });

      const data = await res.json();
      const status: KeyValidationStatus = data.status || (res.ok ? 'VALID' : 'INVALID_KEY');

      set(prev => ({
        isValidatingKey: { ...prev.isValidatingKey, [provider]: false },
        keyStatuses: {
          ...prev.keyStatuses,
          [provider]: {
            status,
            configured: status === 'VALID',
            maskedKey: data.maskedKey || prev.keyStatuses[provider]?.maskedKey || '',
            message: data.message || '',
            lastChecked: Date.now(),
          },
        },
      }));

      // If valid, refresh model list so cloud models appear immediately
      if (status === 'VALID') {
        get().fetchModels();
      }

      return status;
    } catch (err: any) {
      set(prev => ({
        isValidatingKey: { ...prev.isValidatingKey, [provider]: false },
        keyStatuses: {
          ...prev.keyStatuses,
          [provider]: {
            status: 'NETWORK_ERROR',
            configured: false,
            maskedKey: prev.keyStatuses[provider]?.maskedKey || '',
            message: 'Network verification failed.',
            lastChecked: Date.now(),
          },
        },
      }));
      return 'NETWORK_ERROR';
    }
  },

  fetchKeyStatuses: async () => {
    try {
      const res = await fetch('/api/keys/status');
      if (res.ok) {
        const data = await res.json();
        set(prev => {
          const nextStatuses: Record<string, KeyStatusInfo> = { ...prev.keyStatuses };
          for (const [p, info] of Object.entries<any>(data)) {
            nextStatuses[p] = {
              status: info.configured ? 'VALID' : 'IDLE',
              configured: Boolean(info.configured),
              maskedKey: info.maskedKey || '',
              message: info.configured ? 'Configured in secure vault' : 'Unconfigured',
              lastChecked: Date.now(),
            };
          }
          return { keyStatuses: nextStatuses };
        });
      }
    } catch (err) {
      console.warn('[ModelStore]: Failed to fetch key statuses:', err);
    }
  },

  setIsDrawerOpen: (open: boolean) => set({ isDrawerOpen: open }),

  toggleAutoFallback: (enabled?: boolean) =>
    set(state => ({
      isAutoFallbackEnabled: enabled !== undefined ? enabled : !state.isAutoFallbackEnabled,
    })),

  resetFallback: () => set({ fallbackActive: false, fallbackReason: null }),

  unloadModel: async () => {
    try {
      await fetch('/api/models/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: 'none', provider: 'unload' }),
      });
      set(state => ({
        isModelLoaded: false,
        activeModel: null,
        models: state.models.map(m => ({ ...m, status: 'Available' })),
      }));
    } catch (err) {
      console.warn('[ModelStore]: Failed to unload model:', err);
    }
  },
}));
