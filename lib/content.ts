/**
 * Content Aswin must supply (SPEC §12).
 *
 * `todo("[placeholder]")` returns the design's bracketed placeholder so dev and preview
 * builds match the artboards. Production builds (VERCEL_ENV=production) hide any card,
 * case study or post that still contains one ("Anything without proof yet is left out"),
 * and `check:content` fails the build if a placeholder would still render.
 */
const TODOS = new Set<string>();

export function todo(placeholder: string): string {
  TODOS.add(placeholder);
  return placeholder;
}

/** True when the value is exactly a placeholder. */
export function isTodo(value: string | undefined): boolean {
  return value !== undefined && TODOS.has(value);
}

/** True when any string anywhere in the value contains a placeholder. */
export function containsTodo(value: unknown): boolean {
  if (typeof value === "string") {
    for (const t of TODOS) if (value.includes(t)) return true;
    return false;
  }
  if (Array.isArray(value)) return value.some(containsTodo);
  if (value && typeof value === "object") return Object.values(value).some(containsTodo);
  return false;
}

export const HIDE_UNPROVEN = process.env.VERCEL_ENV === "production";

/** Drops unproven entries in production; keeps everything in dev so pages match the artboards. */
export function published<T>(items: readonly T[]): T[] {
  return HIDE_UNPROVEN ? items.filter((i) => !containsTodo(i)) : [...items];
}

/** "LinkedIn [link]" while the URL is a placeholder, "LinkedIn" once it's real. */
export function withTodo(label: string, url: string, sep = " "): string {
  return isTodo(url) ? `${label}${sep}${url}` : label;
}

/** A placeholder URL renders as "#", as in the design. */
export function hrefOf(url: string): string {
  return isTodo(url) ? "#" : url;
}

/** Every placeholder anywhere in the value, in first-seen order. */
export function todosIn(value: unknown, found: string[] = []): string[] {
  if (typeof value === "string") {
    for (const t of TODOS) if (value.includes(t) && !found.includes(t)) found.push(t);
  } else if (Array.isArray(value)) value.forEach((v) => todosIn(v, found));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => todosIn(v, found));
  return found;
}
