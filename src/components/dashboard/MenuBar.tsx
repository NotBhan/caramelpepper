
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
  Brain
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

      <div className="ml-auto flex items-center gap-4 pr-4">
        {store.isDirty && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#007acc] animate-pulse" />
            <span className="text-[9px] font-bold text-[#007acc] uppercase">Unsaved Changes</span>
          </div>
        )}
        <div className="text-[10px] text-[#858585] font-mono truncate max-w-[300px]">
          {store.activeFilePath || "No File Open"}
        </div>
      </div>
    </div>
  )
}
