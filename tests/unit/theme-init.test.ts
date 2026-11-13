import { describe, expect, it } from "vitest";
import { THEME_INIT_SCRIPT } from "@/lib/xray";

function run(search: string, stored: string | null) {
  const store = new Map<string, string>(stored ? [["xray", stored]] : []);
  const attrs = new Map<string, string>();
  const sessionStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  const document = { documentElement: { setAttribute: (k: string, v: string) => void attrs.set(k, v) } };
  new Function("location", "sessionStorage", "document", THEME_INIT_SCRIPT)({ search }, sessionStorage, document);
  return { theme: attrs.get("data-theme"), stored: store.get("xray") };
}

describe("theme init script", () => {
  it("stays light by default", () => {
    expect(run("", null).theme).toBeUndefined();
  });
  it("turns X-ray on and remembers it for ?xray=1", () => {
    expect(run("?xray=1", null)).toEqual({ theme: "xray", stored: "1" });
  });
  it("restores X-ray from sessionStorage", () => {
    expect(run("", "1").theme).toBe("xray");
  });
  it("ignores other xray values", () => {
    expect(run("?xray=0", null).theme).toBeUndefined();
  });
});
