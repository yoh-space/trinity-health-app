import { create } from "zustand";

type Language = "am" | "en";

type TrinityState = {
  language: Language;
  savedIds: string[];
  setLanguage: (language: Language) => void;
  toggleSaved: (id: string) => void;
};

export const useTrinityStore = create<TrinityState>((set) => ({
  language: "am",
  savedIds: [],
  setLanguage: (language) => set({ language }),
  toggleSaved: (id) =>
    set((state) => ({
      savedIds: state.savedIds.includes(id)
        ? state.savedIds.filter((savedId) => savedId !== id)
        : [...state.savedIds, id],
    })),
}));
