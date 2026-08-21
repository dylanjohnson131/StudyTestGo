"use client";

import { useState, type ReactNode } from "react";
import type { Term, TermResult, TestAttempt } from "@/lib/types";
import Flashcards from "./Flashcards";
import MatchingGame from "./MatchingGame";
import TestRunner from "./TestRunner";
import TestHistory from "./TestHistory";
import ProgressBar from "./ProgressBar";

type Tab = "terms" | "flashcards" | "match" | "test" | "progress";

export default function StudyTabs({
  terms,
  testAttempts,
  onReviewed,
  onSubmitTest,
  termsEditor,
}: {
  terms: Term[];
  testAttempts: TestAttempt[];
  onReviewed: () => Promise<void>;
  onSubmitTest: (score: number, total: number, termResults: TermResult[]) => Promise<void>;
  termsEditor?: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>(termsEditor ? "terms" : "flashcards");

  const mastery = {
    new: terms.filter((t) => t.mastery === "new").length,
    learning: terms.filter((t) => t.mastery === "learning").length,
    known: terms.filter((t) => t.mastery === "known").length,
    total: terms.length,
  };

  const tabs: { key: Tab; label: string }[] = [
    ...(termsEditor ? [{ key: "terms" as const, label: "Terms" }] : []),
    { key: "flashcards", label: "Flashcards" },
    { key: "match", label: "Match" },
    { key: "test", label: "Test" },
    { key: "progress", label: "Progress" },
  ];

  return (
    <div className="study-tabs">
      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tab-panel">
        {tab === "terms" && termsEditor}
        {tab === "flashcards" && <Flashcards terms={terms} onReviewed={onReviewed} />}
        {tab === "match" && <MatchingGame terms={terms} />}
        {tab === "test" && <TestRunner terms={terms} onSubmit={onSubmitTest} />}
        {tab === "progress" && (
          <div className="progress-tab">
            <ProgressBar mastery={mastery} />
            <h3>Test history</h3>
            <TestHistory attempts={testAttempts} />
          </div>
        )}
      </div>
    </div>
  );
}
