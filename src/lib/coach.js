// Coach Ace AI tutor.
// The AI receives STRUCTURED VERIFIED FACTS from the app and may only explain
// them. It never invents rules, payouts, probabilities, or holds.

import { base44 } from "@/api/base44Client";
import { describeHand } from "./cards/handEvaluator.js";

const SYSTEM_PROMPT = `You are Coach Ace, a patient adult-learning card-game instructor. Explain only the verified rules and strategy facts supplied by the application. Never invent a rule, payout, probability, or recommended hold. Never promise financial success. Keep explanations respectful, beginner-friendly and concise unless the user requests more detail. When the user is confused, use a simple analogy and one concrete card example. If something is not in the supplied facts, say you will keep to the facts you have and suggest a lesson.`;

export function buildTutorContext({
  contextType = null,
  lesson = null,
  cards = null,
  userHoldMask = null,
  recommended = null,
  handResult = null,
  payTable = null,
  mistakeCategory = null,
  skillLevel = "new-to-cards",
  explanationLevel = "simple",
  userQuestion = null,
} = {}) {
  const facts = [];
  if (contextType === "practice" && cards) {
    facts.push(`Dealt cards: ${cards.map((c) => c.label).join(", ")}.`);
    if (userHoldMask) {
      const held = cards.filter((c, i) => userHoldMask[i]).map((c) => c.label);
      facts.push(`User held: ${held.length ? held.join(", ") : "nothing (redrew all)"}.`);
    }
    if (recommended) {
      const rec = cards.filter((c, i) => recommended.holdMask[i]).map((c) => c.label);
      facts.push(`Verified recommended hold: ${rec.length ? rec.join(", ") : "discard all"}.`);
      facts.push(`Strategy category: ${recommended.category}.`);
      facts.push(`Verified reason: ${recommended.reason}.`);
      if (recommended.mathReason) facts.push(`Verified math explanation: ${recommended.mathReason}`);
      facts.push(`Strategy version: ${recommended.strategyVersion}. Source: ${recommended.source}.`);
    }
    if (handResult) {
      facts.push(`Final hand category: ${describeHand(handResult)}.`);
    }
    if (payTable) {
      facts.push(`Pay table: ${payTable.name} (${payTable.version}).`);
    }
    if (mistakeCategory) {
      facts.push(`Mistake category: ${mistakeCategory}.`);
    }
  }
  if (contextType === "lesson" && lesson) {
    facts.push(`Lesson: ${lesson.title}.`);
    if (lesson.objectives) facts.push(`Objectives: ${lesson.objectives.join("; ")}.`);
    if (lesson.contentBlocks) {
      facts.push(`Lesson content: ${lesson.contentBlocks.map((b) => b.text).join(" ")}`);
    }
  }
  return {
    contextType,
    skillLevel,
    explanationLevel,
    facts,
    userQuestion,
  };
}

const EXPLANATION_PROMPTS = {
  simple: "Explain this in the simplest words you can, like to a brand-new adult learner.",
  visual: "Describe this as a clear mental picture with one concrete card example.",
  math: "Explain the math and probability reasoning behind the verified fact, clearly and honestly, without inventing numbers.",
  example: "Give another concrete card example that illustrates the same idea.",
  another: "Give another concrete card example that illustrates the same idea.",
};

export async function askCoachAce({ context, mode, question }) {
  const modeInstruction = mode ? EXPLANATION_PROMPTS[mode] || "" : "";
  const questionPart = question || context?.userQuestion || "Explain what is happening here.";
  const factsText = (context?.facts || []).join("\n");
  const skillLine = context?.skillLevel
    ? `Adapt to the user's level: ${context.skillLevel}.`
    : "Adapt to a beginner.";
  const levelLine = context?.explanationLevel
    ? `Explanation level requested: ${context.explanationLevel}.`
    : "";

  const prompt = `${SYSTEM_PROMPT}

${skillLine}
${levelLine}

VERIFIED FACTS YOU MAY USE:
${factsText}

USER REQUEST: ${questionPart}
${modeInstruction ? `MODE: ${modeInstruction}` : ""}

Respond as Coach Ace in 2-4 short friendly sentences. Stick strictly to the verified facts above.`;

  try {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: "gemini_3_flash",
    });
    return { ok: true, text: typeof res === "string" ? res : res?.output || res?.text || JSON.stringify(res) };
  } catch (e) {
    return {
      ok: false,
      text:
        "Coach Ace is temporarily unavailable, but your card lesson and practice table still work. Here are the verified facts:\n" +
        factsText,
    };
  }
}
