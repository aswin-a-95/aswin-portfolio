import { describe, expect, it } from "vitest";
import { containsTodo, hrefOf, isTodo, todo, withTodo } from "@/lib/content";

describe("content placeholders", () => {
  const link = todo("[link]");
  const n = todo("[N]");

  it("recognises placeholders, including inside composed strings and nested objects", () => {
    expect(isTodo(link)).toBe(true);
    expect(isTodo("https://example.com")).toBe(false);
    expect(containsTodo(`${n} test JDs`)).toBe(true);
    expect(containsTodo({ a: [{ b: "fine" }, { c: n }] })).toBe(true);
    expect(containsTodo({ a: ["fine"], b: 3, c: true })).toBe(false);
  });

  it("shows the placeholder next to a label only while the URL is missing", () => {
    expect(withTodo("LinkedIn", link)).toBe("LinkedIn [link]");
    expect(withTodo("LinkedIn", "https://linkedin.com/in/x")).toBe("LinkedIn");
    expect(withTodo("GitHub", link, " · ")).toBe("GitHub · [link]");
    expect(hrefOf(link)).toBe("#");
    expect(hrefOf("/about")).toBe("/about");
  });
});
