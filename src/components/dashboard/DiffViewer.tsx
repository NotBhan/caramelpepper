"use client"

import React from "react"
import { DiffEditor } from "@monaco-editor/react"
import { Check, X, TrendingDown, TrendingUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type ComplexityMetrics } from "@/lib/complexity"
import { cn } from "@/lib/utils"
import { getLanguageFromPath } from "@/lib/language-mapper"

interface DiffViewerProps {
  original: string;
  modified: string;
  originalMetrics: ComplexityMetrics | null;
  proposedMetrics: ComplexityMetrics | null;
  onAccept: () => void;
  onReject: () => void;
  activeFilePath: string | null;
}

export function DiffViewer({
  original,
  modified,
  originalMetrics,
  proposedMetrics,
  onAccept,
  onReject,
  activeFilePath
}: DiffViewerProps) {
  const editorRef = React.useRef<any>(null);
  const monacoRef = React.useRef<any>(null);

  const [modelPaths] = React.useState(() => ({
    original: `file:///original-${Math.random().toString(36).slice(2, 9)}.ts`,
    modified: `file:///modified-${Math.random().toString(36).slice(2, 9)}.ts`
  }));

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
        'diffEditor.insertedTextBackground': '#10B98122',
        'diffEditor.removedTextBackground': '#E11D4822',
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
        models.forEach((model: any) => {
          if (model.uri.toString().includes('file:///original-') || 
              model.uri.toString().includes('file:///modified-')) {
            model.dispose();
          }
        });
      }
    };
  }, []);

  const getImprovement = (key: keyof Pick<ComplexityMetrics, 'cyclomatic' | 'cognitive'>) => {
    if (!originalMetrics || !proposedMetrics) return null;
    const diff = originalMetrics[key] - proposedMetrics[key];
    const isBetter = diff > 0;
    return {
      diff: Math.abs(diff),
      isBetter,
      icon: isBetter ? TrendingDown : TrendingUp,
      color: isBetter ? "text-green-500" : "text-destructive"
    };
  };

  const cyc = getImprovement('cyclomatic');
  const language = getLanguageFromPath(activeFilePath);

  const editorOptions = React.useMemo(() => ({
    renderSideBySide: true,
    readOnly: true,
    fontSize: 13,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16 },
    fontFamily: "'JetBrains Mono', 'Source Code Pro', monospace",
    wordWrap: 'on' as const,
    backgroundColor: '#09090B',
    folding: true,
    lineNumbers: 'on' as const,
    originalEditable: false,
    diffCodeLens: false,
  }), []);

  return (
    <div className="flex flex-col h-full bg-[#09090B] relative">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#222226] bg-[#121215]">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#222226] text-zinc-300 font-mono text-[10px]">
            {activeFilePath?.split(/[/\\]/).pop() || "PROPOSED_REFACTOR.CPP"}
          </span>
          
          {cyc && (
            <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#09090B] border border-[#222226]">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Complexity</span>
              <span className="text-[11px] font-mono text-zinc-300">
                {originalMetrics?.cyclomatic} → {proposedMetrics?.cyclomatic}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReject}
            className="h-7 px-3 text-xs text-zinc-400 hover:text-white hover:bg-[#18181B]"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Discard
          </Button>
          <Button 
            size="sm" 
            onClick={onAccept}
            className="h-7 px-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-medium text-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Accept Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-[#09090B]">
        <DiffEditor
          height="100%"
          original={original}
          modified={modified}
          language={language}
          theme="caramel-obsidian"
          options={editorOptions}
          onMount={handleEditorDidMount}
          originalModelPath={modelPaths.original}
          modifiedModelPath={modelPaths.modified}
        />
      </div>

      {proposedMetrics && proposedMetrics.risk === 'low' && originalMetrics && originalMetrics.risk !== 'low' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded bg-[#121215] border border-[#222226] flex items-center gap-2 text-xs font-mono text-zinc-300 shadow-xl">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reduced cyclomatic complexity ({originalMetrics.cyclomatic} → {proposedMetrics.cyclomatic})</span>
        </div>
      )}
    </div>
  )
}