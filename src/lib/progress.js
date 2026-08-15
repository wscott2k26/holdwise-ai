// Local-first lesson progress (works for guests). Syncs to LessonProgress entity
// for registered users when available.
import { base44 } from "@/api/base44Client";

const KEY = "holdwise_lesson_progress_v1";

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveProgress(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function markComplete(lessonId, score) {
  const map = loadProgress();
  const prev = map[lessonId] || { status: "not-started", bestScore: 0, attempts: 0 };
  map[lessonId] = {
    status: "completed",
    bestScore: Math.max(prev.bestScore, score),
    attempts: prev.attempts + 1,
    completedAt: new Date().toISOString(),
  };
  saveProgress(map);
  // Best-effort cloud sync
  syncEntity(lessonId, map[lessonId]).catch(() => {});
  return map[lessonId];
}

export function recordAttempt(lessonId) {
  const map = loadProgress();
  const prev = map[lessonId] || { status: "not-started", bestScore: 0, attempts: 0 };
  map[lessonId] = { ...prev, status: prev.status === "completed" ? "completed" : "in-progress", attempts: prev.attempts + 1, lastOpenedAt: new Date().toISOString() };
  saveProgress(map);
  return map[lessonId];
}

export function completionCount() {
  const map = loadProgress();
  return Object.values(map).filter((p) => p.status === "completed").length;
}

export function masteryPercent() {
  // crude overall: completed lessons across total
  const map = loadProgress();
  const done = Object.values(map).filter((p) => p.status === "completed").length;
  // total lessons known at runtime; caller can pass denominator
  return done;
}

async function syncEntity(lessonId, data) {
  try {
    const ok = await base44.auth.isAuthenticated();
    if (!ok) return;
    await base44.entities.LessonProgress.create({
      lessonId,
      status: data.status,
      masteryScore: data.bestScore,
      attempts: data.attempts,
      bestScore: data.bestScore,
      completedAt: data.completedAt,
      lastOpenedAt: data.lastOpenedAt,
    });
  } catch {
    // ignore — guest/local mode
  }
}
