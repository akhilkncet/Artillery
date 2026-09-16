/**
 * Deterministic pseudo-random generation, seeded from a string.
 * Same seed always produces the same sequence, so identical configurations
 * always produce identical simulation results.
 */

export function hashStringToSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// mulberry32 PRNG — small, fast, deterministic for a given 32-bit seed.
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns a value in [-1, 1] from a [0, 1) random source. */
export function toSignedUnit(randomValue: number): number {
  return randomValue * 2 - 1;
}
