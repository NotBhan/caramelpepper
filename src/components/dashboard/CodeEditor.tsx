"use client"

import React from "react"
import Editor, { loader } from "@monaco-editor/react"
import { Copy, Trash2, FileJson, Layers, X, Code2, Terminal, FolderOpen, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getLanguageFromPath } from "@/lib/language-mapper"

import { MaterialFileIcon } from "./MaterialIcon"

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  title?: string;
  isReadOnly?: boolean;
  onClose?: () => void;
  activeFilePath: string | null;
  onOpenWorkspace?: () => void;
  onNewFile?: () => void;
}

export function CodeEditor({ 
  value, 
  onChange, 
  onAnalyze, 
  isAnalyzing, 
  title,
  isReadOnly = false,
  onClose,
  activeFilePath,
  onOpenWorkspace,
  onNewFile
}: CodeEditorProps) {
  const lineCount = value.split('\n').length;
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    monaco.editor.defineTheme('caramel-obsidian', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717A', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'F43F5E', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'FAFAFA' },
        { token: 'type', foreground: 'F59E0B' },
        { token: 'function', foreground: 'F59E0B', fontStyle: 'bold' },
        { token: 'string', foreground: '10B981' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'delimiter', foreground: 'A1A1AA' },
      ],
      colors: {
        'editor.background': '#09090B',
        'editor.foreground': '#FAFAFA',
        'editorLineNumber.foreground': '#3F3F46',
        'editorLineNumber.activeForeground': '#E11D48',
        'editorCursor.foreground': '#E11D48',
        'editor.selectionBackground': '#E11D4833',
        'editor.lineHighlightBackground': '#18181B66',
        'editorGutter.background': '#09090B',
        'editorWidget.background': '#18181B',
        'editorWidget.border': '#27272A',
      }
    });
    monaco.editor.setTheme('caramel-obsidian');
  };

  React.useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
      if (monacoRef.current) {
        const models = monacoRef.current.editor.getModels();
        models.forEach((model: any) => model.dispose());
      }
    };
  }, []);

  if (!activeFilePath && !value) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-center p-12">
        <div className="w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center mb-6 shadow-2xl">
          <Code2 className="w-10 h-10 text-muted-foreground/30" />
        </div>
        <h2 className="text-xl font-headline font-bold text-foreground mb-2">Workbench Empty</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
          Open a local repository or start with a single file to begin your AI-powered refactoring journey.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            onClick={onOpenWorkspace}
            variant="outline"
            className="h-10 px-6 border-border bg-card hover:bg-muted text-foreground font-bold text-xs gap-2 flex items-center justify-center max-w-full"
          >
            <FolderOpen className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">Open Workspace</span>
          </Button>
          <Button 
            onClick={onNewFile}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-2 flex items-center justify-center max-w-full"
          >
            <FilePlus className="w-4 h-4 shrink-0" />
            <span className="truncate">New Scratchpad</span>
          </Button>
        </div>
        <div className="mt-8 flex items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-widest bg-card px-3 py-1.5 rounded border border-border">
          <Terminal className="w-3 h-3" />
          <span>pepper-shell ready</span>
        </div>
      </div>
    );
  }

  const displayTitle = title || activeFilePath?.split(/[/\\]/).pop() || "scratchpad.ts";
  const language = getLanguageFromPath(activeFilePath);

  return (
    <div className="flex flex-col h-full bg-[#09090B] border-r border-[#222226]">
      <div className="flex items-center justify-between px-3 py-1 border-b border-[#222226] bg-[#121215] h-9 shrink-0">
        <div className="flex items-center gap-2">
          <MaterialFileIcon fileName={displayTitle} className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] font-mono text-[#FAFAFA] font-medium tracking-tight">
            {displayTitle}
          </span>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#09090B] text-zinc-400 border border-[#222226]">
            {language}
          </span>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              title="Copy Buffer"
              onClick={() => navigator.clipboard.writeText(value)}
              className="h-7 w-7 text-zinc-400 hover:text-[#FAFAFA] hover:bg-[#18181B]"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              title="Clear Buffer"
              onClick={() => onChange("")}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button 
              onClick={onAnalyze} 
              disabled={isAnalyzing}
              size="sm" 
              className="h-7 gap-1.5 px-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-medium text-[11px] transition-all"
            >
              <Layers className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Analyzing..." : "Optimize"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-[#09090B]">
        <Editor
          height="100%"
          language={language}
          theme="caramel-obsidian"
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isReadOnly,
            fontSize: 13,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Source Code Pro', monospace",
            wordWrap: 'on'
          }}
        />
      </div>

      <div className="px-3 py-1 border-t border-[#27272A] bg-[#09090B] flex justify-between items-center text-[10px] font-mono text-zinc-500 shrink-0">
        <div className="flex gap-4">
          <span>Lines: {lineCount}</span>
          <span>UTF-8</span>
          <span className="capitalize">{language}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-zinc-400">Tree-Sitter AST Ready</span>
        </div>
      </div>
    </div>
  )
}
