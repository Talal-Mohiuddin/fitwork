import { Profile } from "@/types";
import { User } from "firebase/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  user: User | Profile | null;
  setUser: (user: User | Profile | null) => void;
  isAuthenticated: boolean;
  clearAuth: () => void;
}

export const useStore = create<StoreState>()(
  persist<StoreState>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "fitwork-store",
    }
  )
);
