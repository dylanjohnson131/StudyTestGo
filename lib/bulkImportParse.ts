export interface ParsedEntry {
  term: string;
  definition: string;
}

export interface FailedLine {
  line: string;
  lineNumber: number;
}

export interface ParseResult {
  entries: ParsedEntry[];
  failed: FailedLine[];
}

function splitLine(line: string): [string, string] | null {
  if (line.includes("\t")) {
    const i = line.indexOf("\t");
    return [line.slice(0, i), line.slice(i + 1)];
  }
  for (const sep of [" - ", " – ", ": "]) {
    if (line.includes(sep)) {
      const i = line.indexOf(sep);
      return [line.slice(0, i), line.slice(i + sep.length)];
    }
  }
  return null;
}

/** Parses pasted text into term/definition pairs. Each non-blank line is one
 * entry; term and definition are split on the first tab, " - ", " – ", or ": "
 * found (tab-separated is what spreadsheets and Quizlet paste as). */
export function parseBulkImport(raw: string): ParseResult {
  const entries: ParsedEntry[] = [];
  const failed: FailedLine[] = [];

  const lines = raw.split(/\r\n|\r|\n/);
  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    const split = splitLine(line);
    if (!split) {
      failed.push({ line, lineNumber: idx + 1 });
      return;
    }
    const term = split[0].trim();
    const definition = split[1].trim();
    if (!term || !definition) {
      failed.push({ line, lineNumber: idx + 1 });
      return;
    }
    entries.push({ term, definition });
  });

  return { entries, failed };
}
