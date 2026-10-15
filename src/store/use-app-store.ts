
"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react"
import { type ComplexityMetrics, calculateComplexity } from "@/lib/complexity"
import { readDirectoryRecursive, buildTreeFromFileList } from "@/lib/browser-fs"
import { safeLocalStorage, safeSessionStorage } from "@/lib/safe-storage"
import { auth, githubProvider, isConfigured } from "@/lib/firebase"
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  signInAnonymously, 
  linkWithPopup,
  User 
} from "firebase/auth"

export type InferenceProvider = 'local' | 'anthropic' | 'openai' | 'gemini' | 'ollama' | 'llamacpp';
export type AppView = 'dashboard' | 'editor' | 'style_detective' | 'vault' | 'history' | 'shortcuts' | 'api_reference';

export type FileItem = {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileItem[];
  handle?: any; 
};

export interface AppState {
  user: User | null;
  loadingAuth: boolean;
  code: string;
  isDiffOpen: boolean;
  proposedCode: string;
  originalMetrics: ComplexityMetrics | null;
  proposedMetrics: ComplexityMetrics | null;
  inferenceProvider: InferenceProvider;
  keyStatus: Record<string, boolean>;
  ollamaConfig: { url: string; model: string; useDefaultUrl: boolean };
  llamacppConfig: { url: string };
  fileTree: FileItem[];
  activeFilePath: string | null;
  isFetchingTree: boolean;
  isDirty: boolean;
  workspaceRoot: string | null;
  isPickerDismissed: boolean;
  activeView: AppView;
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  isAnalysisPanelCollapsed: boolean;
  isBottomPanelCollapsed: boolean;
}

const AppContext = createContext<ReturnType<typeof useAppStoreLogic> | null>(null);

function useAppStoreLogic(initialCode: string = "") {
  const [state, setState] = useState<AppState>({
    user: null,
    loadingAuth: true,
    code: initialCode,
    isDiffOpen: false,
    proposedCode: "",
    originalMetrics: initialCode ? calculateComplexity(initialCode) : null,
    proposedMetrics: null,
    inferenceProvider: 'gemini',
    keyStatus: {},
    ollamaConfig: { url: "http://127.0.0.1:11434", model: "qwen2.5-coder", useDefaultUrl: true },
    llamacppConfig: { url: "http://127.0.0.1:8080" },
    fileTree: [],
    activeFilePath: null,
    isFetchingTree: false,
    isDirty: false,
    workspaceRoot: null,
    isPickerDismissed: false,
    activeView: 'editor',
    isMobileMenuOpen: false,
    isSidebarCollapsed: false,
    isAnalysisPanelCollapsed: false,
    isBottomPanelCollapsed: false,
  });

  const isInitialized = useRef(false);

  // Persistence Key Constants
  const STORAGE_KEYS = {
    WORKSPACE_ROOT: 'caramelpepper_workspace_root',
    ACTIVE_FILE: 'caramelpepper_active_file',
    PICKER_DISMISSED: 'caramelpepper_picker_dismissed',
    SIDEBAR_COLLAPSED: 'caramelpepper_sidebar_collapsed',
    ANALYSIS_COLLAPSED: 'caramelpepper_analysis_collapsed',
    BOTTOM_COLLAPSED: 'caramelpepper_bottom_collapsed'
  };

  const fetchWorkspaceTree = useCallback(async (path?: string) => {
    setState(prev => ({ ...prev, isFetchingTree: true }));
    try {
      const url = path ? `/api/workspace/tree?path=${encodeURIComponent(path)}` : '/api/workspace/tree';
      const response = await fetch(url);
      if (!response.ok) {
        setState(prev => ({ ...prev, isFetchingTree: false }));
        throw new Error("Failed to load workspace tree");
      }
      const data = await response.json();
      setState(prev => ({ ...prev, fileTree: data, isFetchingTree: false }));
    } catch (err) {
      setState(prev => ({ ...prev, isFetchingTree: false }));
      throw err;
    }
  }, []);

  const openFile = useCallback(async (path: string, handle?: any) => {
    try {
      let content = "";
      if (handle && typeof handle.getFile === 'function') {
        const file = await handle.getFile();
        content = await file.text();
      } else if (handle && typeof handle.text === 'function') {
        content = await handle.text();
      } else {
        const response = await fetch(`/api/workspace/read?path=${encodeURIComponent(path)}`);
        if (!response.ok) return;
        content = await response.text();
      }
      setState(prev => {
        // Persist active file to safeSessionStorage so it retains across refreshes in the tab, but releases when the tab is closed
        safeSessionStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, path);
        safeLocalStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE);
        
        return {
          ...prev,
          code: content,
          activeFilePath: path,
          originalMetrics: calculateComplexity(content),
          isDiffOpen: false,
          proposedCode: "",
          isDirty: false,
          activeView: 'editor'
        };
      });
    } catch (err) {
      console.error("[WORKSPACE]: Error reading file", err);
    }
  }, []);

  const openBuffer = useCallback((path: string, content: string) => {
    safeSessionStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, path);
    safeLocalStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE);
    setState(prev => ({
      ...prev,
      code: content,
      activeFilePath: path,
      originalMetrics: calculateComplexity(content),
      isDiffOpen: false,
      proposedCode: "",
      isDirty: false,
      activeView: 'editor'
    }));
  }, []);

  // Initial Load from Storage
  useEffect(() => {
    // Purge legacy active file from localStorage
    safeLocalStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE);

    const hasConsented = safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true';
    if (!hasConsented) return;

    const savedRoot = safeLocalStorage.getItem(STORAGE_KEYS.WORKSPACE_ROOT);
    // Active file is strictly session-based: retained on refresh, released on tab close
    const savedFile = safeSessionStorage.getItem(STORAGE_KEYS.ACTIVE_FILE);
    const savedPickerDismissed = safeLocalStorage.getItem(STORAGE_KEYS.PICKER_DISMISSED) === 'true';
    const savedSidebar = safeLocalStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
    const savedAnalysis = safeLocalStorage.getItem(STORAGE_KEYS.ANALYSIS_COLLAPSED) === 'true';
    const savedBottom = safeLocalStorage.getItem(STORAGE_KEYS.BOTTOM_COLLAPSED) === 'true';

    setState(prev => ({
      ...prev,
      workspaceRoot: savedRoot,
      isPickerDismissed: savedPickerDismissed,
      isSidebarCollapsed: savedSidebar,
      isAnalysisPanelCollapsed: savedAnalysis,
      isBottomPanelCollapsed: savedBottom
    }));

    if (savedRoot && !savedRoot.startsWith('browser://')) {
      fetchWorkspaceTree(savedRoot);
    }

    if (savedFile) {
      openFile(savedFile);
    }

    isInitialized.current = true;
  }, [fetchWorkspaceTree, openFile]);

  useEffect(() => {
    const currentAuth = auth;
    if (!currentAuth || !isConfigured) {
      setState(prev => ({ ...prev, loadingAuth: false }));
      return;
    }

    const unsubscribe = onAuthStateChanged(currentAuth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(currentAuth);
        } catch (error: any) {
          console.warn("[AUTH]: Anonymous entry failed.", error.message);
          setState(prev => ({ ...prev, loadingAuth: false }));
        }
      } else {
        setState(prev => ({ ...prev, user, loadingAuth: false }));
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    if (!auth || !isConfigured) {
      alert("CaramelPepper Cloud Error: Firebase is not configured. Please add your credentials to the .env file to enable GitHub Authentication.");
      return;
    }
    
    try {
      const currentUser = auth.currentUser;
      if (currentUser?.isAnonymous) {
        try {
          await linkWithPopup(currentUser, githubProvider);
        } catch (linkError: any) {
          if (linkError.message?.includes('Symbol.iterator')) {
            throw linkError;
          }
          if (linkError.code === 'auth/credential-already-in-use') {
            await signInWithPopup(auth, githubProvider);
          } else {
            throw linkError;
          }
        }
      } else {
        await signInWithPopup(auth, githubProvider);
      }
    } catch (error: any) {
      console.error("[AUTH]: Authentication failed.", error.message);
      if (error.message?.includes('Symbol.iterator')) {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        alert(`CaramelPepper: Authentication encountered an internal SDK error. This usually means the Firebase Auth configuration hasn't finished loading or your domain "${hostname}" is not authorized in the Firebase console.`);
        return;
      }
      if (error.code === 'auth/api-key-not-valid') {
        alert("CaramelPepper: The Firebase API Key in your .env file is invalid.");
      } else if (error.code !== 'auth/popup-closed-by-user') {
        alert(`Authentication error: ${error.message}`);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("[AUTH]: Logout failed", error);
    }
  }, []);

  const setWorkspaceRoot = useCallback(async (path: string) => {
    try {
      const response = await fetch('/api/workspace/set_root', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (response.ok) {
        await fetchWorkspaceTree(path);
        setState(prev => {
          if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
            safeLocalStorage.setItem(STORAGE_KEYS.WORKSPACE_ROOT, path);
            safeLocalStorage.setItem(STORAGE_KEYS.PICKER_DISMISSED, 'true');
          }
          return { ...prev, workspaceRoot: path, isPickerDismissed: true };
        });
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, [fetchWorkspaceTree]);

  const openLocalFile = useCallback(async () => {
    // 1. Try modern File System Access API (Chrome, Edge, Brave, Opera)
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const [handle] = await (window as any).showOpenFilePicker();
        const file = await handle.getFile();
        const content = await file.text();
        setState(prev => ({
          ...prev,
          code: content,
          activeFilePath: handle.name,
          originalMetrics: calculateComplexity(content),
          isDiffOpen: false,
          activeView: 'editor'
        }));
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return false; // user cancelled dialog
      }
    }

    // 2. Universal HTML5 fallback for ALL browsers (Firefox, Safari, Mobile, etc.)
    return new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.cpp,.hpp,.c,.h,.py,.ts,.tsx,.js,.jsx,.json,.txt,.md,.rs,.go,.java';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = async () => {
        const file = input.files?.[0];
        document.body.removeChild(input);
        if (!file) return resolve(false);
        try {
          const content = await file.text();
          setState(prev => ({
            ...prev,
            code: content,
            activeFilePath: file.name,
            originalMetrics: calculateComplexity(content),
            isDiffOpen: false,
            activeView: 'editor'
          }));
          resolve(true);
        } catch {
          resolve(false);
        }
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(false);
      };

      input.click();
    });
  }, []);

  const openBrowserWorkspace = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    // 1. Try File System Access API if available (Chrome, Edge, Brave, Opera)
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker();
        const tree = await readDirectoryRecursive(handle);
        setState(prev => {
          const root = `browser://${handle.name}`;
          if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
            safeLocalStorage.setItem(STORAGE_KEYS.WORKSPACE_ROOT, root);
            safeLocalStorage.setItem(STORAGE_KEYS.PICKER_DISMISSED, 'true');
          }
          return {
            ...prev,
            fileTree: tree,
            workspaceRoot: root,
            isPickerDismissed: true,
            activeView: 'editor'
          };
        });
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') return false; // user cancelled dialog
      }
    }

    // 2. Universal HTML5 directory picker for ALL browsers (Firefox, Safari, Chrome, Edge)
    return new Promise<boolean>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      // @ts-ignore
      input.webkitdirectory = true;
      // @ts-ignore
      input.directory = true;
      input.multiple = true;
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = () => {
        const files = input.files;
        document.body.removeChild(input);
        if (!files || files.length === 0) {
          return resolve(false);
        }

        const { rootName, tree } = buildTreeFromFileList(files);
        setState(prev => {
          const root = `browser://${rootName}`;
          if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
            safeLocalStorage.setItem(STORAGE_KEYS.WORKSPACE_ROOT, root);
            safeLocalStorage.setItem(STORAGE_KEYS.PICKER_DISMISSED, 'true');
          }
          return {
            ...prev,
            fileTree: tree,
            workspaceRoot: root,
            isPickerDismissed: true,
            activeView: 'editor'
          };
        });
        resolve(true);
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(false);
      };

      input.click();
    });
  }, []);

  const resetWorkspaceRoot = useCallback(() => {
    safeLocalStorage.removeItem(STORAGE_KEYS.WORKSPACE_ROOT);
    safeLocalStorage.removeItem(STORAGE_KEYS.PICKER_DISMISSED);
    setState(prev => ({ ...prev, workspaceRoot: null, fileTree: [], isPickerDismissed: false, activeView: 'editor' }));
  }, []);

  const dismissPicker = useCallback(() => {
    if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
      safeLocalStorage.setItem(STORAGE_KEYS.PICKER_DISMISSED, 'true');
    }
    setState(prev => ({ ...prev, isPickerDismissed: true }));
  }, []);

  const saveFileAs = useCallback(async (newPath: string) => {
    try {
      const response = await fetch('/api/workspace/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath, content: state.code })
      });
      if (response.ok) {
        setState(prev => {
          if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
            safeSessionStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, newPath);
          }
          return { 
            ...prev, 
            activeFilePath: newPath,
            isDirty: false 
          };
        });
        if (state.workspaceRoot) {
          fetchWorkspaceTree(state.workspaceRoot);
        }
      }
    } catch (err) {
      console.error("[WORKSPACE]: Save As failed", err);
    }
  }, [state.code, state.workspaceRoot, fetchWorkspaceTree]);

  const saveActiveFile = useCallback(async () => {
    if (!state.activeFilePath || state.activeFilePath.startsWith('untitled')) {
      const newName = prompt("Enter file path to save as:");
      if (newName) await saveFileAs(newName);
      return;
    }
    try {
      const response = await fetch('/api/workspace/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: state.activeFilePath, content: state.code })
      });
      if (response.ok) {
        setState(prev => ({ ...prev, isDirty: false }));
      }
    } catch (err) {
      console.error("[WORKSPACE]: Save failed", err);
    }
  }, [state.activeFilePath, state.code, saveFileAs]);

  const newFile = useCallback((extension: string = "ts") => {
    setState(prev => ({
      ...prev,
      code: "",
      activeFilePath: `untitled.${extension}`,
      originalMetrics: calculateComplexity(""),
      isDiffOpen: false,
      proposedCode: "",
      isDirty: false,
      activeView: 'editor'
    }));
  }, []);

  const closeActiveFile = useCallback(() => {
    safeSessionStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE);
    safeLocalStorage.removeItem(STORAGE_KEYS.ACTIVE_FILE);
    setState(prev => ({
      ...prev,
      code: "",
      activeFilePath: null,
      originalMetrics: null,
      isDiffOpen: false,
      proposedCode: "",
      isDirty: false,
    }));
  }, []);

  const setInferenceProvider = useCallback((provider: InferenceProvider) => {
    const isCloud = ['openai', 'anthropic', 'gemini'].includes(provider);
    if (isCloud && (!state.user || state.user.isAnonymous)) {
      return;
    }
    setState(prev => ({ ...prev, inferenceProvider: provider }));
  }, [state.user]);

  const saveApiKey = useCallback(async (provider: string, key: string) => {
    try {
      const response = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key })
      });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          keyStatus: { ...prev.keyStatus, [provider]: true }
        }));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const saveOllamaConfig = useCallback(async (url: string, model: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ollamaUrl: url, ollamaModel: model })
      });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          ollamaConfig: { ...prev.ollamaConfig, url, model }
        }));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const saveLlamacppConfig = useCallback(async (url: string) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llamacppUrl: url })
      });
      if (response.ok) {
        setState(prev => ({
          ...prev,
          llamacppConfig: { ...prev.llamacppConfig, url }
        }));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const openDiff = useCallback((refactoredCode: string) => {
    setState(prev => ({
      ...prev,
      proposedCode: refactoredCode,
      isDiffOpen: true,
      proposedMetrics: calculateComplexity(refactoredCode),
    }));
  }, []);

  const acceptRefactor = useCallback(() => {
    setState(prev => ({
      ...prev,
      code: prev.proposedCode,
      isDiffOpen: false,
      proposedCode: "",
      originalMetrics: prev.proposedMetrics,
      proposedMetrics: null,
      isDirty: true,
    }));
  }, []);

  const rejectRefactor = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDiffOpen: false,
      proposedCode: "",
      proposedMetrics: null,
    }));
  }, []);

  const setCode = useCallback((newCode: string) => {
    setState(prev => ({
      ...prev,
      code: newCode,
      originalMetrics: prev.activeFilePath ? calculateComplexity(newCode) : null,
      isDirty: true,
    }));
  }, []);

  const setActiveView = useCallback((view: AppView) => {
    setState(prev => ({ ...prev, activeView: view, isSidebarCollapsed: false }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => {
      if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
        safeLocalStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
      }
      return { ...prev, isSidebarCollapsed: collapsed };
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => {
      const next = !prev.isSidebarCollapsed;
      if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
        safeLocalStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      }
      return { ...prev, isSidebarCollapsed: next };
    });
  }, []);

  const setAnalysisPanelCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => {
      if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
        safeLocalStorage.setItem(STORAGE_KEYS.ANALYSIS_COLLAPSED, String(collapsed));
      }
      return { ...prev, isAnalysisPanelCollapsed: collapsed };
    });
  }, []);

  const toggleAnalysisPanel = useCallback(() => {
    setState(prev => {
      const next = !prev.isAnalysisPanelCollapsed;
      if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
        safeLocalStorage.setItem(STORAGE_KEYS.ANALYSIS_COLLAPSED, String(next));
      }
      return { ...prev, isAnalysisPanelCollapsed: next };
    });
  }, []);

  const setBottomPanelCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => {
      if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
        safeLocalStorage.setItem(STORAGE_KEYS.BOTTOM_COLLAPSED, String(collapsed));
      }
      return { ...prev, isBottomPanelCollapsed: collapsed };
    });
  }, []);

  const toggleBottomPanel = useCallback(() => {
    setState(prev => {
      const next = !prev.isBottomPanelCollapsed;
      if (safeLocalStorage.getItem('caramelpepper-cookie-consent') === 'true') {
        safeLocalStorage.setItem(STORAGE_KEYS.BOTTOM_COLLAPSED, String(next));
      }
      return { ...prev, isBottomPanelCollapsed: next };
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setState(prev => ({ ...prev, isMobileMenuOpen: !prev.isMobileMenuOpen }));
  }, []);

  const closeMobileMenu = useCallback(() => {
    setState(prev => ({ ...prev, isMobileMenuOpen: false }));
  }, []);

  return {
    ...state,
    login,
    logout,
    setCode,
    openDiff,
    acceptRefactor,
    rejectRefactor,
    setInferenceProvider,
    saveApiKey,
    saveOllamaConfig,
    saveLlamacppConfig,
    fetchWorkspaceTree,
    setWorkspaceRoot,
    openBrowserWorkspace,
    openLocalFile,
    resetWorkspaceRoot,
    dismissPicker,
    openFile,
    openBuffer,
    newFile,
    closeActiveFile,
    saveActiveFile,
    saveFileAs,
    setActiveView,
    setSidebarCollapsed,
    toggleSidebar,
    setAnalysisPanelCollapsed,
    toggleAnalysisPanel,
    setBottomPanelCollapsed,
    toggleBottomPanel,
    toggleMobileMenu,
    closeMobileMenu,
    isGuest: state.user?.isAnonymous || false
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStoreLogic("");
  return React.createElement(AppContext.Provider, { value: store }, children);
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
