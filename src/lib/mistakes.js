export const MISTAKES_KEY = "holdwise_mistakes_v1";

export function loadMistakes(storage = globalThis.localStorage) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(MISTAKES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markMistakeReviewed(mistakeAt, storage = globalThis.localStorage, reviewedAt = new Date().toISOString()) {
  const rows = loadMistakes(storage);
  const updated = rows.map((mistake) => mistake?.at === mistakeAt ? { ...mistake, reviewedAt } : mistake);
  storage?.setItem(MISTAKES_KEY, JSON.stringify(updated));
  return updated;
}
