export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateUniqueSlug(name: string, suffix?: string): string {
  const base = generateSlug(name);
  if (suffix) {
    return `${base}-${suffix}`;
  }
  return base;
}
