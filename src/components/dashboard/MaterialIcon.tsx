"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MaterialFileIconProps {
  fileName: string;
  className?: string;
}

export function MaterialFileIcon({ fileName, className = "w-4 h-4" }: MaterialFileIconProps) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const baseName = fileName.toLowerCase();

  // Special named files
  if (baseName === "cmakelists.txt" || ext === "cmake") {
    return (
      <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")} fill="none">
        <path d="M12 2L2 20h20L12 2z" fill="#007ACC" />
        <path d="M12 6L5.5 18h13L12 6z" fill="#E51F24" />
        <path d="M12 10l-3 6h6l-3-6z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (baseName === "makefile" || baseName === "gnumakefile") {
    return (
      <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")} fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#D97706" />
        <path d="M7 8h10M7 12h10M7 16h6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (baseName.startsWith(".git") || ext === "gitignore") {
    return (
      <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
        <path
          d="M21.6 10.8l-8.4-8.4a1.7 1.7 0 0 0-2.4 0l-1.8 1.8 3 3a2 2 0 0 1 2.5 2.5l2.9 2.9a2 2 0 1 1-1.2 1.2l-2.7-2.7v5.1a2 2 0 1 1-1.7 0v-5.2a2 2 0 0 1-1.1-2.6l-3-3-2.3 2.3a1.7 1.7 0 0 0 0 2.4l8.4 8.4a1.7 1.7 0 0 0 2.4 0l7.8-7.8a1.7 1.7 0 0 0 0-2.4z"
          fill="#F05032"
        />
      </svg>
    );
  }

  if (baseName === "dockerfile" || ext === "dockerfile") {
    return (
      <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")} fill="#2496ED">
        <path d="M22.5 12.3c-.3-.2-.8-.3-1.3-.2-.2-.5-.6-1-1.2-1.3l-.6-.3-.3.6c-.3.6-.3 1.3-.1 1.9-.6.4-1.5.5-2.5.5H2c-.4 0-.8.2-1 .5-.2.4-.2.8 0 1.2 1.5 3.3 4.8 5.5 8.5 5.5 5.8 0 10.6-3.8 11.8-9.1.5.2 1 .3 1.2.3.2 0 .4 0 .5-.1.3-.1.5-.4.5-.7v-.6l-1-.3zm-11-5.3H9.2v2h2.3V7zm-3.3 0H5.9v2h2.3V7zm6.6 0h-2.3v2h2.3V7zm3.3 0h-2.3v2h2.3V7zm-9.9-3H5.9v2h2.3V4zm3.3 0H9.2v2h2.3V4zm3.3 0h-2.3v2h2.3V4zm-6.6 6H5.9v2h2.3v-2zm3.3 0H9.2v2h2.3v-2zm3.3 0h-2.3v2h2.3v-2z" />
      </svg>
    );
  }

  // Extensions
  switch (ext) {
    // C++ Source
    case "cpp":
    case "cc":
    case "cxx":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#00599C" />
          <path d="M10 8.5a3.5 3.5 0 0 0-3.5 3.5v0a3.5 3.5 0 0 0 3.5 3.5c1.2 0 2.2-.6 2.8-1.5l-1.4-1c-.3.5-.8.8-1.4.8a1.8 1.8 0 0 1-1.8-1.8v0c0-1 .8-1.8 1.8-1.8.6 0 1.1.3 1.4.8l1.4-1A3.4 3.4 0 0 0 10 8.5z" fill="#FFFFFF" />
          <path d="M14.5 11h1v-1h1v1h1v1h-1v1h-1v-1h-1v-1zm4 0h1v-1h1v1h1v1h-1v1h-1v-1h-1v-1z" fill="#00D8FF" />
        </svg>
      );

    // C++ Header
    case "hpp":
    case "hh":
    case "hxx":
    case "inl":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#6366F1" />
          <path d="M7 8h2v3h3V8h2v8h-2v-3H9v3H7V8z" fill="#FFFFFF" />
          <path d="M16 11h1v-1h1v1h1v1h-1v1h-1v-1h-1v-1zm3 0h1v-1h1v1h1v1h-1v1h-1v-1h-1v-1z" fill="#A5B4FC" />
        </svg>
      );

    // C Source / Header
    case "c":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#3B82F6" />
          <path d="M13.5 8.5a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4c1.5 0 2.8-.8 3.5-2l-1.8-1.2c-.4.7-1 1.1-1.7 1.1a2 2 0 0 1-2-2v0c0-1.1.9-2 2-2 .7 0 1.3.4 1.7 1.1l1.8-1.2c-.7-1.2-2-1.8-3.5-1.8z" fill="#FFFFFF" />
        </svg>
      );

    case "h":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#8B5CF6" />
          <path d="M8 7h2.5v4h3V7H16v10h-2.5v-4h-3v4H8V7z" fill="#FFFFFF" />
        </svg>
      );

    // Python
    case "py":
    case "pyw":
    case "ipynb":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <path
            d="M11.9 2C7.3 2 7.6 4 7.6 4l.01 2.1h4.4v.6H5.4S2 6.3 2 11c0 4.6 3 4.4 3 4.4h1.8v-2.5s-.1-3 3-3h5.1s2.9.1 2.9-2.8V4.8S18 2 11.9 2zm-2.4 1.8a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z"
            fill="#3776AB"
          />
          <path
            d="M12.1 22c4.6 0 4.3-2 4.3-2l-.01-2.1h-4.4v-.6h6.6s3.4.4 3.4-4.3c0-4.6-3-4.4-3-4.4h-1.8v2.5s.1 3-3 3H9.1s-2.9-.1-2.9 2.8v2.3s-.2 2.8 5.9 2.8zm2.4-1.8a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z"
            fill="#FFD43B"
          />
        </svg>
      );

    // TypeScript
    case "ts":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="3" fill="#3178C6" />
          <path d="M7 9h5v1.8H10.5v6.2H8.5v-6.2H7V9zm6.2 4.8c.4.6 1 1 1.8 1 .7 0 1.2-.4 1.2-.9 0-.6-.5-.8-1.4-1.1-1.4-.4-2.3-.9-2.3-2.1 0-1.3 1.1-2.3 2.6-2.3 1.1 0 1.9.4 2.5 1.3l-1.3 1c-.3-.5-.7-.8-1.2-.8-.5 0-.8.3-.8.6 0 .4.4.6 1.2.9 1.5.5 2.5 1 2.5 2.3 0 1.4-1.1 2.4-2.8 2.4-1.3 0-2.3-.5-2.9-1.5l1.5-.9z" fill="#FFFFFF" />
        </svg>
      );

    // React TSX / JSX
    case "tsx":
    case "jsx":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="3" fill="#20232A" />
          <ellipse cx="12" cy="12" rx="7" ry="2.8" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="7" ry="2.8" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="7" ry="2.8" stroke="#61DAFB" strokeWidth="1.2" fill="none" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.3" fill="#61DAFB" />
        </svg>
      );

    // JavaScript
    case "js":
    case "mjs":
    case "cjs":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="3" fill="#F7DF1E" />
          <path d="M12.5 14.8c.3.5.7.8 1.4.8.7 0 1.1-.3 1.1-.8 0-.6-.4-.8-1.3-1.2-1.3-.5-2.1-1.1-2.1-2.4 0-1.4 1.1-2.4 2.7-2.4 1.2 0 2 .4 2.6 1.4l-1.4.9c-.3-.5-.7-.7-1.2-.7-.5 0-.9.3-.9.6 0 .4.3.6 1.1.9 1.4.6 2.3 1.1 2.3 2.5 0 1.6-1.2 2.6-2.9 2.6-1.5 0-2.5-.6-3-1.8l1.6-.8zm-5.7.2c.2.4.5.7 1 .7.6 0 1-.3 1-1.1v-5.8h1.9v5.8c0 1.8-1.1 2.8-2.8 2.8-1.3 0-2.2-.6-2.6-1.7l1.5-.7z" fill="#000000" />
        </svg>
      );

    // JSON
    case "json":
    case "json5":
    case "jsonc":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#18181B" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="12" y="16" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            {"{ }"}
          </text>
        </svg>
      );

    // Markdown
    case "md":
    case "mdx":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="4" width="20" height="16" rx="2" fill="#18181B" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M5 8v8h2.2v-4.5L9 14l1.8-2.5V16H13V8h-2.2L9 10.8 7.2 8H5zm10.5 4.5V8H18v4.5h2L16.5 16 13.5 12.5h2z" fill="#38BDF8" />
        </svg>
      );

    // Rust
    case "rs":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#DEA584" />
          <path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm-2 2.5h3c1 0 1.7.5 1.7 1.4 0 .7-.4 1.2-1 1.3l1.2 2.3h-1.3l-1.1-2.1H11v2.1H10V9.5zm1 1.2v1.5h1.8c.5 0 .8-.2.8-.7 0-.6-.4-.8-.8-.8H11z" fill="#000000" />
        </svg>
      );

    // Go
    case "go":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#00ADD8" />
          <text x="12" y="16" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            GO
          </text>
        </svg>
      );

    // HTML
    case "html":
    case "htm":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#E34F26" />
          <path d="M7 12l3-3v1.8L8.8 12 10 13.2V15l-3-3zm10 0l-3 3v-1.8l1.2-1.2L14 10.8V9l3 3zm-6 3.5l2-7h1.5l-2 7H11z" fill="#FFFFFF" />
        </svg>
      );

    // CSS / Styling
    case "css":
    case "scss":
    case "sass":
    case "less":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#1572B6" />
          <path d="M8.5 7h7M7 12h10M8.5 17h7M10 5l-2 14M16 5l-2 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // Shell / Scripts
    case "sh":
    case "bash":
    case "zsh":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="3" fill="#18181B" stroke="#22C55E" strokeWidth="1.5" />
          <path d="M7 9l3 3-3 3M12 15h5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    // YAML / TOML / Config
    case "yaml":
    case "yml":
    case "toml":
    case "ini":
    case "env":
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")}>
          <rect x="2" y="3" width="20" height="18" rx="4" fill="#8B5CF6" />
          <path d="M8 8l2.5 3.5V16h2v-4.5L15 8h-2.2l-1.8 2.8L9.2 8H8z" fill="#FFFFFF" />
        </svg>
      );

    // Generic code or text file
    default:
      return (
        <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")} fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#27272A" stroke="#71717A" strokeWidth="1.5" />
          <polyline points="14 2 14 8 20 8" stroke="#71717A" strokeWidth="1.5" />
          <line x1="8" y1="13" x2="16" y2="13" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="17" x2="13" y2="17" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

interface MaterialFolderIconProps {
  folderName: string;
  isOpen?: boolean;
  className?: string;
}

export function MaterialFolderIcon({
  folderName,
  isOpen = false,
  className = "w-4 h-4",
}: MaterialFolderIconProps) {
  const name = folderName.toLowerCase();

  // Color by folder type
  let fillBg = isOpen ? "#F59E0B" : "#D97706";
  let badgeColor = "#FFFFFF";
  let badge = null;

  if (name === "src" || name === "source" || name === "sources") {
    fillBg = isOpen ? "#00D8FF" : "#0284C7";
    badge = "code";
  } else if (name === "include" || name === "headers" || name === "inc") {
    fillBg = isOpen ? "#A855F7" : "#7C3AED";
    badge = "h";
  } else if (name === "test" || name === "tests" || name === "__tests__" || name === "spec") {
    fillBg = isOpen ? "#10B981" : "#059669";
    badge = "test";
  } else if (name === "scripts" || name === "bin" || name === "tools") {
    fillBg = isOpen ? "#F97316" : "#EA580C";
    badge = "sh";
  } else if (name === "doc" || name === "docs") {
    fillBg = isOpen ? "#38BDF8" : "#0284C7";
    badge = "doc";
  } else if (name === "models" || name === "ai" || name === "weights") {
    fillBg = isOpen ? "#E11D48" : "#BE123C";
    badge = "ai";
  } else if (name === "config" || name === ".config" || name === "settings") {
    fillBg = isOpen ? "#9333EA" : "#7E22CE";
    badge = "cfg";
  }

  if (isOpen) {
    return (
      <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")} fill="none">
        <path d="M2 6a2 2 0 0 1 2-2h4.5a2 2 0 0 1 1.4.6L12 6.5H20a2 2 0 0 1 2 2V9H3a1 1 0 0 0-1 1v7.5z" fill={fillBg} opacity="0.75" />
        <path d="M2.5 10h19.2a1 1 0 0 1 1 1.2l-2 8a1 1 0 0 1-1 .8H3.3a1 1 0 0 1-1-.8l-1.5-8a1 1 0 0 1 1.7-1.2z" fill={fillBg} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={cn(className, "shrink-0")} fill="none">
      <path
        d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"
        fill={fillBg}
      />
      <path d="M2 9h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9z" fill={fillBg} />
      {badge === "code" && (
        <path d="M9 13l-1.5 1.5L9 16m6-3l1.5 1.5L15 16" stroke={badgeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {badge === "ai" && (
        <circle cx="12" cy="14" r="2.2" fill={badgeColor} />
      )}
    </svg>
  );
}
