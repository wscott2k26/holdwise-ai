import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("premium visual primitives exist and expose the locked material system", () => {
  for (const file of [
    "src/components/premium/CinematicBackdrop.jsx",
    "src/components/premium/GlassSurface.jsx",
    "src/components/premium/TactilePressable.jsx",
    "src/components/premium/ScreenReveal.jsx",
    "src/components/premium/MasteryMeter.jsx",
  ]) assert.equal(fs.existsSync(path.join(root, file)), true, file);

  const css = read("src/index.css");
  for (const token of ["hw-glass-1", "hw-glass-2", "hw-glass-3", "hw-glass-4", "hw-glass-5", "hw-tactile-depth", "prefers-reduced-motion"]) {
    assert.match(css, new RegExp(token));
  }
});

test("new tactile controls keep a 44px minimum target", () => {
  const tactile = read("src/components/premium/TactilePressable.jsx");
  assert.match(tactile, /min-h-\[44px\]/);
  assert.match(tactile, /min-w-\[44px\]/);
});

test("native shell exposes only semantic HoldWise haptic messages", () => {
  const swift = read("native/ios/HoldWiseAI/Sources/HoldWiseWebViewController.swift");
  assert.match(swift, /holdwiseHaptics/);
  assert.match(swift, /WKScriptMessageHandler/);
  for (const token of ["selectionChanged", "notificationOccurred\\(\\.success\\)", "notificationOccurred\\(\\.warning\\)"]) assert.match(swift, new RegExp(token));
});

test("authenticated shell uses cinematic backdrop and keeps five navigation destinations", () => {
  const layout = read("src/components/AppLayout.jsx");
  const nav = read("src/components/BottomNav.jsx");
  assert.match(layout, /CinematicBackdrop/);
  assert.match(nav, /GlassSurface/);
  for (const route of ["/home", "/learn", "/practice/video-poker", "/academy", "/profile"]) assert.match(nav, new RegExp(route.replaceAll("/", "\\/")));
});

test("premium onboarding keeps exactly three scenes and existing destination", () => {
  const source = read("src/pages/Onboarding.jsx");
  assert.match(source, /GOALS/);
  assert.match(source, /STYLES/);
  assert.match(source, /VOICE/);
  assert.match(source, /navigate\("\/assessment"\)/);
  assert.match(source, /TactilePressable/);
  assert.match(source, /GlassSurface/);
});

test("Home uses the shared premium mastery system", () => {
  const source = read("src/pages/Home.jsx");
  assert.match(source, /MasteryMeter/);
  assert.match(source, /buildMasterySnapshot/);
  assert.match(source, /Practice a Hand/);
});

test("trainer preserves verified strategy calls while adopting premium primitives", () => {
  const source = read("src/pages/PracticeVP.jsx");
  assert.match(source, /getStrategyRecommendation/);
  assert.match(source, /recordPracticeDecision/);
  assert.match(source, /TactilePressable/);
  assert.match(source, /GlassSurface/);
  assert.match(source, /Coach reveal|Coach Reveal/);
  const card = read("src/components/PlayingCard.jsx");
  assert.doesNotMatch(card, /-bottom-6/);
});

test("Coach Ace keeps grounded facts and premium teaching controls", () => {
  const source = read("src/components/CoachAcePanel.jsx");
  assert.match(source, /context\?\.facts/);
  assert.match(source, /askCoachAce/);
  assert.match(source, /What I know about this hand/);
  assert.match(source, /GlassSurface/);
  assert.match(source, /min-h-\[44px\]/);
});

test("Statistics is grouped as a coaching dashboard", () => {
  const source = read("src/pages/Statistics.jsx");
  assert.match(source, /MasteryMeter/);
  assert.match(source, /Next best focus/);
  for (const label of ["Momentum", "Strength", "Focus", "Table familiarity", "Weekly focus"]) assert.match(source, new RegExp(label));
  assert.match(source, /PremiumGate/);
});

test("luxury card-room palette and glass playing cards are locked into source", () => {
  const css = read("src/index.css");
  for (const token of ["--hw-obsidian", "--hw-midnight-teal", "--hw-emerald", "--hw-champagne", "--hw-victory-gold", "hw-glass-card", "hw-lux-button"]) {
    assert.match(css, new RegExp(token));
  }
  const card = read("src/components/PlayingCard.jsx");
  assert.match(card, /hw-glass-card/);
  assert.match(card, /hw-glass-card-held/);
});

test("top-card-game retention patterns are adapted as educational missions, badges, and a five-hand drill", () => {
  const home = read("src/pages/Home.jsx");
  const achievements = read("src/pages/Achievements.jsx");
  const trainer = read("src/pages/PracticeVP.jsx");
  assert.match(home, /Academy Missions/);
  assert.match(home, /buildDailyMissionSnapshot/);
  assert.match(achievements, /buildAchievementProgress/);
  assert.match(achievements, /Badge Case/);
  assert.match(trainer, /drillGoal/);
  assert.match(trainer, /Focus Drill/);
});
