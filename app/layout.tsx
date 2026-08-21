import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyTestGo",
  description: "Study chapters with flashcards, a matching game, and tests.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
