
"use client"

import React from "react"
import { 
  ShieldCheck, 
  LayoutGrid, 
  FileCode, 
  Search, 
  Database, 
  History, 
  Settings, 
  RefreshCw, 
  FolderOpen, 
  Fingerprint,
  User as UserIcon,
  LogOut,
  Github,
  UserCircle,
  Brain,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FileExplorer } from "./FileExplorer"
import { Button } from "@/components/ui/button"
import { type AppView, useAppStore } from "@/store/use-app-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ActivityIconProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const ActivityIcon = ({ icon: Icon, label, active, onClick }: ActivityIconProps) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "w-full aspect-square flex items-center justify-center transition-all relative group",
            active 
              ? "text-[#ffffff]" 
              : "text-[#858585] hover:text-[#cccccc]"
          )}
        >
          {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#ffffff]" />}
          <Icon className="w-6 h-6" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-[#252526] border-[#3c3c3c] text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

interface SidebarProps {
  onOpenSettings: () => void;
  activeProvider: string;
  fileTree: any[];
  activeFilePath: string | null;
  isFetchingTree: boolean;
  onRefreshTree: () => void;
  onOpenFile: (path: string) => void;
  workspaceRoot: string | null;
  onOpenWorkspace: () => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

export function Sidebar({ 
  onOpenSettings, 
  activeProvider,
  fileTree,
  activeFilePath,
  isFetchingTree,
  onRefreshTree,
  onOpenFile,
  workspaceRoot,
  onOpenWorkspace,
  activeView,
  setActiveView
}: SidebarProps) {
  const store = useAppStore();

  const isGuest = store.user?.isAnonymous;

  const handleActivityIconClick = (view: AppView) => {
    if (store.activeView === view) {
      store.toggleSidebar();
    } else {
      setActiveView(view);
    }
    store.closeMobileMenu();
  };

  return (
    <div className={cn(
      "h-full flex overflow-hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 bg-[#252526]",
      store.isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Activity Bar */}
      <div className="w-12 bg-[#333333] flex flex-col items-center py-2 shrink-0 border-r border-[#1e1e1e]">
        <ActivityIcon 
          icon={LayoutGrid} 
          label="Dashboard" 
          active={activeView === 'dashboard'} 
          onClick={() => handleActivityIconClick('dashboard')} 
        />
        <ActivityIcon 
          icon={FileCode} 
          label="Explorer" 
          active={activeView === 'editor'} 
          onClick={() => handleActivityIconClick('editor')} 
        />
        <ActivityIcon 
          icon={Search} 
          label="Style Detective" 
          active={activeView === 'style_detective'} 
          onClick={() => handleActivityIconClick('style_detective')} 
        />
        <ActivityIcon 
          icon={Database} 
          label="Vault" 
          active={activeView === 'vault'} 
          onClick={() => handleActivityIconClick('vault')} 
        />
        <ActivityIcon 
          icon={History} 
          label="Refactor History" 
          active={activeView === 'history'} 
          onClick={() => handleActivityIconClick('history')} 
        />
        
        <div className="mt-auto w-full flex flex-col items-center gap-2">
          <ActivityIcon 
            icon={Settings} 
            label="Settings" 
            onClick={() => { onOpenSettings(); store.closeMobileMenu(); }} 
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full aspect-square flex items-center justify-center text-[#858585] hover:text-[#cccccc]">
                {store.user && !isGuest ? (
                  <Avatar className="w-7 h-7 border border-[#3c3c3c]">
                    <AvatarImage src={store.user.photoURL || undefined} />
                    <AvatarFallback className="bg-[#1e1e1e] text-[10px] text-[#ffffff]">
                      {store.user.displayName?.[0] || store.user.email?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserCircle className={cn("w-6 h-6", isGuest && "text-amber-500/70")} />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="end" className="w-64 bg-[#252526] border-[#3c3c3c] p-2 text-[#cccccc]">
              {store.user && !isGuest ? (
                <div className="space-y-2">
                  <div className="px-2 py-1.5 border-b border-[#3c3c3c]">
                    <p className="text-xs font-bold text-[#ffffff] truncate">{store.user.displayName || "User"}</p>
                    <p className="text-[10px] text-[#858585] truncate">{store.user.email}</p>
                  </div>
                  <button 
                    onClick={() => { store.logout(); store.closeMobileMenu(); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-[#3c3c3c] rounded-sm transition-colors text-red-400"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-[#ffffff]">
                      {isGuest ? "Guest Session Active" : "Sign In Required"}
                    </p>
                    <p className="text-[11px] text-[#858585] leading-relaxed">
                      {isGuest 
                        ? "You are using a temporary session. Your API keys and history will be lost if you clear your browser data."
                        : "Sign in to isolate your data and sync settings across devices."}
                    </p>
                  </div>
                  <Button 
                    onClick={() => { store.login(); store.closeMobileMenu(); }}
                    className="w-full h-9 bg-[#ffffff] text-[#000000] hover:bg-[#cccccc] text-xs font-bold gap-2"
                  >
                    <Github className="w-3.5 h-3.5" />
                    {isGuest ? "Upgrade with GitHub" : "Sign in with GitHub"}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Sidebar Panel */}
      {!store.isSidebarCollapsed && (
        <aside className={cn(
          "flex-1 flex flex-col bg-[#252526] transition-all duration-200 overflow-hidden",
          activeView === 'dashboard' || activeView === 'vault' || activeView === 'history' ? "w-0 opacity-0" : "w-[240px] opacity-100"
        )}>
          <div className="p-3 border-b border-[#3c3c3c] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#858585] uppercase tracking-wider">
              {activeView === 'editor' ? 'Explorer' : 'Detective'}
            </span>
            <div className="flex items-center gap-1">
              {activeView === 'editor' && workspaceRoot && (
                <button 
                  onClick={onRefreshTree}
                  className="text-[#858585] hover:text-[#ffffff] transition-colors p-1"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isFetchingTree && "animate-spin")} />
                </button>
              )}
              <button 
                onClick={store.toggleSidebar}
                className="text-[#858585] hover:text-[#ffffff] transition-colors p-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeView === 'editor' && (
              <div className="py-2">
                {workspaceRoot ? (
                  <FileExplorer 
                    items={fileTree} 
                    activePath={activeFilePath} 
                    onFileClick={onOpenFile} 
                  />
                ) : (
                  <div className="py-8 px-4 text-center space-y-4">
                    <p className="text-[11px] text-[#858585] leading-relaxed">
                      No workspace opened. You are in Single File Mode.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onOpenWorkspace}
                      className="h-7 text-[10px] border-[#3c3c3c] text-[#cccccc] hover:bg-[#2a2d2e] w-full flex items-center justify-center gap-2 px-1 overflow-hidden"
                    >
                      <FolderOpen className="w-3 h-3 shrink-0" />
                      <span className="truncate">Open Workspace</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeView === 'style_detective' && (
              <div className="p-4 text-center space-y-4">
                <Fingerprint className="w-8 h-8 text-[#007acc] mx-auto opacity-50" />
                <p className="text-[11px] text-[#858585]">Configure your repository-wide style preferences to guide the refactoring engine.</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#3c3c3c]">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-[#1e1e1e] rounded-sm border border-[#3c3c3c]">
              <Brain className="w-3.5 h-3.5 text-[#007acc]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-[#ffffff] leading-none uppercase">CaramelPepper</span>
                <span className="text-[8px] text-[#858585] font-mono">Engine Active</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Backdrop for mobile */}
      {store.isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[-1] md:hidden" 
          onClick={store.closeMobileMenu}
        />
      )}
    </div>
  )
}
