"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeSessionStorage } from "@/lib/safe-storage";

export type TransitionPhase = "landing" | "transitioning" | "workspace";

interface WorkspaceTransitionState {
  phase: TransitionPhase;
  isTransitioning: boolean;
  inkFloodActive: boolean;
  launchWorkspace: () => void;
  returnToLanding: () => void;
  setPhase: (phase: TransitionPhase) => void;
}

export const useWorkspaceTransition = create<WorkspaceTransitionState>()(
  persist(
    (set) => ({
      phase: "landing",
      isTransitioning: false,
      inkFloodActive: false,

      launchWorkspace: () => {
        set({ isTransitioning: true, phase: "transitioning" });
        setTimeout(() => {
          set({ phase: "workspace", isTransitioning: false, inkFloodActive: false });
        }, 150);
      },

      returnToLanding: () => {
        set({ isTransitioning: true, phase: "transitioning" });
        setTimeout(() => {
          set({ phase: "landing", isTransitioning: false, inkFloodActive: false });
        }, 150);
      },

      setPhase: (phase) => set({ phase, isTransitioning: false, inkFloodActive: false }),
    }),
    {
      name: "caramelpepper_workspace_transition",
      storage: createJSONStorage(() => safeSessionStorage),
      partialize: (state) => ({ phase: state.phase === "transitioning" ? "workspace" : state.phase }),
    }
  )
);
