
"use client"

import React from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"
import { type AppView, useAppStore } from "@/store/use-app-store"
import { DashboardView } from "./DashboardView"
import { StyleDetectiveView } from "./StyleDetectiveView"
import { VaultView } from "./VaultView"
import { HistoryView } from "./HistoryView"
import { ShortcutsView } from "./ShortcutsView"
import { ApiReferenceView } from "./ApiReferenceView"

interface WorkspaceLayoutProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  refactor: React.ReactNode;
  analysis: React.ReactNode;
  bottom: React.ReactNode;
  isDiffOpen?: boolean;
  activeView: AppView;
}

export function WorkspaceLayout({
  sidebar,
  editor,
  refactor,
  analysis,
  bottom,
  isDiffOpen = false,
  activeView
}: WorkspaceLayoutProps) {
  const store = useAppStore()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-full w-full bg-[#1e1e1e]" />
  }

  const isWideView = activeView === 'dashboard' || activeView === 'vault' || activeView === 'history' || activeView === 'shortcuts' || activeView === 'api_reference';

  if (isWideView) {
    return (
      <div className="h-full w-full flex bg-[#1e1e1e] overflow-hidden">
        <div className="w-auto h-full shrink-0 border-r border-[#3c3c3c]">
          {sidebar}
        </div>
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'style_detective' && <StyleDetectiveView />}
          {activeView === 'vault' && <VaultView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'shortcuts' && <ShortcutsView />}
          {activeView === 'api_reference' && <ApiReferenceView />}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden bg-[#1e1e1e] text-[#cccccc] flex flex-col">
      <PanelGroup 
        id="root-layout-group"
        direction="horizontal" 
        autoSaveId="octamind-root-layout"
      >
        <Panel
          id="sidebar-panel"
          order={1}
          defaultSize={store.isSidebarCollapsed ? 3 : 15}
          minSize={store.isSidebarCollapsed ? 3 : 10}
          maxSize={store.isSidebarCollapsed ? 3 : 25}
          className="bg-[#252526]"
        >
          {sidebar}
        </Panel>

        {!store.isSidebarCollapsed && <ResizeHandle direction="vertical" id="sidebar-resizer" />}

        <Panel id="main-content-panel" order={2} defaultSize={store.isSidebarCollapsed ? (store.isAnalysisPanelCollapsed ? 97 : 77) : (store.isAnalysisPanelCollapsed ? 82 : 65)}>
          <PanelGroup id="workspace-vertical-group" direction="vertical" autoSaveId="octamind-vertical-layout">
            <Panel id="editor-section-panel" order={1} defaultSize={80} minSize={20}>
              <PanelGroup id="editor-diff-group" direction="horizontal" autoSaveId="octamind-editor-diff-layout">
                <Panel id="primary-editor-panel" order={1} defaultSize={isDiffOpen ? 40 : 100} minSize={10}>
                  <div className="h-full">
                    {editor}
                  </div>
                </Panel>
                
                {isDiffOpen && <ResizeHandle direction="vertical" id="diff-resizer" />}

                {isDiffOpen && (
                  <Panel id="diff-viewer-panel" order={2} defaultSize={60} minSize={10}>
                    <div className="h-full">
                      {refactor}
                    </div>
                  </Panel>
                )}
              </PanelGroup>
            </Panel>

            <ResizeHandle direction="horizontal" id="bottom-panel-resizer" />

            <Panel id="bottom-console-panel" order={2} defaultSize={20} minSize={0} collapsible>
              <div className="h-full w-full overflow-hidden">
                {bottom}
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        {!store.isAnalysisPanelCollapsed && <ResizeHandle direction="vertical" id="right-panel-resizer" />}

        <Panel
          id="right-analysis-panel"
          order={3}
          defaultSize={store.isAnalysisPanelCollapsed ? 0 : 20}
          minSize={store.isAnalysisPanelCollapsed ? 0 : 15}
          maxSize={store.isAnalysisPanelCollapsed ? 0 : 30}
          collapsible={true}
          onCollapse={() => {
            if (!store.isAnalysisPanelCollapsed) store.toggleAnalysisPanel();
          }}
          onExpand={() => {
            if (store.isAnalysisPanelCollapsed) store.toggleAnalysisPanel();
          }}
        >
          {!store.isAnalysisPanelCollapsed && analysis}
        </Panel>
      </PanelGroup>
    </div>
  )
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
        "relative flex items-center justify-center bg-[#1e1e1e] transition-colors hover:bg-[#007acc]/50 group",
        direction === "vertical" ? "w-1 cursor-col-resize border-l border-[#3c3c3c]" : "h-1 cursor-row-resize border-t border-[#3c3c3c]",
        className
      )}
    >
      <div className={cn(
        "bg-[#3c3c3c] group-hover:bg-[#ffffff]/50 transition-colors",
        direction === "vertical" ? "h-8 w-[1px]" : "w-8 h-[1px]"
      )} />
    </PanelResizeHandle>
  )
}
