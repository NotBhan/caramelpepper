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
  Flame,
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
            "w-full aspect-square flex items-center justify-center transition-all relative group h-12",
            active 
              ? "text-foreground bg-primary/10" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          )}
        >
          {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
          <Icon className={cn("w-5 h-5", active && "text-primary")} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-popover border-border text-xs">
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
      "h-full flex overflow-hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 bg-card",
      store.isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Activity Bar */}
      <div className="w-12 bg-secondary flex flex-col items-center py-0 shrink-0 border-r border-border">
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
        
        <div className="mt-auto w-full flex flex-col items-center py-2">
          <ActivityIcon 
            icon={Settings} 
            label="Settings" 
            onClick={() => { onOpenSettings(); store.closeMobileMenu(); }} 
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full aspect-square flex items-center justify-center text-muted-foreground hover:text-foreground h-12">
                {store.user && !isGuest ? (
                  <Avatar className="w-7 h-7 border border-border">
                    <AvatarImage src={store.user.photoURL || undefined} />
                    <AvatarFallback className="bg-background text-[10px] text-foreground">
                      {store.user.displayName?.[0] || store.user.email?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <UserCircle className={cn("w-6 h-6", isGuest && "text-accent")} />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="end" className="w-64 bg-popover border-border p-2 text-foreground">
              {store.user && !isGuest ? (
                <div className="space-y-2">
                  <div className="px-2 py-1.5 border-b border-border">
                    <p className="text-xs font-bold text-foreground truncate">{store.user.displayName || "User"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{store.user.email}</p>
                  </div>
                  <button 
                    onClick={() => { store.logout(); store.closeMobileMenu(); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-muted rounded-sm transition-colors text-destructive"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <p className="text-[12px] font-bold text-foreground">
                      {isGuest ? "Guest Session Active" : "Sign In Required"}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {isGuest 
                        ? "You are using a temporary session. Your API keys and history will be lost if you clear your browser data."
                        : "Sign in to isolate your data and sync settings across devices."}
                    </p>
                  </div>
                  <Button 
                    onClick={() => { store.login(); store.closeMobileMenu(); }}
                    className="w-full h-9 bg-foreground text-background hover:bg-muted-foreground text-xs font-bold gap-2"
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
          "flex-1 flex flex-col bg-card transition-all duration-200 overflow-hidden",
          activeView === 'dashboard' || activeView === 'vault' || activeView === 'history' || activeView === 'shortcuts' || activeView === 'api_reference' ? "w-0 opacity-0" : "w-[240px] opacity-100"
        )}>
          <div className="p-3 border-b border-border flex items-center justify-between bg-card">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-headline">
              {activeView === 'editor' ? 'Explorer' : 'Detective'}
            </span>
            <div className="flex items-center gap-1">
              {activeView === 'editor' && workspaceRoot && (
                <button 
                  onClick={onRefreshTree}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isFetchingTree && "animate-spin")} />
                </button>
              )}
              <button 
                onClick={store.toggleSidebar}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scroll-thin bg-card">
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
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      No workspace opened. You are in Single File Mode.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onOpenWorkspace}
                      className="h-7 text-[10px] border-border text-foreground hover:bg-muted w-full flex items-center justify-center gap-2 px-1 overflow-hidden"
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
                <Fingerprint className="w-8 h-8 text-primary mx-auto opacity-50" />
                <p className="text-[11px] text-muted-foreground">Configure your repository-wide style preferences to guide the refactoring engine.</p>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-background rounded-sm border border-border">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-foreground leading-none uppercase font-headline">CaramelPepper</span>
                <span className="text-[8px] text-muted-foreground font-mono">Engine Active</span>
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
