
"use client"

import React from "react"
import { 
  File, 
  FolderOpen, 
  Save, 
  FilePlus, 
  Keyboard,
  ShieldCheck,
  Code,
  FileOutput,
  Brain,
  Layout,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Terminal
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
import { useAppStore } from "@/store/use-app-store"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface MenuBarProps {
  onNewFile?: () => void;
}

export function MenuBar({ onNewFile }: MenuBarProps) {
  const store = useAppStore();

  const handleOpenLocalFile = async () => {
    await store.openLocalFile();
  }

  const handleOpenFolder = () => {
    store.resetWorkspaceRoot();
  }

  // Calculate relative path for breadcrumb display
  const relativePath = React.useMemo(() => {
    if (!store.activeFilePath) return null;
    if (!store.workspaceRoot) return store.activeFilePath;
    
    // Remove workspace root from path to show relative structure
    return store.activeFilePath.replace(store.workspaceRoot, '').replace(/^[/\\]/, '');
  }, [store.activeFilePath, store.workspaceRoot]);

  const workspaceName = React.useMemo(() => {
    if (!store.workspaceRoot) return null;
    return store.workspaceRoot.split(/[/\\]/).pop() || "workspace";
  }, [store.workspaceRoot]);

  return (
    <div className="h-8 w-full bg-[#333333] border-b border-[#3c3c3c] flex items-center px-2 z-50">
      <div className="flex items-center gap-2 mr-4 px-2">
        <Brain className="w-4 h-4 text-[#007acc]" />
        <span className="text-[11px] font-bold text-[#ffffff] uppercase tracking-tight">CaramelPepper</span>
      </div>

      <Menubar className="bg-transparent border-none h-full shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-7 px-3 text-[#cccccc] data-[state=open]:bg-[#2d2d2d] data-[state=open]:text-[#ffffff] focus:bg-[#2d2d2d] focus:text-[#ffffff] cursor-default">
            File
          </MenubarTrigger>
          <MenubarContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
            <MenubarItem onClick={handleOpenLocalFile} className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]">
              <File className="w-3.5 h-3.5" />
              Open Browser File...
              <MenubarShortcut>Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onNewFile} className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]">
              <FileOutput className="w-3.5 h-3.5" />
              New Scratchpad...
            </MenubarItem>
            <MenubarItem onClick={handleOpenFolder} className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]">
              <FolderOpen className="w-3.5 h-3.5" />
              Open Workspace Folder...
              <MenubarShortcut>Ctrl+K Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-[#3c3c3c]" />
            <MenubarItem 
              onClick={store.saveActiveFile} 
              disabled={!store.activeFilePath}
              className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]"
            >
              <Save className="w-3.5 h-3.5" />
              Save
              <MenubarShortcut>Ctrl+S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem 
              onClick={() => {
                const newName = prompt("Enter new file path:", store.activeFilePath || "");
                if (newName) store.saveFileAs(newName);
              }} 
              className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]"
            >
              <FilePlus className="w-3.5 h-3.5" />
              Save As...
              <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-7 px-3 text-[#cccccc] data-[state=open]:bg-[#2d2d2d] data-[state=open]:text-[#ffffff] focus:bg-[#2d2d2d] focus:text-[#ffffff] cursor-default">
            Selection
          </MenubarTrigger>
          <MenubarContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
            <MenubarItem className="text-xs focus:bg-[#007acc] focus:text-[#ffffff]">Select All</MenubarItem>
            <MenubarItem className="text-xs focus:bg-[#007acc] focus:text-[#ffffff]">Expand Selection</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-7 px-3 text-[#cccccc] data-[state=open]:bg-[#2d2d2d] data-[state=open]:text-[#ffffff] focus:bg-[#2d2d2d] focus:text-[#ffffff] cursor-default">
            Help
          </MenubarTrigger>
          <MenubarContent className="bg-[#252526] border-[#3c3c3c] text-[#cccccc]">
            <MenubarItem onClick={() => store.setActiveView('shortcuts')} className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]">
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarItem onClick={() => store.setActiveView('api_reference')} className="flex items-center gap-2 text-xs focus:bg-[#007acc] focus:text-[#ffffff]">
              <Code className="w-3.5 h-3.5" />
              API Reference
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="ml-auto flex items-center gap-3 pr-4">
        {store.isDirty && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#007acc] animate-pulse" />
            <span className="text-[9px] font-bold text-[#007acc] uppercase">Unsaved</span>
          </div>
        )}
        
        {/* Breadcrumb Display */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#3c3c3c] max-w-[240px] overflow-hidden">
          {workspaceName ? (
            <>
              <span className="text-[10px] font-bold text-[#007acc] uppercase tracking-tighter shrink-0">{workspaceName}</span>
              <ChevronRight className="w-2.5 h-2.5 text-[#858585] shrink-0" />
              <span className="text-[10px] text-[#cccccc] font-mono truncate">
                {relativePath || "IDE_ROOT"}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-[#858585] font-mono truncate italic">
              {store.activeFilePath || "IDLE_SCRATCHPAD"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2 border-l border-[#3c3c3c] pl-3">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={store.toggleBottomPanel}
                  className={cn(
                    "h-7 w-7 transition-colors",
                    store.isBottomPanelCollapsed ? "text-[#858585] hover:text-[#cccccc]" : "text-[#007acc] hover:bg-[#007acc]/10"
                  )}
                >
                  <Terminal className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#252526] border-[#3c3c3c] text-[10px]">
                {store.isBottomPanelCollapsed ? "Open pepper-shell" : "Minimize pepper-shell"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={store.toggleAnalysisPanel}
                  className={cn(
                    "h-7 w-7 transition-colors",
                    store.isAnalysisPanelCollapsed ? "text-[#858585] hover:text-[#cccccc]" : "text-[#007acc] hover:bg-[#007acc]/10"
                  )}
                >
                  <Layout className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#252526] border-[#3c3c3c] text-[10px]">
                {store.isAnalysisPanelCollapsed ? "Open Analysis Panel" : "Close Analysis Panel"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
