import { dailyChallengeDateKey } from "./dailyChallenge.js";

function sameLocalDay(timestamp, date) {
  if (!timestamp) return false;
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return false;
  return dailyChallengeDateKey(parsed) === dailyChallengeDateKey(date);
}

export function buildDailyMissionSnapshot({ date = new Date(), practice = {}, challenge = null } = {}) {
  const practiceStats = /** @type {{recent?: Array<{at?: string, correct?: boolean}>}} */ (practice);
  const recent = Array.isArray(practiceStats.recent) ? practiceStats.recent : [];
  const todayRows = recent.filter((row) => sameLocalDay(row?.at, date));
  const decisions = todayRows.length;
  const correct = todayRows.filter((row) => row?.correct).length;
  const challengeDone = Boolean(challenge?.completed && challenge?.date === dailyChallengeDateKey(date));

  const missions = [
    {
      id: "five-decisions",
      title: "Play five training decisions",
      detail: `${Math.min(decisions, 5)}/5 decisions today`,
      progress: Math.min(decisions, 5),
      goal: 5,
      complete: decisions >= 5,
      route: "/practice/video-poker?drill=5",
    },
    {
      id: "three-correct",
      title: "Make three exact holds",
      detail: `${Math.min(correct, 3)}/3 correct decisions`,
      progress: Math.min(correct, 3),
      goal: 3,
      complete: correct >= 3,
      route: "/practice/video-poker?drill=5",
    },
    {
      id: "daily-challenge",
      title: "Finish today’s card challenge",
      detail: challengeDone ? `${challenge.score}/${challenge.total} correct` : "Five quick hand-ID questions",
      progress: challengeDone ? 1 : 0,
      goal: 1,
      complete: challengeDone,
      route: "/daily-challenge",
    },
  ];

  const completed = missions.filter((mission) => mission.complete).length;
  return {
    missions,
    completed,
    total: missions.length,
    percent: Math.round((completed / missions.length) * 100),
  };
}
