const KEY = "holdwise_vp_stats_v1";

const emptyStats = () => ({
  total: 0,
  correct: 0,
  byCategory: {},
  byPayTable: {},
  recent: [],
});

export function loadPracticeStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
    return parsed && typeof parsed === "object" ? { ...emptyStats(), ...parsed } : emptyStats();
  } catch {
    return emptyStats();
  }
}

export function recordPracticeDecision({ correct, category, payTableId, source }) {
  const stats = loadPracticeStats();
  stats.total += 1;
  stats.correct += correct ? 1 : 0;

  const categoryKey = category || "unknown";
  const categoryStats = stats.byCategory[categoryKey] || { total: 0, correct: 0 };
  categoryStats.total += 1;
  categoryStats.correct += correct ? 1 : 0;
  stats.byCategory[categoryKey] = categoryStats;

  const tableKey = payTableId || "unknown";
  const tableStats = stats.byPayTable[tableKey] || { total: 0, correct: 0 };
  tableStats.total += 1;
  tableStats.correct += correct ? 1 : 0;
  stats.byPayTable[tableKey] = tableStats;

  stats.recent.unshift({ correct: Boolean(correct), category: categoryKey, payTableId: tableKey, source, at: new Date().toISOString() });
  stats.recent = stats.recent.slice(0, 200);
  localStorage.setItem(KEY, JSON.stringify(stats));
  return stats;
}
