"use client";

import { cn } from "@/lib/utils";
import { type PropsWithChildren, createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

type ToastContextType = {
  toast: (message: string, type?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }
  }

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);

    const timeout = setTimeout(() => removeToast(id), 3500);
    timeouts.current.set(id, timeout);
  }, []);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg dark:bg-zinc-900 transition-all",
              t.type === "success"
                ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400"
                : "border-red-200 text-red-700 dark:border-red-800 dark:text-red-400",
            )}
          >
            {t.message}
            <button onClick={() => removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
