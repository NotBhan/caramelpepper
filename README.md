
# CaramelPepper 🌶️

A privacy-first, AI-powered local IDE and code refactoring engine. CaramelPepper bridges the gap between powerful cloud-based LLMs and secure, offline local models, giving you a lightning-fast, highly contextual coding assistant that lives directly on your machine or in the cloud.

## ✨ Features

* **Multi-Engine AI Support:** Seamlessly toggle between Cloud providers (OpenAI, Anthropic, Gemini) and Local engines (Ollama, llama.cpp) for zero-latency, privacy-compliant refactoring.
* **Smart Language Scratchpads:** Start fresh with a workspace tailored to your preferred language (TypeScript, C++, Python, Rust, etc.) with correct syntax highlighting and AI context from line one.
* **Persistent IDE Context:** CaramelPepper remembers your active workspace root, the last opened file, and your panel configurations across sessions, ensuring you can pick up exactly where you left off.
* **Pro-Grade Editor:** Powered by Monaco Editor (the heart of VS Code) with automatic style detection, responsive layout wrapping, and side-by-side diff viewers for granular code reviews.
* **Collapsible Workspace Panels:** Optimize your focus with a fully flexible UI. Minimize the analysis metrics or the refactoring strategy console (pepper-shell) with a single click.
* **Firebase Multi-Tenant Authentication:** Secure GitHub OAuth integration. Your session state and API keys are seamlessly managed via our unified global store with automatic persistence.
* **Protected & Isolated Vault:** Your Local Secret Vault and Optimization History are gated behind an authentication wall. Firestore multi-tenancy ensures that all API secrets and refactoring histories are strictly isolated by your unique User ID.

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, Node.js API Routes)
* **Frontend:** React, Tailwind CSS, lucide-react, ShadCN UI
* **State Management:** Custom Global Context Store
* **Editor:** @monaco-editor/react
* **Authentication & Database:** Firebase Authentication & Cloud Firestore
* **Desktop Wrapper:** Electron

## 🚀 Getting Started

### Prerequisites

* Node.js (v18.17 or newer)
* A Firebase Project (for Authentication and Firestore)
* (Optional) Ollama or a llama.cpp server for 100% offline AI execution.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CaramelPepper.git
   cd CaramelPepper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Firebase configuration.

4. Start the development server (Web only):
   ```bash
   npm run dev
   ```

### Running as a Desktop App (Electron)

To run CaramelPepper in desktop mode during development:
```bash
npm run dev:electron
```

### Compiling & Packaging (Production)

To build and package CaramelPepper as a standalone executable for your operating system:

1. **Build the Next.js frontend:**
   ```bash
   npm run build
   ```

2. **Compile the Desktop App:**
   ```bash
   npm run build:electron
   ```
   *This command uses `electron-builder` to package the application. The resulting installers will be located in the `dist` folder.*

## 📂 Workspace Modes

* **Workspace Mode:** Load a full directory structure via local path or the Browser File System Access API.
* **Scratchpad Mode:** Use the IDE as a lightweight, single-file refactoring tool. Select your language and start coding immediately.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
