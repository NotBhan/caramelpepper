"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Flame, 
  Terminal, 
  Cpu, 
  Cloud, 
  Settings, 
  X, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  Layout, 
  Code, 
  FolderOpen, 
  Save, 
  FilePlus, 
  Keyboard,
  PanelLeft
} from "lucide-react"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { type AppView, useAppStore } from "@/store/use-app-store"
import { useWorkspaceStore, type WorkspaceTab } from "@/store/useWorkspaceStore"
import { useModelStore } from "@/store/useModelStore"
import { useWorkspaceTransition } from "@/hooks/useWorkspaceTransition"
import { ComplexityGauge } from "@/components/dashboard/ComplexityGauge"
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel"
import { MaterialFileIcon } from "@/components/dashboard/MaterialIcon"
import { DashboardView } from "./DashboardView"
import { StyleDetectiveView } from "./StyleDetectiveView"
import { VaultView } from "./VaultView"
import { HistoryView } from "./HistoryView"
import { ShortcutsView } from "./ShortcutsView"
import { ApiReferenceView } from "./ApiReferenceView"

interface WorkspaceLayoutProps {
  onOpenSettings?: () => void;
  onNewFile?: () => void;
  sidebar?: React.ReactNode;
  editor?: React.ReactNode;
  refactor?: React.ReactNode;
  analysis?: React.ReactNode;
  bottom?: React.ReactNode;
  isDiffOpen?: boolean;
  activeView?: AppView;
}

export function WorkspaceLayout({
  onOpenSettings,
  onNewFile,
  sidebar,
  editor,
  refactor,
  analysis,
  bottom,
  isDiffOpen = false,
  activeView = "editor",
}: WorkspaceLayoutProps) {
  const store = useAppStore();
  const workspaceStore = useWorkspaceStore();
  const modelStore = useModelStore();
  const { returnToLanding } = useWorkspaceTransition();
  const [isMounted, setIsMounted] = useState(false);

  // Imperative panel handles for reliable expand/collapse
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    setIsMounted(true);
    if (modelStore.models.length === 0) {
      modelStore.fetchModels();
    }
  }, []);

  // Sync active file from useAppStore into useWorkspaceStore tabs
  useEffect(() => {
    if (store.activeFilePath) {
      const fileName = store.activeFilePath.split(/[/\\]/).pop() || store.activeFilePath;
      workspaceStore.openTab({
        path: store.activeFilePath,
        name: fileName,
        content: store.code,
      });
    }
  }, [store.activeFilePath]);

  // Sync active tab from workspaceStore into store if reloading with open tabs
  useEffect(() => {
    if (workspaceStore.activeTabId && !store.activeFilePath && !store.code) {
      const activeTab = workspaceStore.tabs.find(t => t.id === workspaceStore.activeTabId);
      if (activeTab) {
        if (activeTab.filePath) {
          store.openFile(activeTab.filePath);
        } else if (activeTab.content) {
          store.setCode(activeTab.content);
        }
      }
    }
  }, [workspaceStore.activeTabId, isMounted]);

  // Sync complexity metrics from originalMetrics to workspaceStore
  useEffect(() => {
    if (store.activeFilePath && store.originalMetrics) {
      workspaceStore.setMetrics({
        score: store.originalMetrics.maintainability,
        cyclomatic: store.originalMetrics.cyclomatic,
        cognitive: store.originalMetrics.cognitive,
        maintainability: store.originalMetrics.maintainability,
        risk: store.originalMetrics.risk,
      });
    } else {
      workspaceStore.setMetrics({
        score: null,
        cyclomatic: null,
        cognitive: null,
        maintainability: null,
        risk: null,
      });
    }
  }, [store.activeFilePath, store.originalMetrics]);

  // Sync editor code updates to active tab in workspaceStore
  useEffect(() => {
    if (workspaceStore.activeTabId && store.code !== undefined && store.activeFilePath) {
      workspaceStore.updateTabContent(workspaceStore.activeTabId, store.code);
    }
  }, [store.code, store.activeFilePath, workspaceStore.activeTabId]);

  // Panel toggle and expand handlers
  const handleToggleSidebar = () => {
    if (store.isSidebarCollapsed) {
      store.setSidebarCollapsed(false);
      sidebarPanelRef.current?.resize(18);
    } else {
      store.setSidebarCollapsed(true);
      sidebarPanelRef.current?.resize(3.5);
    }
  };

  const handleToggleBottom = () => {
    if (store.isBottomPanelCollapsed) {
      store.setBottomPanelCollapsed(false);
      bottomPanelRef.current?.expand(24);
    } else {
      store.setBottomPanelCollapsed(true);
      bottomPanelRef.current?.collapse();
    }
  };

  const handleToggleRight = () => {
    if (store.isAnalysisPanelCollapsed) {
      store.setAnalysisPanelCollapsed(false);
      rightPanelRef.current?.expand(22);
    } else {
      store.setAnalysisPanelCollapsed(true);
      rightPanelRef.current?.collapse();
    }
  };

  // Keyboard shortcuts for panel reopening: Ctrl+B, Ctrl+J, Ctrl+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (!isCtrlOrMeta) return;

      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      } else if (key === 'j') {
        e.preventDefault();
        handleToggleBottom();
      } else if (key === 'm') {
        e.preventDefault();
        handleToggleRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.isSidebarCollapsed, store.isBottomPanelCollapsed, store.isAnalysisPanelCollapsed]);

  // Sync imperative panel sizes when external state changes
  useEffect(() => {
    if (sidebarPanelRef.current) {
      if (store.isSidebarCollapsed) {
        sidebarPanelRef.current.resize(3.5);
      } else {
        const currentSize = sidebarPanelRef.current.getSize();
        if (currentSize < 10) {
          sidebarPanelRef.current.resize(18);
        }
      }
    }
  }, [store.isSidebarCollapsed]);

  useEffect(() => {
    if (bottomPanelRef.current) {
      if (store.isBottomPanelCollapsed) {
        bottomPanelRef.current.collapse();
      } else {
        if (bottomPanelRef.current.isCollapsed()) {
          bottomPanelRef.current.expand(24);
        }
      }
    }
  }, [store.isBottomPanelCollapsed]);

  useEffect(() => {
    if (rightPanelRef.current) {
      if (store.isAnalysisPanelCollapsed) {
        rightPanelRef.current.collapse();
      } else {
        if (rightPanelRef.current.isCollapsed()) {
          rightPanelRef.current.expand(22);
        }
      }
    }
  }, [store.isAnalysisPanelCollapsed]);

  const relativePath = useMemo(() => {
    if (!store.activeFilePath) return null;
    if (!store.workspaceRoot) return store.activeFilePath;
    return store.activeFilePath.replace(store.workspaceRoot, '').replace(/^[/\\]/, '');
  }, [store.activeFilePath, store.workspaceRoot]);

  const workspaceName = useMemo(() => {
    if (!store.workspaceRoot) return null;
    return store.workspaceRoot.split(/[/\\]/).pop() || "workspace";
  }, [store.workspaceRoot]);

  if (!isMounted) {
    return <div className="h-full w-full bg-[#09090B]" />;
  }

  // Handle switching active tab
  const handleSelectTab = (tab: WorkspaceTab) => {
    workspaceStore.setActiveTab(tab.id);
    if (tab.filePath && !tab.filePath.startsWith("untitled") && !tab.filePath.startsWith("scratchpad_")) {
      store.openFile(tab.filePath);
    } else {
      store.openBuffer(tab.filePath || tab.title, tab.content);
    }
  };

  // Handle closing a tab cleanly
  const handleCloseTab = (tabId: string) => {
    const isClosingActive = workspaceStore.activeTabId === tabId;
    const remainingTabs = workspaceStore.tabs.filter((t) => t.id !== tabId);

    workspaceStore.closeTab(tabId);

    if (isClosingActive) {
      if (remainingTabs.length > 0) {
        const closingIndex = workspaceStore.tabs.findIndex((t) => t.id === tabId);
        const nextIndex = Math.max(0, Math.min(closingIndex, remainingTabs.length - 1));
        const nextTab = remainingTabs[nextIndex];
        workspaceStore.setActiveTab(nextTab.id);
        if (nextTab.filePath && !nextTab.filePath.startsWith("untitled") && !nextTab.filePath.startsWith("scratchpad_")) {
          store.openFile(nextTab.filePath);
        } else {
          store.openBuffer(nextTab.filePath || nextTab.title, nextTab.content);
        }
      } else {
        store.closeActiveFile();
      }
    }
  };

  const handleNewTab = () => {
    if (onNewFile) {
      onNewFile();
    } else {
      const scratchIndex = workspaceStore.tabs.length + 1;
      const scratchName = `scratchpad_${scratchIndex}.cpp`;
      const scratchContent = `// Scratchpad ${scratchIndex}\n#include <iostream>\n\nint main() {\n    std::cout << "CaramelPepper Native" << std::endl;\n    return 0;\n}\n`;
      workspaceStore.openTab({
        path: scratchName,
        name: scratchName,
        content: scratchContent,
        language: "cpp"
      });
      store.openBuffer(scratchName, scratchContent);
    }
  };

  const isWideView = activeView !== 'editor';

  // Dedicated full-screen sub-views (Vault, History, etc.)
  if (isWideView) {
    return (
      <div className="h-full w-full flex flex-col bg-[#09090B] text-[#FAFAFA] overflow-hidden">
        <TopNavigationBar 
          onOpenSettings={onOpenSettings} 
          onNewFile={onNewFile}
          returnToLanding={returnToLanding}
          workspaceName={workspaceName}
          relativePath={relativePath}
          store={store}
          workspaceStore={workspaceStore}
          modelStore={modelStore}
          onToggleSidebar={handleToggleSidebar}
          onToggleBottom={handleToggleBottom}
          onToggleRight={handleToggleRight}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className="w-auto h-full shrink-0 border-r border-[#222226]">
            {sidebar}
          </div>
          <div className="flex-1 min-w-0 h-full overflow-hidden bg-[#09090B]">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'style_detective' && <StyleDetectiveView />}
            {activeView === 'vault' && <VaultView />}
            {activeView === 'history' && <HistoryView />}
            {activeView === 'shortcuts' && <ShortcutsView />}
            {activeView === 'api_reference' && <ApiReferenceView />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-[#09090B] text-[#FAFAFA] flex flex-col font-sans select-none">
      
      {/* 1. TOP NAVIGATION BAR */}
      <TopNavigationBar 
        onOpenSettings={onOpenSettings} 
        onNewFile={onNewFile}
        returnToLanding={returnToLanding}
        workspaceName={workspaceName}
        relativePath={relativePath}
        store={store}
        workspaceStore={workspaceStore}
        modelStore={modelStore}
        onToggleSidebar={handleToggleSidebar}
        onToggleBottom={handleToggleBottom}
        onToggleRight={handleToggleRight}
      />

      {/* 2. THREE-PANEL CORE WORKSPACE */}
      <div className="flex-1 min-h-0">
        <PanelGroup 
          id="root-layout-group"
          direction="horizontal" 
          autoSaveId="caramel-root-layout"
        >
          {/* LEFT: Sidebar Panel */}
          <Panel
            ref={sidebarPanelRef}
            id="sidebar-panel"
            order={1}
            defaultSize={store.isSidebarCollapsed ? 3.5 : 18}
            minSize={store.isSidebarCollapsed ? 3 : 12}
            maxSize={store.isSidebarCollapsed ? 4 : 30}
            className="bg-[#09090B] border-r border-[#222226]"
          >
            {sidebar}
          </Panel>

          {!store.isSidebarCollapsed && (
            <ResizeHandle direction="vertical" id="sidebar-resizer" />
          )}

          {/* CENTER: Editor & Split-Diff Stage */}
          <Panel 
            id="main-content-panel" 
            order={2} 
            defaultSize={store.isSidebarCollapsed ? (store.isAnalysisPanelCollapsed ? 97 : 76) : (store.isAnalysisPanelCollapsed ? 84 : 64)}
          >
            <div className="h-full w-full flex flex-row overflow-hidden relative">
              <div className="flex-1 min-w-0 h-full">
                <PanelGroup id="workspace-vertical-group" direction="vertical" autoSaveId="caramel-vertical-layout">
                  
                  {/* Upper: Tab Bar + Editor */}
                  <Panel id="editor-section-panel" order={1} defaultSize={store.isBottomPanelCollapsed ? 100 : 76} minSize={20}>
                    <div className="h-full flex flex-col bg-[#09090B] overflow-hidden">
                      
                      {/* MULTI-TAB BAR */}
                      <div className="h-9 w-full bg-[#09090B] border-b border-[#222226] flex items-center px-1 select-none overflow-x-auto scroll-thin shrink-0">
                        <div className="flex items-center h-full">
                          {workspaceStore.tabs.map((tab) => {
                            const isActive = workspaceStore.activeTabId === tab.id;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => handleSelectTab(tab)}
                                className={cn(
                                  "relative h-8 px-3.5 flex items-center gap-2 text-xs font-mono transition-colors group border-r border-[#222226]",
                                  isActive 
                                    ? "text-[#FAFAFA] bg-[#141416] font-medium" 
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#141416]/50"
                                )}
                              >
                                <MaterialFileIcon fileName={tab.title} className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[140px]">{tab.title}</span>

                                {tab.isDirty && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                )}

                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseTab(tab.id);
                                  }}
                                  className="p-0.5 rounded hover:bg-[#222226] text-zinc-500 hover:text-zinc-200 transition-colors ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </span>

                                {isActive && (
                                  <motion.div
                                    layoutId="activeTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E11D48]"
                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                  />
                                )}
                              </button>
                            );
                          })}

                          <button
                            onClick={handleNewTab}
                            title="New Scratchpad"
                            className="h-7 w-7 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-[#141416] transition-colors ml-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Monaco Editor / Split-Diff View Stage */}
                      <div className="flex-1 min-h-0 bg-[#09090B] relative">
                        <PanelGroup id="editor-diff-group" direction="horizontal" autoSaveId="caramel-editor-diff-layout">
                          <Panel id="primary-editor-panel" order={1} defaultSize={isDiffOpen ? 45 : 100} minSize={10}>
                            <div className="h-full bg-[#09090B]">
                              {editor}
                            </div>
                          </Panel>
                          
                          {isDiffOpen && <ResizeHandle direction="vertical" id="diff-resizer" />}

                          {isDiffOpen && (
                            <Panel id="diff-viewer-panel" order={2} defaultSize={55} minSize={15}>
                              <div className="h-full bg-[#09090B]">
                                {refactor}
                              </div>
                            </Panel>
                          )}
                        </PanelGroup>
                      </div>

                      {/* Collapsed Console Persistent Bar */}
                      {store.isBottomPanelCollapsed && (
                        <button
                          onClick={handleToggleBottom}
                          className="h-6 w-full bg-[#0d0d10] border-t border-[#222226] flex items-center justify-between px-3 select-none shrink-0 z-20 group cursor-pointer hover:bg-[#141416] transition-colors"
                          title="Expand pepper-shell console (Ctrl+J)"
                        >
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                            <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-200">pepper-shell console</span>
                            <span className="text-[9px] font-mono text-zinc-600 bg-[#18181B] px-1.5 py-0.5 rounded border border-zinc-800">
                              Ctrl+J
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 group-hover:text-zinc-200">
                            <span>Expand</span>
                            <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
                          </div>
                        </button>
                      )}

                    </div>
                  </Panel>

                  {!store.isBottomPanelCollapsed && (
                    <ResizeHandle direction="horizontal" id="bottom-panel-resizer" />
                  )}

                  {/* Lower: Collapsible Bottom Console */}
                  <Panel 
                    ref={bottomPanelRef}
                    id="bottom-console-panel" 
                    order={2} 
                    defaultSize={store.isBottomPanelCollapsed ? 0 : 24} 
                    minSize={store.isBottomPanelCollapsed ? 0 : 10} 
                    maxSize={60}
                    collapsible={true}
                    onCollapse={() => {
                      if (!store.isBottomPanelCollapsed) store.setBottomPanelCollapsed(true);
                    }}
                    onExpand={() => {
                      if (store.isBottomPanelCollapsed) store.setBottomPanelCollapsed(false);
                    }}
                  >
                    <div className="h-full w-full overflow-hidden bg-[#09090B] border-t border-[#222226] flex flex-col">
                      {bottom}
                    </div>
                  </Panel>

                </PanelGroup>
              </div>

              {/* Collapsed AST Metrics Persistent Rail */}
              {store.isAnalysisPanelCollapsed && (
                <button
                  onClick={handleToggleRight}
                  className="w-7 h-full bg-[#0d0d10] hover:bg-[#141416] border-l border-[#222226] flex flex-col items-center justify-between py-3 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer group shrink-0 select-none z-20"
                  title="Expand AST Metrics (Ctrl+M)"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#E11D48] transition-colors" />
                  <div className="[writing-mode:vertical-rl] rotate-180 flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 group-hover:text-zinc-200">
                      AST Metrics
                    </span>
                    {store.activeFilePath && workspaceStore.score !== null && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#18181B] text-[#E11D48] border border-zinc-800">
                        {workspaceStore.score}%
                      </span>
                    )}
                  </div>
                  <Layout className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </button>
              )}
            </div>
          </Panel>

          {!store.isAnalysisPanelCollapsed && (
            <ResizeHandle direction="vertical" id="right-panel-resizer" />
          )}

          {/* RIGHT: Analysis / Metrics Panel */}
          <Panel
            ref={rightPanelRef}
            id="right-analysis-panel"
            order={3}
            defaultSize={store.isAnalysisPanelCollapsed ? 0 : 22}
            minSize={store.isAnalysisPanelCollapsed ? 0 : 16}
            maxSize={store.isAnalysisPanelCollapsed ? 0 : 36}
            collapsible={true}
            onCollapse={() => {
              if (!store.isAnalysisPanelCollapsed) store.setAnalysisPanelCollapsed(true);
            }}
            onExpand={() => {
              if (store.isAnalysisPanelCollapsed) store.setAnalysisPanelCollapsed(false);
            }}
          >
            {!store.isAnalysisPanelCollapsed && (
              <div className="h-full flex flex-col bg-[#09090B]">
                <div className="h-8 w-full bg-[#0d0d10] border-b border-[#222226] flex items-center justify-between px-3 select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <Layout className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span className="text-[11px] font-mono font-medium text-zinc-300">AST Analysis & Metrics</span>
                  </div>
                  <button
                    onClick={handleToggleRight}
                    title="Minimize Metrics Panel (Ctrl+M)"
                    className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#18181B] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {analysis || <AnalysisPanel metrics={store.originalMetrics} style={null} isAnalyzing={false} />}
                </div>
              </div>
            )}
          </Panel>

        </PanelGroup>
      </div>

      {/* 3. MINIMAL STATUS BAR */}
      <footer className="h-6 w-full bg-[#09090B] border-t border-[#222226] px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleBottom} 
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Toggle Terminal & Console (Ctrl+J)"
          >
            <Terminal className="w-3 h-3 text-zinc-500" />
            <span>pepper-shell: native C++20</span>
          </button>
          <span className="text-zinc-700">&bull;</span>
          <span>Parse: 1.2ms</span>
          <span className="text-zinc-700">&bull;</span>
          <span>RAM: 1.4GB</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Local llama.cpp</span>
          <span className="text-zinc-700">&bull;</span>
          <span>UTF-8</span>
        </div>
      </footer>

    </div>
  )
}

interface TopNavigationBarProps {
  onOpenSettings?: () => void;
  onNewFile?: () => void;
  returnToLanding: () => void;
  workspaceName: string | null;
  relativePath: string | null;
  store: any;
  workspaceStore: any;
  modelStore: any;
  onToggleSidebar: () => void;
  onToggleBottom: () => void;
  onToggleRight: () => void;
}

function TopNavigationBar({
  onOpenSettings,
  onNewFile,
  returnToLanding,
  workspaceName,
  relativePath,
  store,
  workspaceStore,
  modelStore,
  onToggleSidebar,
  onToggleBottom,
  onToggleRight,
}: TopNavigationBarProps) {
  return (
    <header className="h-10 w-full bg-[#09090B] border-b border-[#222226] flex items-center px-3 z-50 shrink-0">
      
      {/* Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-1.5 mr-3">
        <button 
          onClick={onToggleSidebar}
          title={store.isSidebarCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
          className={cn(
            "p-1.5 rounded transition-colors",
            store.isSidebarCollapsed ? "text-zinc-500 hover:text-zinc-200" : "text-zinc-200 bg-[#141416]"
          )}
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </button>

        <div 
          onClick={returnToLanding}
          className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer hover:bg-[#141416] transition-colors"
          title="Return to Landing"
        >
          <Flame className="w-3.5 h-3.5 text-[#E11D48]" />
          <span className="font-semibold text-xs tracking-tight text-[#FAFAFA]">
            CaramelPepper
          </span>
        </div>
      </div>

      {/* Menubar Actions */}
      <Menubar className="bg-transparent border-none h-full shadow-none p-0">
        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-6 px-2 text-zinc-400 data-[state=open]:bg-[#141416] data-[state=open]:text-white focus:bg-[#141416] focus:text-white cursor-default transition-colors rounded">
            File
          </MenubarTrigger>
          <MenubarContent className="bg-[#141416] border-[#222226] text-[#FAFAFA]">
            <MenubarItem onClick={() => store.openLocalFile()} className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-white">
              <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
              Open File...
              <MenubarShortcut>Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onNewFile} className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-white">
              <FilePlus className="w-3.5 h-3.5 text-zinc-400" />
              New Scratchpad
            </MenubarItem>
            <MenubarItem onClick={() => store.openBrowserWorkspace()} className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-white">
              <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
              Open Workspace Folder...
              <MenubarShortcut>Ctrl+K Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-[#222226]" />
            <MenubarItem 
              onClick={store.saveActiveFile} 
              disabled={!store.activeFilePath}
              className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-white"
            >
              <Save className="w-3.5 h-3.5 text-zinc-400" />
              Save File
              <MenubarShortcut>Ctrl+S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-6 px-2 text-zinc-400 data-[state=open]:bg-[#141416] data-[state=open]:text-white focus:bg-[#141416] focus:text-white cursor-default transition-colors rounded">
            Selection
          </MenubarTrigger>
          <MenubarContent className="bg-[#141416] border-[#222226] text-[#FAFAFA]">
            <MenubarItem className="text-xs focus:bg-zinc-800 focus:text-white">Select All</MenubarItem>
            <MenubarItem className="text-xs focus:bg-zinc-800 focus:text-white">Expand Selection</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-6 px-2 text-zinc-400 data-[state=open]:bg-[#141416] data-[state=open]:text-white focus:bg-[#141416] focus:text-white cursor-default transition-colors rounded">
            Help
          </MenubarTrigger>
          <MenubarContent className="bg-[#141416] border-[#222226] text-[#FAFAFA]">
            <MenubarItem onClick={() => store.setActiveView('shortcuts')} className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-white">
              <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
              Shortcuts
            </MenubarItem>
            <MenubarItem onClick={() => store.setActiveView('api_reference')} className="flex items-center gap-2 text-xs focus:bg-zinc-800 focus:text-white">
              <Code className="w-3.5 h-3.5 text-zinc-400" />
              API Reference
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-2.5">
        
        {/* Breadcrumb with Material file icon */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#141416] border border-[#222226] text-xs font-mono">
          {workspaceName ? (
            <>
              <span className="text-zinc-400 font-medium">{workspaceName}</span>
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-200 truncate max-w-[160px] flex items-center gap-1">
                {relativePath ? (
                  <>
                    <MaterialFileIcon fileName={relativePath.split(/[/\\]/).pop() || ""} className="w-3.5 h-3.5" />
                    <span>{relativePath}</span>
                  </>
                ) : "root"}
              </span>
            </>
          ) : (
            <span className="text-zinc-400 truncate max-w-[160px] flex items-center gap-1.5">
              <MaterialFileIcon fileName={store.activeFilePath ? store.activeFilePath.split(/[/\\]/).pop() || "" : "scratchpad.cpp"} className="w-3.5 h-3.5" />
              <span>{store.activeFilePath ? store.activeFilePath.split(/[/\\]/).pop() : "scratchpad.cpp"}</span>
            </span>
          )}
        </div>

        {/* Minimal Complexity Indicator - only rendered when file is active and metrics exist */}
        {store.activeFilePath && workspaceStore.score !== null && (
          <div 
            onClick={onToggleRight}
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-mono cursor-pointer transition-colors",
              store.isAnalysisPanelCollapsed 
                ? "bg-[#141416] border-[#222226] text-zinc-400 hover:border-zinc-700" 
                : "bg-[#18181B] border-zinc-700 text-[#FAFAFA]"
            )}
            title="Toggle AST Metrics (Ctrl+M)"
          >
            <span className="text-zinc-500">AST:</span>
            <span className="text-zinc-200 font-medium">{workspaceStore.score}%</span>
          </div>
        )}

        {/* Model Badge */}
        <button
          onClick={() => modelStore.setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#141416] border border-[#222226] text-[11px] font-mono text-zinc-300 hover:border-zinc-700 transition-colors"
        >
          <Cpu className="w-3 h-3 text-zinc-400 shrink-0" />
          <span className="truncate max-w-[100px]">
            {modelStore.isLocalMode ? "Local C++20" : "Cloud"}
          </span>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 border-l border-[#222226] pl-2">
          <button 
            onClick={onToggleBottom}
            title={store.isBottomPanelCollapsed ? "Expand Terminal (Ctrl+J)" : "Minimize Terminal (Ctrl+J)"}
            className={cn(
              "p-1.5 rounded transition-colors",
              store.isBottomPanelCollapsed ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-200 bg-[#141416]"
            )}
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={onToggleRight}
            title={store.isAnalysisPanelCollapsed ? "Expand Metrics Panel (Ctrl+M)" : "Minimize Metrics Panel (Ctrl+M)"}
            className={cn(
              "p-1.5 rounded transition-colors",
              store.isAnalysisPanelCollapsed ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-200 bg-[#141416]"
            )}
          >
            <Layout className="w-3.5 h-3.5" />
          </button>

          {onOpenSettings && (
            <button 
              onClick={onOpenSettings}
              title="Settings"
              className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

function ResizeHandle({ 
  className, 
  direction = "vertical",
  id
}: { 
  className?: string;
  direction?: "horizontal" | "vertical";
  id: string;
}) {
  return (
    <PanelResizeHandle
      id={id}
      className={cn(
        "relative flex items-center justify-center bg-[#09090B] transition-colors hover:bg-zinc-700/50 group",
        direction === "vertical" ? "w-1 cursor-col-resize border-l border-[#222226]" : "h-1 cursor-row-resize border-t border-[#222226]",
        className
      )}
    >
      <div className={cn(
        "bg-[#27272A] group-hover:bg-zinc-400 transition-colors",
        direction === "vertical" ? "h-6 w-[1px]" : "w-6 h-[1px]"
      )} />
    </PanelResizeHandle>
  )
}