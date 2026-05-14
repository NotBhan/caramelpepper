
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
* **AI Orchestration:** Genkit

## 📋 Requirements

Before installing, ensure you have the following tools and accounts ready:

### 1. Software & Environment
* **Node.js:** v18.17.0 or newer (v20+ recommended).
* **Package Manager:** npm (comes with Node.js) or Yarn.
* **OS:** Windows 10/11, macOS (Intel or Apple Silicon), or Linux.
* **C++ Compiler (Optional):** Required only if you intend to rebuild the native high-performance backend (GCC 11+, Clang 13+, or MSVC 2022+).

### 2. Cloud Configuration
* **Firebase Project:** Create a project at [Firebase Console](https://console.firebase.google.com/).
    * Enable **Authentication** (GitHub Provider).
    * Enable **Cloud Firestore**.
* **GitHub OAuth:** Register an OAuth App in your GitHub Developer Settings to connect with Firebase.

### 3. Local AI (Optional for Offline Mode)
* **Ollama:** Install from [ollama.com](https://ollama.com/).
* **Models:** Recommended models include `qwen2.5-coder` or `llama3`.

## 🚀 Installation & Setup

Follow these steps to get your environment running:

### 1. Clone & Install
```bash
git clone https://github.com/NotBhan/caramelpepper
cd caramelpepper
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and populate it with your Firebase configuration and API keys:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google GenAI (Genkit)
GOOGLE_GENAI_API_KEY=your_google_ai_key
```

### 3. Start Development Server
```bash
# Run the Next.js web application on http://localhost:9002
npm run dev
```

### 4. Running as a Desktop App (Electron)
To run CaramelPepper in desktop mode with native window features:
```bash
npm run dev:electron
```

## 📂 Workspace Modes

* **Workspace Mode:** Load a full directory structure via local path or the Browser File System Access API.
* **Scratchpad Mode:** Use the IDE as a lightweight, single-file refactoring tool. Select your language and start coding immediately.

## 🏗️ Production Build

### Build the Web App
```bash
npm run build
```

### Package Desktop Executable
```bash
# Compiles the Next.js app and bundles it into a standalone installer
npm run build:electron
```
*The resulting installers will be located in the `dist/` folder.*

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/CaramelPepper/issues).

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
