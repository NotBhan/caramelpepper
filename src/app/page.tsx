"use client"

import React from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { CodeEditor } from "@/components/dashboard/CodeEditor"
import { AnalysisPanel } from "@/components/dashboard/AnalysisPanel"
import { RefactorPanel } from "@/components/dashboard/RefactorPanel"
import { DiffViewer } from "@/components/dashboard/DiffViewer"
import { WorkspaceLayout } from "@/components/dashboard/WorkspaceLayout"
import { useAppStore } from "@/store/use-app-store"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { SettingsModal } from "@/components/dashboard/SettingsModal"
import { MenuBar } from "@/components/dashboard/MenuBar"
import { WorkspacePickerModal } from "@/components/dashboard/WorkspacePickerModal"
import { CookieConsent } from "@/components/dashboard/CookieConsent"
import { NewFileModal } from "@/components/dashboard/NewFileModal"
import { getLanguageFromPath } from "@/lib/language-mapper"

export default function Dashboard() {
  const store = useAppStore()
  const [styleReport, setStyleReport] = React.useState<any>(null)
  const [refactorOutput, setRefactorOutput] = React.useState<any>(null)
  const [isBusy, setIsBusy] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isNewFileModalOpen, setIsNewFileModalOpen] = React.useState(false)
  const [hasConsented, setHasConsented] = React.useState<boolean | null>(null)
  const { toast } = useToast()

  React.useEffect(() => {
    const consent = localStorage.getItem("caramelpepper-cookie-consent")
    setHasConsented(!!consent)
  }, [])

  const handleAnalyze = async () => {
    if (!store.code) return;
    setIsBusy(true)
    setRefactorOutput(null)
    
    let detectedStyle = null;

    try {
      const styleResponse = await fetch('/api/ai/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: store.code })
      });
      
      if (styleResponse.ok) {
        detectedStyle = await styleResponse.json();
        setStyleReport(detectedStyle);
      }
    } catch (err) {
      console.warn('Style detective connection failed:', err);
    }

    try {
      const refactorResponse = await fetch('/api/ai/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: store.code,
          language: getLanguageFromPath(store.activeFilePath),
          provider: store.inferenceProvider,
          style: detectedStyle,
          isAnonymous: store.isGuest
        })
      });

      const contentType = refactorResponse.headers.get("content-type");
      if (!refactorResponse.ok) {
        let errorMessage = "Optimization engine failed.";
        if (contentType && contentType.includes("application/json")) {
          const errData = await refactorResponse.json();
          errorMessage = errData.error || errorMessage;
        } else {
          errorMessage = await refactorResponse.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response from the refactoring server.");
      }

      const refactorResult = await refactorResponse.json();
      setRefactorOutput(refactorResult);

      if (refactorResult.refactoredCode) {
        store.openDiff(refactorResult.refactoredCode)
      }

      toast({
        title: "Optimization Strategy Ready",
        description: `Risk: ${store.originalMetrics?.risk.toUpperCase()} | Suggestions: ${refactorResult.suggestions?.length || 0}`,
      })
    } catch (err: any) {
      toast({
        title: "Optimization Failed",
        description: err.message || "The refactoring engine could not be reached.",
        variant: "destructive",
      })
    } finally {
      setIsBusy(false)
    }
  }

  // Determine if the workspace picker should be shown automatically
  const isGitHubAuthenticated = store.user && !store.isGuest;
  const isWorkspaceActive = store.workspaceRoot !== null;
  const showPicker = hasConsented === true && 
                     !store.loadingAuth && 
                     !store.isPickerDismissed && 
                     !isWorkspaceActive && 
                     !isGitHubAuthenticated;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MenuBar onNewFile={() => setIsNewFileModalOpen(true)} />
      <div className="flex-1 min-h-0">
        <WorkspaceLayout
          activeView={store.activeView}
          isDiffOpen={store.isDiffOpen}
          sidebar={
            <Sidebar 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              activeProvider={store.inferenceProvider}
              fileTree={store.fileTree}
              activeFilePath={store.activeFilePath}
              isFetchingTree={store.isFetchingTree}
              onRefreshTree={() => store.fetchWorkspaceTree(store.workspaceRoot || undefined)}
              onOpenFile={store.openFile}
              workspaceRoot={store.workspaceRoot}
              onOpenWorkspace={() => store.resetWorkspaceRoot()}
              activeView={store.activeView}
              setActiveView={store.setActiveView}
            />
          }
          editor={
            <CodeEditor 
              value={store.code} 
              onChange={store.setCode} 
              onAnalyze={handleAnalyze}
              isAnalyzing={isBusy}
              onClose={store.closeActiveFile}
              activeFilePath={store.activeFilePath}
              onOpenWorkspace={store.resetWorkspaceRoot}
              onNewFile={() => setIsNewFileModalOpen(true)}
            />
          }
          refactor={
            <DiffViewer 
              original={store.code}
              modified={store.proposedCode}
              originalMetrics={store.originalMetrics}
              proposedMetrics={store.proposedMetrics}
              onAccept={store.acceptRefactor}
              onReject={store.rejectRefactor}
              activeFilePath={store.activeFilePath}
            />
          }
          analysis={
            <AnalysisPanel 
              metrics={store.originalMetrics} 
              style={styleReport}
              isAnalyzing={isBusy}
            />
          }
          bottom={
            <RefactorPanel 
              suggestions={refactorOutput} 
              isRefactoring={isBusy}
              onApply={store.acceptRefactor}
            />
          }
        />
      </div>
      
      <WorkspacePickerModal 
        isOpen={showPicker}
        onSelect={store.setWorkspaceRoot}
        onSkip={store.dismissPicker}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        provider={store.inferenceProvider}
        onProviderChange={store.setInferenceProvider}
        keyStatus={store.keyStatus}
        onSaveKey={store.saveApiKey}
        ollamaConfig={store.ollamaConfig}
        onSaveOllama={store.saveOllamaConfig}
      />

      <NewFileModal 
        isOpen={isNewFileModalOpen} 
        onOpenChange={setIsNewFileModalOpen} 
      />
      
      <CookieConsent onConsent={() => setHasConsented(true)} />
      <Toaster />
    </div>
  )
}