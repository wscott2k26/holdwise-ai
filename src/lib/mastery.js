/**
 * @typedef {{total?: number, correct?: number}} CountRow
 * @typedef {{total?: number, correct?: number, byCategory?: Record<string, CountRow>, byPayTable?: Record<string, CountRow>, recent?: Array<{correct?: boolean}>}} PracticeStats
 * @typedef {{streak?: number}} LearnerProfile
 */

function percent(correct, total) {
  return total ? Math.round((correct / total) * 100) : 0;
}

function titleCase(value) {
  return String(value || "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/**
 * Build display-only mastery metrics from the learner state HoldWise already stores.
 * @param {{profile?: LearnerProfile, practice?: PracticeStats, mistakes?: Array<{category?: string}>, lessonsDone?: number}} input
 */
export function buildMasterySnapshot({ profile = {}, practice = {}, mistakes = [], lessonsDone = 0 }) {
  const total = Number(practice.total) || 0;
  const correct = Number(practice.correct) || 0;
  const byCategory = practice.byCategory || {};
  const byPayTable = practice.byPayTable || {};
  const recent = Array.isArray(practice.recent) ? practice.recent.slice(0, 20) : [];

  const categoryRows = Object.entries(byCategory).map(([category, data = {}]) => {
    const rowTotal = Number(data.total) || 0;
    const rowCorrect = Number(data.correct) || 0;
    return { category, total: rowTotal, correct: rowCorrect, accuracy: rowTotal ? rowCorrect / rowTotal : 0 };
  });
  const experiencedRows = categoryRows.filter((row) => row.total >= 2);
  const strongest = [...experiencedRows].sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)[0] || null;
  const weakest = [...experiencedRows].sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)[0] || null;

  const mistakeCounts = (Array.isArray(mistakes) ? mistakes : []).reduce((map, mistake) => {
    if (!mistake?.category) return map;
    map[mistake.category] = (map[mistake.category] || 0) + 1;
    return map;
  }, /** @type {Record<string, number>} */ ({}));
  const commonMistake = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const bestPayTable = Object.entries(byPayTable)
    .map(([id, data = {}]) => ({ id, total: Number(data.total) || 0, correct: Number(data.correct) || 0 }))
    .sort((a, b) => b.total - a.total)[0] || null;

  const recentCorrect = recent.filter((item) => item?.correct).length;
  const accuracyPct = percent(correct, total);
  const masteryPct = Math.min((Number(lessonsDone) || 0) * 2 + Math.round((correct / Math.max(1, total)) * 20), 100);
  const recommendedFocus = weakest?.category
    ? titleCase(weakest.category)
    : commonMistake
      ? titleCase(commonMistake)
      : "Complete more practice hands";

  return {
    accuracyPct,
    masteryPct,
    streakDays: Number(profile.streak) || 0,
    totalDecisions: total,
    reviewCount: Array.isArray(mistakes) ? mistakes.length : 0,
    recentAccuracyPct: percent(recentCorrect, recent.length),
    strongest,
    weakest,
    commonMistake,
    bestPayTableId: bestPayTable?.id || null,
    recommendedFocus,
  };
}
