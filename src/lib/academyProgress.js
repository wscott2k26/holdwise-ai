export const ACADEMY_PROGRESS_KEY = "holdwise_academy_progress_v1";

export function loadAcademyCompletions(storage = globalThis.localStorage) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(ACADEMY_PROGRESS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAcademyCompletion(gameId, result = {}, storage = globalThis.localStorage) {
  if (!gameId) return loadAcademyCompletions(storage);
  const rows = loadAcademyCompletions(storage);
  const score = Math.max(0, Number(result.score) || 0);
  const total = Math.max(1, Number(result.total) || 1);
  const now = new Date().toISOString();
  const index = rows.findIndex((row) => row.gameId === gameId);
  if (index >= 0) {
    rows[index] = {
      ...rows[index],
      bestScore: Math.max(Number(rows[index].bestScore) || 0, score),
      total,
      lastCompletedAt: now,
    };
  } else {
    rows.push({ gameId, bestScore: score, total, completedAt: now, lastCompletedAt: now });
  }
  storage?.setItem(ACADEMY_PROGRESS_KEY, JSON.stringify(rows));
  return rows;
}
