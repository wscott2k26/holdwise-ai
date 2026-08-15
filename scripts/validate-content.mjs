import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ACADEMY_GAMES, gameContent, gameQuiz, guidedDecision } from "../src/lib/academy.js";
import { allLessonsFlat } from "../src/lib/lessons.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
if (ACADEMY_GAMES.length !== 34) failures.push(`Expected 34 Academy games; found ${ACADEMY_GAMES.length}`);
for (const game of ACADEMY_GAMES) {
  if (!game.published) failures.push(`Game is not published: ${game.id}`);
  const content = gameContent(game.id);
  if (!content) { failures.push(`Game lacks content: ${game.id}`); continue; }
  if ((content.lessons?.length || 0) < 5) failures.push(`Game lacks five lessons: ${game.id}`);
  if ((content.guidedSteps?.length || 0) < 4) failures.push(`Game lacks guided phases: ${game.id}`);
  if (gameQuiz(game.id).length !== 5) failures.push(`Game lacks five-question quiz: ${game.id}`);
  const decision = guidedDecision(game.id, 0);
  if (!decision?.options?.includes(decision.answer)) failures.push(`Game lacks valid guided decision: ${game.id}`);
}
const lessonIds = allLessonsFlat().map((lesson) => lesson.id);
if (new Set(lessonIds).size !== lessonIds.length) failures.push("Duplicate lesson IDs found");

const appText = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");
for (const match of appText.matchAll(/from ['"](@\/[^'"]+|\.\/[^'"]+)['"]/g)) {
  const spec = match[1].replace(/^@\//, "src/").replace(/^\.\//, "src/");
  const candidates = [spec, `${spec}.js`, `${spec}.jsx`, `${spec}.ts`, `${spec}.tsx`].map((item) => path.join(root, item));
  if (!candidates.some((candidate) => fs.existsSync(candidate))) failures.push(`Missing App import: ${match[1]}`);
}

if (!fs.existsSync(path.join(root, "native/ios/HoldWiseAI/Sources/HoldWiseStoreKitBridge.swift"))) failures.push("Missing iOS StoreKit bridge");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Validated 34 complete Academy games, ${lessonIds.length} core lessons, StoreKit bridge, and App route imports.`);
