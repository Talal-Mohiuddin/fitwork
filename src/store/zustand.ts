import { Profile } from "@/types";
import { User } from "firebase/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StoreState {
  user: User | Profile | null;
  setUser: (user: User | Profile | null) => void;
}

export const useStore = create<StoreState>()(
  persist<StoreState>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "fitwork-store",
    }
  )
);
