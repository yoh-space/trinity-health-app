import { create } from "zustand";
import type { AuthReturnRoute } from "../constants/authRoutes";

type Language = "am" | "en";

type TrinityState = {
  language: Language;
  savedIds: string[];
  authReturnTo: AuthReturnRoute | null;
  setLanguage: (language: Language) => void;
  toggleSaved: (id: string) => void;
  setAuthReturnTo: (route: AuthReturnRoute | null) => void;
};

export const useTrinityStore = create<TrinityState>((set) => ({
  language: "am",
  savedIds: [],
  authReturnTo: null,
  setLanguage: (language) => set({ language }),
  toggleSaved: (id) =>
    set((state) => ({
      savedIds: state.savedIds.includes(id)
        ? state.savedIds.filter((savedId) => savedId !== id)
        : [...state.savedIds, id],
    })),
  setAuthReturnTo: (authReturnTo) => set({ authReturnTo }),
}));
