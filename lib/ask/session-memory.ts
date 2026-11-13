import { SessionMemorySchema, type SessionMemory } from "./types";

/**
 * The fit check's context, held in sessionStorage only (SPEC §5). The hero writes it in
 * Milestone 4; Ask reads it and "Forget this" clears it. Nothing is stored server-side.
 */
export const SESSION_MEMORY_KEY = "fit-memory";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cached: SessionMemory | null = null;
// Used when storage is blocked (private windows, site data off).
let memoryFallback: string | null = null;

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(SESSION_MEMORY_KEY);
  } catch {
    return memoryFallback;
  }
}

function writeRaw(raw: string | null): void {
  memoryFallback = raw;
  try {
    if (raw === null) window.sessionStorage.removeItem(SESSION_MEMORY_KEY);
    else window.sessionStorage.setItem(SESSION_MEMORY_KEY, raw);
  } catch {
    // Storage blocked: the in-memory copy lasts until reload.
  }
  listeners.forEach((l) => l());
}

export const sessionMemory = {
  subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  /** Parsed and validated; null when absent or malformed. Stable between calls for useSyncExternalStore. */
  get(): SessionMemory | null {
    const raw = readRaw();
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    cached = null;
    if (raw) {
      try {
        const parsed = SessionMemorySchema.safeParse(JSON.parse(raw));
        if (parsed.success) cached = parsed.data;
      } catch {
        // Malformed JSON reads as no memory.
      }
    }
    return cached;
  },
  set(value: SessionMemory): void {
    writeRaw(JSON.stringify(value));
  },
  clear(): void {
    writeRaw(null);
  },
};
