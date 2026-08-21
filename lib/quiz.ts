import type { Term } from "./types";

export type QuizDirection = "term-to-definition" | "definition-to-term";

export interface QuizQuestion {
  termId: string;
  direction: QuizDirection;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Builds a multiple-choice quiz from a pool of terms. Each question shows either
 * the term or its definition (direction is randomized) with up to 4 options. */
export function buildQuiz(terms: Term[]): QuizQuestion[] {
  const selected = shuffle(terms);

  return selected.map((t) => {
    const direction: QuizDirection = Math.random() < 0.5 ? "term-to-definition" : "definition-to-term";
    const prompt = direction === "term-to-definition" ? t.term : t.definition;
    const correctAnswer = direction === "term-to-definition" ? t.definition : t.term;

    const distractors = shuffle(terms.filter((other) => other.id !== t.id))
      .slice(0, 3)
      .map((d) => (direction === "term-to-definition" ? d.definition : d.term));

    const options = shuffle([correctAnswer, ...distractors]);

    return { termId: t.id, direction, prompt, options, correctAnswer };
  });
}

export const MIN_TERMS_FOR_TEST = 2;
