# CaramelPepper 🌶️ UI & Features Documentation

Welcome to the technical overview of the CaramelPepper workspace. This document outlines the interface architecture and core engines that drive our privacy-first refactoring experience.

---

## 1. Workspace Architecture 🏗️

CaramelPepper features a **Dynamic Resizable Layout** built on `react-resizable-panels`. This IDE-grade workspace is designed for high-density information display without cognitive overload.

*   **Activity Bar (The Command Center):** Fixed left strip for rapid switching between the Dashboard, Explorer, Style Detective, and Vault. Includes user profile and logout.
*   **Sidebar (The Navigator):** Collapsible panel for file exploration or style diagnostics.
*   **Main Stage (The Workbench):** Split-view area featuring the primary Monaco Editor and the contextual Diff Viewer.
*   **Bottom Panel (pepper-shell):** A collapsible console for real-time refactoring strategies and actionable task lists.
*   **Right Panel (The Analyst):** Collapsible diagnostic area for cyclomatic complexity and maintainability reports.

---

## 2. UI Panels Deep-Dive 🔍

### Smart File Tree 📂
A recursive directory viewer powered by the C++ Filesystem API or Browser FS API.
*   **Recursive Viewing:** Supports deep project structures with high performance.
*   **Exclusion Logic:** Automatically filters out `.git`, `node_modules`, and binary artifacts.
*   **Contextual Status:** The breadcrumb bar in the navbar reflects the current workspace and file path.

### Main Editor ⌨️
The heart of the app, powered by Monaco (the engine behind VS Code).
*   **Syntax Detection:** Automatic language mapping based on file extensions.
*   **Persistence:** Code content and dirty states are maintained during session transitions.

### Diff Viewer ⚖️
A side-by-side comparison tool that activates during the refactoring workflow.
*   **Impact Visuals:** Shows exact complexity reduction (e.g., 15 → 8) before you accept changes.
*   **Accept/Reject Actions:** Commit proposed optimizations directly to your file system.

### pepper-shell 🐚
The intelligent refactoring console located at the bottom of the workspace.
*   **Actionable Suggestions:** Provides a numbered list of specific improvements.
*   **Linguistic Analysis:** Brief AI-generated summary of the code's current structural state.

---

## 3. Core Features & Workflows ⚙️

### Persistence Engine 💾
CaramelPepper utilizes a robust state synchronization layer. It persists your workspace root, opened files, and panel collapse preferences in `localStorage` (after user consent), ensuring the IDE feels like a native desktop application.

### Style Detective 🕵️‍♂️
Before generating code, the AI pre-processor performs WASM-based AST analysis to detect:
*   **Naming Conventions:** (camelCase, snake_case, etc.).
*   **Indentation Prefs:** (Spaces vs Tabs).
*   **Formatting Rules:** Ensures the AI matches your repository's existing vertical pacing.

### Hybrid Inference Engine 🧠
Swap between local privacy and cloud performance in the **Settings Vault**:
*   **Local:** Offline inference using `Ollama` or `llama.cpp`.
*   **Cloud:** Premium processing via Google (Gemini 2.0), OpenAI (GPT-4), or Anthropic (Claude).

---

Happy Refactoring! 🌶️
