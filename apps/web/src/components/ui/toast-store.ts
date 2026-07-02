import { create } from "zustand";

import type { AlertTone } from "./alert";

export type ToastTone = AlertTone | "success";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  tone?: ToastTone;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(input: Omit<ToastItem, "id">) {
  return useToastStore.getState().push(input);
}
