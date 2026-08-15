const registry = new Map();

export function registerEngine(engine) {
  if (!engine?.id || typeof engine.createGame !== 'function') throw new Error('A game engine must provide id and createGame');
  registry.set(engine.id, engine);
  return engine;
}

export function getEngine(id) { return registry.get(id) || null; }
export function hasEngine(id) { return registry.has(id); }
export function listRegisteredEngines() { return [...registry.keys()]; }
