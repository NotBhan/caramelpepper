import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeSessionStorage } from "@/lib/safe-storage";

export interface WorkspaceTab {
  id: string;
  title: string;
  filePath: string | null;
  content: string;
  language: string;
  isDirty: boolean;
}

export interface StyleRuleItem {
  key: string;
  label: string;
  value: string;
}

export interface RagMemorySnippet {
  id: string;
  fileSource: string;
  astPattern: string;
  similarity: number;
  snippet: string;
}

export type WorkspaceViewMode = 
  | "editor" 
  | "diff" 
  | "style_detective" 
  | "vault" 
  | "history" 
  | "shortcuts" 
  | "api_reference";

export interface WorkspaceStoreState {
  // Tabs
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  openTab: (file: { path: string; name: string; content?: string; language?: string }) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  markTabClean: (tabId: string) => void;

  // View & Layout State
  viewMode: WorkspaceViewMode;
  setViewMode: (mode: WorkspaceViewMode) => void;
  isDiffOpen: boolean;
  setDiffOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  isMetricsPanelCollapsed: boolean;
  isBottomTerminalCollapsed: boolean;
  toggleSidebar: () => void;
  toggleMetricsPanel: () => void;
  toggleBottomTerminal: () => void;

  // Complexity Metrics (null when no file is open)
  score: number | null;
  cyclomatic: number | null;
  cognitive: number | null;
  maintainability: number | null;
  risk: "low" | "moderate" | "high" | "critical" | null;
  setMetrics: (metrics: Partial<{ 
    score: number | null; 
    cyclomatic: number | null; 
    cognitive: number | null; 
    maintainability: number | null; 
    risk: "low" | "moderate" | "high" | "critical" | null;
  }>) => void;

  // Style Detective
  styleRules: StyleRuleItem[];
  setStyleRules: (rules: StyleRuleItem[]) => void;

  // RAG Memory Vault
  ragSnippets: RagMemorySnippet[];
  setRagSnippets: (snippets: RagMemorySnippet[]) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>()(
  persist(
    (set, get) => ({
      // Clean initial state with zero preopened files
      tabs: [],
      activeTabId: null,

  openTab: (file) => {
    const { tabs } = get();
    const existing = tabs.find((t) => t.id === file.path || t.filePath === file.path || t.title === file.name);

    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }

    const newTab: WorkspaceTab = {
      id: file.path || file.name,
      title: file.name,
      filePath: file.path,
      content: file.content || "",
      language: file.language || (file.name.endsWith(".cpp") ? "cpp" : file.name.endsWith(".py") ? "python" : "typescript"),
      isDirty: false,
    };

    set({
      tabs: [...tabs, newTab],
      activeTabId: newTab.id,
    });
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    let nextActiveId = activeTabId;

    if (activeTabId === tabId) {
      const closingIndex = tabs.findIndex((t) => t.id === tabId);
      if (nextTabs.length > 0) {
        const newIndex = Math.min(closingIndex, nextTabs.length - 1);
        nextActiveId = nextTabs[newIndex].id;
      } else {
        nextActiveId = null;
      }
    }

    set({
      tabs: nextTabs,
      activeTabId: nextActiveId,
    });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  updateTabContent: (tabId, content) => {
    const { tabs } = get();
    set({
      tabs: tabs.map((t) => (t.id === tabId ? { ...t, content, isDirty: true } : t)),
    });
  },

  markTabClean: (tabId) => {
    const { tabs } = get();
    set({
      tabs: tabs.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t)),
    });
  },

  // View & Layout
  viewMode: "editor",
  setViewMode: (mode) => set({ viewMode: mode }),
  isDiffOpen: false,
  setDiffOpen: (open) => set({ isDiffOpen: open }),
  isSidebarCollapsed: false,
  isMetricsPanelCollapsed: false,
  isBottomTerminalCollapsed: false,

  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  toggleMetricsPanel: () => set((s) => ({ isMetricsPanelCollapsed: !s.isMetricsPanelCollapsed })),
  toggleBottomTerminal: () => set((s) => ({ isBottomTerminalCollapsed: !s.isBottomTerminalCollapsed })),

  // Metrics (Clean default: null until an active file is analyzed)
  score: null,
  cyclomatic: null,
  cognitive: null,
  maintainability: null,
  risk: null,
  setMetrics: (metrics) => set((s) => ({ ...s, ...metrics })),

  // Style Detective Rules
  styleRules: [
    { key: "naming", label: "Naming Convention", value: "snake_case" },
    { key: "indent", label: "Indentation", value: "4 spaces" },
    { key: "braces", label: "Brace Style", value: "OTBS (1TBS)" },
    { key: "quotes", label: "String Quotes", value: "double quotes" },
  ],
  setStyleRules: (rules) => set({ styleRules: rules }),

  // RAG Memory Vault
  ragSnippets: [
    {
      id: "rag-1",
      fileSource: "backend/src/ai/InferenceFactory.cpp",
      astPattern: "std::unique_ptr factory dispatch",
      similarity: 0.94,
      snippet: "std::unique_ptr<IInferenceEngine> create(const std::string& provider);",
    },
    {
      id: "rag-2",
      fileSource: "backend/include/ai/model_manager.hpp",
      astPattern: "std::ranges::filter view pipelines",
      similarity: 0.89,
      snippet: "auto valid = models | std::views::filter(&Model::isLocal);",
    },
  ],
  setRagSnippets: (snippets) => set({ ragSnippets: snippets }),
}),
    {
      name: "caramelpepper-workspace-store",
      storage: createJSONStorage(() => safeSessionStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        viewMode: state.viewMode,
        isDiffOpen: state.isDiffOpen,
        isSidebarCollapsed: state.isSidebarCollapsed,
        isMetricsPanelCollapsed: state.isMetricsPanelCollapsed,
        isBottomTerminalCollapsed: state.isBottomTerminalCollapsed,
        score: state.score,
        cyclomatic: state.cyclomatic,
        cognitive: state.cognitive,
        maintainability: state.maintainability,
        risk: state.risk,
      }),
    }
  )
);
