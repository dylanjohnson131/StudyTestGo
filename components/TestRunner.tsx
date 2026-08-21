"use client";

import { useState } from "react";
import type { Term, TermResult } from "@/lib/types";
import { buildQuiz, MIN_TERMS_FOR_TEST, type QuizQuestion } from "@/lib/quiz";

type Phase = "running" | "submitting" | "done";

export default function TestRunner({
  terms,
  onSubmit,
}: {
  terms: Term[];
  onSubmit: (score: number, total: number, termResults: TermResult[]) => Promise<void>;
}) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>(() => buildQuiz(terms));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<TermResult[]>([]);
  const [phase, setPhase] = useState<Phase>("running");

  const question = quiz[index];

  function handleSelect(option: string) {
    if (selected) return;
    setSelected(option);
    const correct = option === question.correctAnswer;
    const nextResults = [...results, { termId: question.termId, correct }];
    setResults(nextResults);

    setTimeout(async () => {
      if (index + 1 < quiz.length) {
        setIndex((i) => i + 1);
        setSelected(null);
      } else {
        setPhase("submitting");
        const score = nextResults.filter((r) => r.correct).length;
        await onSubmit(score, quiz.length, nextResults);
        setPhase("done");
      }
    }, 700);
  }

  function retake() {
    setQuiz(buildQuiz(terms));
    setIndex(0);
    setSelected(null);
    setResults([]);
    setPhase("running");
  }

  if (terms.length < MIN_TERMS_FOR_TEST) {
    return <p className="muted">Add at least {MIN_TERMS_FOR_TEST} terms to take a test.</p>;
  }

  if (phase === "done") {
    const score = results.filter((r) => r.correct).length;
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="test-done">
        <p className="test-score">
          {score} / {quiz.length} correct ({pct}%)
        </p>
        <button className="btn btn-primary" onClick={retake}>
          Retake test
        </button>
      </div>
    );
  }

  return (
    <div className="test-runner">
      <div className="test-progress">
        Question {index + 1} / {quiz.length}
      </div>
      <div className="test-question">{question.prompt}</div>
      <div className="test-options">
        {question.options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === question.correctAnswer;
          const showState = selected !== null && (isSelected || isCorrect);
          return (
            <button
              key={option}
              className={`test-option ${showState ? (isCorrect ? "correct" : "incorrect") : ""}`}
              onClick={() => handleSelect(option)}
              disabled={selected !== null || phase === "submitting"}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
