import { describe, expect, it, vi } from "vitest";
import { makeFlagStore } from "@/lib/flag-store";

function fakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
}

describe("flag store", () => {
  it("defaults to false and persists to storage", () => {
    const storage = fakeStorage();
    const store = makeFlagStore(() => storage, "k");
    expect(store.get()).toBe(false);
    store.set(true);
    expect(store.get()).toBe(true);
    expect(storage.getItem("k")).toBe("1");
    store.set(false);
    expect(store.get()).toBe(false);
  });

  it("reads a value written earlier, as after a reload", () => {
    const storage = fakeStorage();
    storage.setItem("k", "1");
    expect(makeFlagStore(() => storage, "k").get()).toBe(true);
  });

  it("notifies subscribers until they unsubscribe", () => {
    const store = makeFlagStore(() => fakeStorage(), "k");
    const cb = vi.fn();
    const off = store.subscribe(cb);
    store.set(true);
    off();
    store.set(false);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("falls back to memory when storage throws", () => {
    const broken = () => {
      throw new Error("blocked");
    };
    const store = makeFlagStore(broken as unknown as () => Storage, "k");
    expect(store.get()).toBe(false);
    store.set(true);
    expect(store.get()).toBe(true);
  });
});
