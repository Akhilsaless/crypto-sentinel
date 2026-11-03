import { useState } from "react";
import { z } from "zod";

// Only nonsensitive, manually entered settings. No session, credentials or trading state.
export function useBrowserLocal<T>(key: string, schema: z.ZodType<T>) {
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return { items: [] as T[], error: "" };
      const parsed = z.array(schema).safeParse(JSON.parse(raw));
      return parsed.success ? { items: parsed.data, error: "" } : { items: [] as T[], error: "Saved data could not be read. New entries will replace it." };
    } catch { return { items: [] as T[], error: "Browser storage is unavailable or unreadable. Changes remain session-only until saving succeeds." }; }
  });
  const [items, setItems] = useState<T[]>(initial.items);
  const [storageError, setStorageError] = useState(initial.error);
  const update = (next: T[]) => {
    setItems(next);
    try { localStorage.setItem(key, JSON.stringify(next)); setStorageError(""); }
    catch { setStorageError("Browser save failed. These changes are session-only and may be lost on reload."); }
  };
  return { items, update, storageError };
}