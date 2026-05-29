export function slugify(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return base || "post";
}

export async function uniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>,
) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (await exists(slug)) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
