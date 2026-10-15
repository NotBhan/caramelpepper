"use client"

import React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { type FileItem } from "@/store/use-app-store"
import { cn } from "@/lib/utils"
import { MaterialFileIcon, MaterialFolderIcon } from "./MaterialIcon"

interface FileExplorerProps {
  items: FileItem[];
  activePath: string | null;
  onFileClick: (path: string, handle?: any) => void;
}

// Minimal health indicator without distracting animations
function getFileHealth(fileName: string): { color: string; label: string } {
  if (fileName.includes("legacy") || fileName.includes("old") || fileName.endsWith(".c")) {
    return { color: "bg-red-400/70", label: "Technical Debt" };
  }
  if (fileName.endsWith(".cpp") || fileName.endsWith(".py")) {
    return { color: "bg-zinc-400/70", label: "Standard Complexity" };
  }
  return { color: "bg-zinc-600/70", label: "Clean" };
}

export function FileExplorer({ items, activePath, onFileClick }: FileExplorerProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[11px] font-code text-zinc-500">No files in current scope</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 select-none py-1">
      {items.map((item) => (
        <FileExplorerItem 
          key={item.path} 
          item={item} 
          activePath={activePath} 
          onFileClick={onFileClick} 
          depth={0}
        />
      ))}
    </div>
  )
}

interface FileExplorerItemProps {
  item: FileItem;
  activePath: string | null;
  onFileClick: (path: string, handle?: any) => void;
  depth: number;
}

function FileExplorerItem({ item, activePath, onFileClick, depth }: FileExplorerItemProps) {
  const [isExpanded, setIsExpanded] = React.useState(depth === 0);
  const isActive = activePath === item.path;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.is_dir) {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item.path, item.handle);
    }
  }

  const health = !item.is_dir ? getFileHealth(item.name) : null;

  return (
    <div className="flex flex-col">
      <button
        onClick={handleToggle}
        style={{ paddingLeft: `${depth * 12 + 10}px` }}
        title={item.path}
        className={cn(
          "flex items-center gap-2 py-1 pr-3 w-full text-left transition-colors relative group font-code text-xs",
          isActive 
            ? "bg-[#18181B] text-[#FAFAFA] font-medium" 
            : "text-[#A1A1AA] hover:bg-[#18181B]/60 hover:text-[#FAFAFA]"
        )}
      >
        {/* Active tab red indicator bar on left edge */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E11D48]" />
        )}

        <span className="shrink-0 text-zinc-500">
          {item.is_dir ? (
            isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <div className="w-3.5" />
          )}
        </span>
        
        {item.is_dir ? (
          <MaterialFolderIcon folderName={item.name} isOpen={isExpanded} className="w-4 h-4 shrink-0" />
        ) : (
          <MaterialFileIcon fileName={item.name} className="w-4 h-4 shrink-0" />
        )}
        
        <span className="truncate flex-1 tracking-tight">{item.name}</span>

        {/* Health status dot for non-directory files */}
        {health && (
          <span 
            title={health.label}
            className={cn("w-1.5 h-1.5 rounded-full shrink-0 ml-1.5 transition-transform group-hover:scale-125", health.color)}
          />
        )}
      </button>

      {item.is_dir && isExpanded && item.children && (
        <div className="flex flex-col">
          {item.children.map((child) => (
            <FileExplorerItem 
              key={child.path} 
              item={child} 
              activePath={activePath} 
              onFileClick={onFileClick} 
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
