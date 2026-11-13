/** A boolean flag kept in web storage, readable through useSyncExternalStore. */
export type FlagStore = {
  subscribe: (cb: () => void) => () => void;
  get: () => boolean;
  set: (value: boolean) => void;
};

export function makeFlagStore(getStorage: () => Storage, key: string): FlagStore {
  const listeners = new Set<() => void>();
  // Used when storage is blocked (private windows, site data off).
  let memory = false;
  let storageWorks = true;

  return {
    subscribe(cb) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    get() {
      if (!storageWorks) return memory;
      try {
        return getStorage().getItem(key) === "1";
      } catch {
        storageWorks = false;
        return memory;
      }
    },
    set(value) {
      memory = value;
      try {
        getStorage().setItem(key, value ? "1" : "0");
      } catch {
        storageWorks = false;
      }
      listeners.forEach((l) => l());
    },
  };
}
