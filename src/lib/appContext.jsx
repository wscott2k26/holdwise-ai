import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";

// Global app context: profile, accessibility, theme, premium, coach usage.
// Guest progress is stored in localStorage; registered users sync via entities.

const STORAGE_KEY = "holdwise_state_v1";
const CLOUD_LOCAL_KEYS = {
  lessonProgress: "holdwise_lesson_progress_v1",
  practiceStats: "holdwise_vp_stats_v1",
  mistakes: "holdwise_mistakes_v1",
  handCount: "holdwise_vp_handcount_v1",
};

function readLocalJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

function writeLocalJson(key, value) {
  if (value !== undefined && value !== null) localStorage.setItem(key, JSON.stringify(value));
}


const defaultAccessibility = {
  largeCardMode: false,
  highContrast: false,
  colorBlindSuitIndicators: true,
  reducedMotion: false,
  haptics: true,
  plainLanguage: false,
  leftHanded: false,
  dynamicTextSize: "medium",
  rankNarration: false,
};

const defaultSettings = {
  voiceEnabled: "ask-later", // enabled | text-only | ask-later
  theme: "light",
  mascot: "ace", // mascot id | "none"
  notifications: {
    dailyLesson: true,
    streakReminder: true,
    newCourse: false,
    weeklySummary: true,
  },
};

const defaultProfile = {
  displayName: "Guest",
  avatar: "ace",
  ageConfirmed: false,
  skillLevel: "new-to-cards", // new-to-cards | knows-cards | knows-poker | improve-vp | other-games
  learningStyle: "mixture", // simple | visual | practice | math | mixture
  onboardingComplete: false,
  level: "New Learner",
  learningPoints: 0,
  streak: 0,
  lastActiveDate: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const persisted = loadState();
  const [profile, setProfile] = useState(persisted?.profile || defaultProfile);
  const [accessibility, setAccessibility] = useState(persisted?.accessibility || defaultAccessibility);
  const [settings, setSettings] = useState(persisted?.settings || defaultSettings);
  const [premium, setPremium] = useState({ status: "free", platform: null, productId: null, verified: false });
  const [coachUsage, setCoachUsage] = useState(() => {
    const saved = persisted?.coachUsage;
    return saved?.date === today() ? saved : { date: today(), count: 0 };
  });
  const [mascotState, setMascotState] = useState({ mood: "idle", message: null, at: 0 });
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const cloudRecordId = useRef(null);
  const cloudHydrated = useRef(false);

  // Show a mascot reaction, then ease back to idle. Optional message overrides the mascot line.
  const setMascotMood = (mood, message = null, holdMs = 2600) => {
    setMascotState({ mood, message, at: Date.now() });
    if (holdMs > 0) {
      setTimeout(() => setMascotState((s) => (s.mood === mood ? { mood: "idle", message: null, at: Date.now() } : s)), holdMs);
    }
  };

  // Apply theme + accessibility to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", settings.theme === "dark");
    root.classList.toggle("light", settings.theme === "light");
    root.style.setProperty("--hw-large-card", accessibility.largeCardMode ? "1" : "0");
    root.style.setProperty("--hw-text-scale", textScale(accessibility.dynamicTextSize));
    if (accessibility.reducedMotion) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");
    if (accessibility.highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");
    if (accessibility.leftHanded) root.classList.add("left-handed");
    else root.classList.remove("left-handed");
  }, [settings.theme, accessibility]);

  // Persist locally (guest progress).
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, accessibility, settings, coachUsage }));
  }, [profile, accessibility, settings, coachUsage]);

  // Reset daily coach usage.
  useEffect(() => {
    if (coachUsage.date !== today()) setCoachUsage({ date: today(), count: 0 });
  }, [coachUsage]);

  // Auth init.
  useEffect(() => {
    let active = true;
    base44.auth
      .isAuthenticated()
      .then((ok) => {
        if (!active) return;
        if (ok) {
          base44.auth
            .me()
            .then((u) => { if (active) setUser(u); })
            .catch(() => {})
            .finally(() => active && setAuthReady(true));
        } else {
          setAuthReady(true);
        }
      })
      .catch(() => setAuthReady(true));
    return () => (active = false);
  }, []);

  // Hydrate registered learners from one cloud state record, then keep the
  // local-first experience synchronized in the background.
  useEffect(() => {
    if (!user?.id) { cloudHydrated.current = false; cloudRecordId.current = null; return undefined; }
    let active = true;
    (async () => {
      try {
        const records = await base44.entities.LearningState.filter({ userId: user.id });
        if (!active) return;
        const record = records?.[0];
        if (record) {
          cloudRecordId.current = record.id;
          if (record.profile) setProfile((current) => ({ ...current, ...record.profile }));
          if (record.accessibility) setAccessibility((current) => ({ ...current, ...record.accessibility }));
          if (record.settings) setSettings((current) => ({ ...current, ...record.settings }));
          if (record.coachUsage?.date) setCoachUsage(record.coachUsage);
          for (const [field, key] of Object.entries(CLOUD_LOCAL_KEYS)) writeLocalJson(key, record[field]);
        }
      } catch {
        // Local mode remains fully usable when cloud sync is temporarily unavailable.
      } finally {
        if (active) cloudHydrated.current = true;
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let stopped = false;
    async function syncNow() {
      if (stopped || !cloudHydrated.current) return;
      const payload = {
        userId: user.id,
        profile,
        accessibility,
        settings,
        coachUsage,
        lessonProgress: readLocalJson(CLOUD_LOCAL_KEYS.lessonProgress, {}),
        practiceStats: readLocalJson(CLOUD_LOCAL_KEYS.practiceStats, {}),
        mistakes: readLocalJson(CLOUD_LOCAL_KEYS.mistakes, []),
        handCount: readLocalJson(CLOUD_LOCAL_KEYS.handCount, {}),
        updatedAt: new Date().toISOString(),
      };
      try {
        if (cloudRecordId.current) {
          await base44.entities.LearningState.update(cloudRecordId.current, payload);
        } else {
          const created = await base44.entities.LearningState.create(payload);
          cloudRecordId.current = created?.id || null;
        }
      } catch {
        // The next scheduled pass retries without interrupting the learner.
      }
    }
    const debounce = window.setTimeout(syncNow, 1800);
    const interval = window.setInterval(syncNow, 20000);
    const onVisibility = () => { if (document.visibilityState === "hidden") syncNow(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { stopped = true; window.clearTimeout(debounce); window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisibility); };
  }, [user?.id, profile, accessibility, settings, coachUsage]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      authReady,
      profile,
      setProfile,
      accessibility,
      setAccessibility,
      settings,
      setSettings,
      premium,
      setPremium,
      coachUsage,
      mascotState,
      setMascotMood,
      incrementCoach: () => setCoachUsage((c) => ({ date: today(), count: c.count + 1 })),
      resetCoach: () => setCoachUsage({ date: today(), count: 0 }),
      isPremium: premium.status === "active" || premium.status === "lifetime",
      canAskCoach: () => {
        if (premium.status === "active" || premium.status === "lifetime") return true;
        return coachUsage.count < 5;
      },
      remainingCoachQuestions:
        premium.status === "active" || premium.status === "lifetime"
          ? Infinity
          : Math.max(0, 5 - coachUsage.count),
      addPoints: (n) => setProfile((p) => ({ ...p, learningPoints: p.learningPoints + n })),
      bumpStreak: () =>
        setProfile((p) => {
          const t = today();
          if (p.lastActiveDate === t) return p;
          const yesterday = addDays(t, -1);
          const streak = p.lastActiveDate === yesterday ? p.streak + 1 : 1;
          return { ...p, streak, lastActiveDate: t };
        }),
    }),
    [user, authReady, profile, accessibility, settings, premium, coachUsage, mascotState]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function today() {
  return formatLocalDate(new Date());
}
function addDays(dateStr, n) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + n);
  return formatLocalDate(date);
}
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function textScale(size) {
  return { small: "0.92", medium: "1", large: "1.12", xlarge: "1.25" }[size] || "1";
}
