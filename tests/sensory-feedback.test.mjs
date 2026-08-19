import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as sensory from "../src/lib/haptics.js";

const read = (path) => {
  const url = new URL(`../${path}`, import.meta.url);
  return fs.existsSync(url) ? fs.readFileSync(url, "utf8") : "";
};

test("sensory feedback exposes a sound-effects transport", () => {
  assert.equal(typeof sensory.playSoundEffect, "function");
});

function makeAudioScope({ state = "running" } = {}) {
  const events = { contexts: 0, resumes: 0, frequencies: [], starts: [], stops: [] };
  class AudioContext {
    constructor() {
      events.contexts += 1;
      this.currentTime = 10;
      this.destination = {};
      this.state = state;
    }
    resume() { events.resumes += 1; this.state = "running"; }
    createOscillator() {
      return {
        type: "sine",
        frequency: { setValueAtTime: (value) => events.frequencies.push(value) },
        connect: () => {},
        start: (time) => events.starts.push(Number(time.toFixed(2))),
        stop: (time) => events.stops.push(Number(time.toFixed(2))),
      };
    }
    createGain() {
      return {
        gain: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: () => {},
      };
    }
  }
  return { scope: { AudioContext }, events };
}

test("selection sound schedules a short low-volume Web Audio tone", () => {
  const { scope, events } = makeAudioScope();

  assert.equal(sensory.playSoundEffect(true, "selection", scope), true);
  assert.equal(events.contexts, 1);
  assert.deepEqual(events.frequencies, [460]);
  assert.deepEqual(events.starts, [10]);
  assert.deepEqual(events.stops, [10.08]);
});

test("sound effects reuse one audio context across repeated controls", () => {
  const { scope, events } = makeAudioScope();

  sensory.playSoundEffect(true, "selection", scope);
  sensory.playSoundEffect(true, "selection", scope);

  assert.equal(events.contexts, 1);
  assert.equal(events.starts.length, 2);
});

test("sound effects resume a suspended iPhone audio context", () => {
  const { scope, events } = makeAudioScope({ state: "suspended" });

  assert.equal(sensory.playSoundEffect(true, "selection", scope), true);
  assert.equal(events.resumes, 1);
  assert.equal(events.starts.length, 1);
});

test("deal sound uses a soft two-note card flick", () => {
  const { scope, events } = makeAudioScope();

  assert.equal(sensory.playSoundEffect(true, "deal", scope), true);
  assert.deepEqual(events.frequencies, [330, 410]);
  assert.deepEqual(events.starts, [10, 10.04]);
  assert.deepEqual(events.stops, [10.07, 10.12]);
});

test("success sound rises through a restrained two-note chime", () => {
  const { scope, events } = makeAudioScope();

  assert.equal(sensory.playSoundEffect(true, "success", scope), true);
  assert.deepEqual(events.frequencies, [620, 820]);
  assert.deepEqual(events.starts, [10, 10.07]);
  assert.deepEqual(events.stops, [10.09, 10.21]);
});

test("warning sound falls without becoming a harsh alarm", () => {
  const { scope, events } = makeAudioScope();

  assert.equal(sensory.playSoundEffect(true, "warning", scope), true);
  assert.deepEqual(events.frequencies, [260, 190]);
  assert.deepEqual(events.starts, [10, 10.09]);
  assert.deepEqual(events.stops, [10.12, 10.27]);
});

test("muted sound creates no audio context", () => {
  const { scope, events } = makeAudioScope();

  assert.equal(sensory.playSoundEffect(false, "success", scope), false);
  assert.equal(events.contexts, 0);
  assert.equal(events.starts.length, 0);
});

test("shared tactile controls honor the persisted sound setting", () => {
  const tactile = read("src/components/premium/TactilePressable.jsx");
  const context = read("src/lib/appContext.jsx");

  assert.match(context, /soundEffects:\s*true/);
  assert.match(tactile, /playSoundEffect/);
  assert.match(tactile, /soundType\s*\|\|\s*hapticType/);
  assert.match(tactile, /settings\.soundEffects\s*!==\s*false/);
});

test("visible sensory controls can mute sound and haptics", () => {
  const controls = read("src/components/premium/SensoryControls.jsx");
  const lobby = read("src/pages/CardAcademyLobby.jsx");
  const shell = read("src/components/games/GameShell.jsx");
  const tutorial = read("src/pages/GameTutorial.jsx");
  const challenge = read("src/pages/DailyChallengeHub.jsx");

  assert.match(controls, /Turn sound effects (?:on|off)/);
  assert.match(controls, /Turn haptics (?:on|off)/);
  assert.match(controls, /setSettings/);
  assert.match(controls, /setAccessibility/);
  assert.match(lobby, /SensoryControls/);
  assert.match(shell, /SensoryControls/);
  assert.match(tutorial, /SensoryControls/);
  assert.match(challenge, /SensoryControls/);
});

test("cinematic backdrop presents six animated glass playing cards", () => {
  const backdrop = read("src/components/premium/CinematicBackdrop.jsx");
  const css = read("src/index.css");

  for (const id of ["ace-spades", "queen-hearts", "king-clubs", "ten-diamonds", "seven-spades", "joker-star"]) {
    assert.match(backdrop, new RegExp(id));
  }
  assert.match(backdrop, /hw-floating-card/);
  assert.match(css, /@keyframes hw-floating-card/);
  assert.match(css, /\.reduce-motion \.hw-floating-card/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*\.hw-floating-card/);
});

test("direct card and navigation controls also produce sensory feedback", () => {
  for (const path of ["src/components/PlayingCard.jsx", "src/components/BottomNav.jsx", "src/pages/PracticeVP.jsx"]) {
    const source = read(path);
    assert.match(source, /playSoundEffect/, path);
    assert.match(source, /settings\.soundEffects\s*!==\s*false/, path);
  }
});

test("daily challenge answers map wins and misses to semantic feedback", () => {
  const source = read("src/pages/DailyChallengeHub.jsx");

  assert.match(source, /hapticType=\{correct\s*\?\s*'success'\s*:\s*'warning'\}/);
  assert.match(source, /soundType=\{correct\s*\?\s*'success'\s*:\s*'warning'\}/);
});

test("high-value full-game deal controls use the card-flick sound", () => {
  for (const path of [
    "src/components/games/BlackjackTable.jsx",
    "src/components/games/VideoPokerTable.jsx",
    "src/components/games/HoldemTable.jsx",
    "src/components/games/SolitaireTable.jsx",
  ]) {
    assert.match(read(path), /soundType=["']deal["']/, path);
  }
});
