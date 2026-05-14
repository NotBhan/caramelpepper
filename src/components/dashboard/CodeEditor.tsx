"use client"

import React from "react"
import Editor, { loader } from "@monaco-editor/react"
import { Copy, Trash2, FileJson, Layers, X, Code2, Terminal, FolderOpen, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getLanguageFromPath } from "@/lib/language-mapper"

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
    
    // Explicitly set background for the editor instance
    monaco.editor.defineTheme('caramel-pepper-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000',
      }
    });
    monaco.editor.setTheme('caramel-pepper-theme');
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
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="flex items-center justify-between px-2 py-0 border-b border-border bg-card h-9">
        <div className="flex items-center h-full">
          <div className="flex items-center gap-2 px-3 h-full bg-background border-r border-border min-w-[120px]">
            <FileJson className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[180px]">{displayTitle}</span>
            <button 
              onClick={onClose}
              className="ml-2 p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex items-center gap-1.5 pr-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground/80 hover:text-foreground hover:bg-muted">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button 
              onClick={onAnalyze} 
              disabled={isAnalyzing}
              size="sm" 
              className="h-7 gap-1.5 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px]"
            >
              <Layers className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
              {isAnalyzing ? "Processing..." : "Optimize"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
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
            fontFamily: 'Source Code Pro, monospace',
            wordWrap: 'on',
            backgroundColor: '#000000'
          }}
        />
      </div>

      <div className="px-4 py-1 border-t border-border bg-card flex justify-between items-center text-[10px] text-muted-foreground">
        <div className="flex gap-4">
          <span>Lines: {lineCount}</span>
          <span>UTF-8</span>
          <span className="capitalize">{language}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>LSP Active</span>
        </div>
      </div>
    </div>
  )
}
