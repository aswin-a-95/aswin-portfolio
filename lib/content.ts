/**
 * Marks content Aswin must supply. In dev it returns the design's bracketed placeholder
 * (e.g. "[domain]") so pages match the artboards. `pnpm check:content` fails production
 * builds while any call to this function, or any `TODO(aswin)` marker, is left in /content.
 */
export function todo(placeholder: string): string {
  return placeholder;
}
