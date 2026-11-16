/**
 * Renders a formatted number with tabular digits (DESIGN.md §3) but proportional separators.
 * Schibsted Grotesk's `tnum` also widens "." and ",", which reads as "$62 . 32"; wrapping
 * separators in `.num-sep` (font-variant-numeric: normal) keeps digits aligned without the gaps.
 */
const SEP = /([.,  '’\s])/;

export function splitNumber(text: string): { text: string; sep: boolean }[] {
  return text
    .split(SEP)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, sep: SEP.test(part) && part.length === 1 }));
}

export function Num({ children }: { children: string }) {
  return (
    <>
      {splitNumber(children).map((p, i) =>
        p.sep ? (
          <span key={i} className="num-sep">
            {p.text}
          </span>
        ) : (
          p.text
        ),
      )}
    </>
  );
}
