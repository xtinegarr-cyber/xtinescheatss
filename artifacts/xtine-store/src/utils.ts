/** Convert a product name to a URL slug. e.g. "Rainbow Six Siege" → "rainbow-six-siege" */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
