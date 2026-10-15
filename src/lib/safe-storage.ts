/**
 * Safe, cross-browser storage wrappers that handle Safari Private Browsing,
 * disabled third-party cookies, and restrictive sandboxes without throwing SecurityError.
 */

const sessionMemoryStore = new Map<string, string>();
const localMemoryStore = new Map<string, string>();

export const safeSessionStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return sessionMemoryStore.get(name) || null;
      }
      return window.sessionStorage.getItem(name);
    } catch {
      return sessionMemoryStore.get(name) || null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.setItem(name, value);
      } else {
        sessionMemoryStore.set(name, value);
      }
    } catch {
      sessionMemoryStore.set(name, value);
    }
  },

  removeItem: (name: string): void => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(name);
      } else {
        sessionMemoryStore.delete(name);
      }
    } catch {
      sessionMemoryStore.delete(name);
    }
  },
};

export const safeLocalStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return localMemoryStore.get(name) || null;
      }
      return window.localStorage.getItem(name);
    } catch {
      return localMemoryStore.get(name) || null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(name, value);
      } else {
        localMemoryStore.set(name, value);
      }
    } catch {
      localMemoryStore.set(name, value);
    }
  },

  removeItem: (name: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(name);
      } else {
        localMemoryStore.delete(name);
      }
    } catch {
      localMemoryStore.delete(name);
    }
  },
};
