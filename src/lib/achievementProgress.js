export const ACHIEVEMENT_DEFINITIONS = [
  { id: "first-lesson", title: "First Lesson", desc: "Complete your first lesson.", type: "lessons", value: 1 },
  { id: "suit-spotter", title: "Suit Spotter", desc: "Complete six core lessons.", type: "lessons", value: 6 },
  { id: "pair-pro", title: "Pair Pro", desc: "Complete six core lessons and keep building matching skills.", type: "lessons", value: 6 },
  { id: "rank-ranger", title: "Rank Ranger", desc: "Complete seven core lessons.", type: "lessons", value: 7 },
  { id: "hand-historian", title: "Hand Historian", desc: "Complete ten core lessons.", type: "lessons", value: 10 },
  { id: "job-graduate", title: "Jacks or Better Graduate", desc: "Complete thirteen core lessons.", type: "lessons", value: 13 },
  { id: "ten-holds", title: "Ten Exact Holds", desc: "Make 10 correct hold decisions.", type: "holds", value: 10 },
  { id: "fifty-holds", title: "Fifty Exact Holds", desc: "Make 50 correct hold decisions.", type: "holds", value: 50 },
  { id: "mistake-master", title: "Mistake Master", desc: "Replay 10 saved mistakes.", type: "reviews", value: 10 },
  { id: "streak-7", title: "Seven-Day Streak", desc: "Learn on 7 days in a row.", type: "streak", value: 7 },
  { id: "academy-first", title: "Academy Graduate", desc: "Complete your first Academy rule practice.", type: "courses", value: 1 },
];

export function buildAchievementProgress({ lessonsDone = 0, practice = {}, profile = {}, mistakes = [], academyCompleted = [] } = {}) {
  const practiceStats = /** @type {{correct?: number}} */ (practice);
  const learnerProfile = /** @type {{streak?: number}} */ (profile);
  const values = {
    lessons: Math.max(0, Number(lessonsDone) || 0),
    holds: Math.max(0, Number(practiceStats.correct) || 0),
    reviews: Array.isArray(mistakes) ? mistakes.filter((mistake) => Boolean(mistake?.reviewedAt)).length : 0,
    streak: Math.max(0, Number(learnerProfile.streak) || 0),
    courses: Array.isArray(academyCompleted) ? new Set(academyCompleted).size : 0,
  };

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = values[definition.type] || 0;
    return {
      ...definition,
      progress,
      earned: progress >= definition.value,
      percent: Math.min(100, Math.round((progress / definition.value) * 100)),
    };
  });
}
