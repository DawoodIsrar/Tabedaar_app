import axios from "axios"; // ✅ Add axios import
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

import { EXPO_SERVER_BASE_URL } from "@/constants";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  signIn: async (email, password) => {
    try {
      const response = await axios.post(`${EXPO_SERVER_BASE_URL}/auth/signin`, {
        email,
        password,
      });

      const data = response.data;
      console.log("data", data);

      await SecureStore.setItemAsync("token", data.access_token);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));

      set({ token: data.access_token, user: data.user });
      router.replace("/(root)/(tabs)/home");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      console.error("Sign-in error:", message);
      throw new Error(message);
    }
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    set({ user: null, token: null });
    router.replace("/(auth)/sign-in");
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const userStr = await SecureStore.getItemAsync("user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error("Failed to load session", err);
      set({ isLoading: false });
    }
  },
}));
