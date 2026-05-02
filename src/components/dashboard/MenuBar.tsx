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
  Flame,
  Layout,
  ChevronRight,
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

  const relativePath = React.useMemo(() => {
    if (!store.activeFilePath) return null;
    if (!store.workspaceRoot) return store.activeFilePath;
    return store.activeFilePath.replace(store.workspaceRoot, '').replace(/^[/\\]/, '');
  }, [store.activeFilePath, store.workspaceRoot]);

  const workspaceName = React.useMemo(() => {
    if (!store.workspaceRoot) return null;
    return store.workspaceRoot.split(/[/\\]/).pop() || "workspace";
  }, [store.workspaceRoot]);

  return (
    <div className="h-9 w-full bg-[#0a0a0a] border-b border-border flex items-center px-2 z-50">
      <div className="flex items-center gap-2 mr-4 px-2">
        <Flame className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-tight font-headline">CaramelPepper</span>
      </div>

      <Menubar className="bg-transparent border-none h-full shadow-none">
        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-7 px-3 text-muted-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground focus:bg-muted focus:text-foreground cursor-default transition-colors">
            File
          </MenubarTrigger>
          <MenubarContent className="bg-popover border-border text-foreground">
            <MenubarItem onClick={handleOpenLocalFile} className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground">
              <File className="w-3.5 h-3.5" />
              Open Browser File...
              <MenubarShortcut>Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onNewFile} className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground">
              <FileOutput className="w-3.5 h-3.5" />
              New Scratchpad...
            </MenubarItem>
            <MenubarItem onClick={handleOpenFolder} className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground">
              <FolderOpen className="w-3.5 h-3.5" />
              Open Workspace Folder...
              <MenubarShortcut>Ctrl+K Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator className="bg-border" />
            <MenubarItem 
              onClick={store.saveActiveFile} 
              disabled={!store.activeFilePath}
              className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground"
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
              className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground"
            >
              <FilePlus className="w-3.5 h-3.5" />
              Save As...
              <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-7 px-3 text-muted-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground focus:bg-muted focus:text-foreground cursor-default transition-colors">
            Selection
          </MenubarTrigger>
          <MenubarContent className="bg-popover border-border text-foreground">
            <MenubarItem className="text-xs focus:bg-primary focus:text-primary-foreground">Select All</MenubarItem>
            <MenubarItem className="text-xs focus:bg-primary focus:text-primary-foreground">Expand Selection</MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger className="text-[11px] h-7 px-3 text-muted-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground focus:bg-muted focus:text-foreground cursor-default transition-colors">
            Help
          </MenubarTrigger>
          <MenubarContent className="bg-popover border-border text-foreground">
            <MenubarItem onClick={() => store.setActiveView('shortcuts')} className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground">
              <Keyboard className="w-3.5 h-3.5" />
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarItem onClick={() => store.setActiveView('api_reference')} className="flex items-center gap-2 text-xs focus:bg-primary focus:text-primary-foreground">
              <Code className="w-3.5 h-3.5" />
              API Reference
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="ml-auto flex items-center gap-3 pr-4">
        {store.isDirty && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold text-primary uppercase">Unsaved</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-background border border-border max-w-[240px] overflow-hidden">
          {workspaceName ? (
            <>
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter shrink-0">{workspaceName}</span>
              <ChevronRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-foreground font-mono truncate">
                {relativePath || "IDE_ROOT"}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground font-mono truncate italic">
              {store.activeFilePath || "IDLE_SCRATCHPAD"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2 border-l border-border pl-3">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={store.toggleBottomPanel}
                  className={cn(
                    "h-7 w-7 transition-colors",
                    store.isBottomPanelCollapsed ? "text-muted-foreground hover:text-foreground" : "text-primary hover:bg-primary/10"
                  )}
                >
                  <Terminal className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover border-border text-[10px]">
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
                    store.isAnalysisPanelCollapsed ? "text-muted-foreground hover:text-foreground" : "text-primary hover:bg-primary/10"
                  )}
                >
                  <Layout className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover border-border text-[10px]">
                {store.isAnalysisPanelCollapsed ? "Open Analysis Panel" : "Close Analysis Panel"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
