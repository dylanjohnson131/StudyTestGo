import type { Term } from "./types";

const MASTERY_WEIGHT: Record<Term["mastery"], number> = {
  new: 3,
  learning: 2,
  known: 1,
};

/** Random ordering without replacement, biased toward terms that are less well known
 * (New > Learning > Known) via the Efraimidis-Spirakis weighted sampling algorithm.
 * Every term is still included exactly once — this only affects likely position/selection. */
export function weightedShuffle(terms: Term[]): Term[] {
  return terms
    .map((t) => ({ t, key: Math.random() ** (1 / MASTERY_WEIGHT[t.mastery]) }))
    .sort((a, b) => b.key - a.key)
    .map(({ t }) => t);
}

/** Weighted sample of `count` terms without replacement, biased toward weaker terms. */
export function weightedSample(terms: Term[], count: number): Term[] {
  return weightedShuffle(terms).slice(0, count);
}
