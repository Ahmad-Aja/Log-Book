"use client";

// Matches Arabic and Arabic-Extended unicode blocks
const ARABIC_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

interface Segment {
  text: string;
  arabic: boolean;
}

function splitMixed(text: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;

  for (const match of text.matchAll(ARABIC_RE)) {
    const idx = match.index!;
    if (idx > last) {
      segments.push({ text: text.slice(last, idx), arabic: false });
    }
    segments.push({ text: match[0], arabic: true });
    last = idx + match[0].length;
  }

  if (last < text.length) {
    segments.push({ text: text.slice(last), arabic: false });
  }

  return segments;
}

interface MixedTextProps {
  text: string | null | undefined;
  className?: string;
}

export function MixedText({ text, className }: MixedTextProps) {
  if (!text) return null;

  const segments = splitMixed(text);

  return (
    <span className={className}>
      {segments.map((seg, i) => (
        <span
          key={i}
          style={{
            fontFamily: seg.arabic
              ? "var(--font-itfQomraArabic), sans-serif"
              : "var(--font-poppins), Poppins, sans-serif",
          }}
        >
          {seg.text}
        </span>
      ))}
    </span>
  );
}
