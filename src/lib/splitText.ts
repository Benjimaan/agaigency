/**
 * Custom text splitting utility — replaces GSAP's paid SplitText plugin.
 * Restructures a container's text into line-grouped spans for
 * overflow:hidden reveal animations.
 */
export function splitTextIntoLines(container: HTMLElement): HTMLElement[] {
  const text = container.textContent?.trim();
  if (!text) return [];

  const words = text.split(/\s+/);
  if (words.length === 0) return [];

  // Step 1: Insert word spans for measurement
  container.innerHTML = "";

  const wordSpans: HTMLSpanElement[] = [];
  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.style.display = "inline-block";
    span.style.whiteSpace = "nowrap";
    span.textContent = word;
    container.appendChild(span);
    wordSpans.push(span);

    if (i < words.length - 1) {
      container.appendChild(document.createTextNode(" "));
    }
  });

  // Step 2: Group words by visual line (same offsetTop)
  const lines: HTMLSpanElement[][] = [];
  let currentLine: HTMLSpanElement[] = [];
  let currentTop = wordSpans[0].offsetTop;

  wordSpans.forEach((span) => {
    if (span.offsetTop !== currentTop) {
      lines.push(currentLine);
      currentLine = [span];
      currentTop = span.offsetTop;
    } else {
      currentLine.push(span);
    }
  });
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Step 3: Restructure into line wrappers with overflow:hidden
  container.innerHTML = "";
  const lineInners: HTMLElement[] = [];

  lines.forEach((lineWords) => {
    // Outer: clips the translateY animation
    // Use padding + overflow instead of clip-path for broad compatibility
    // Generous padding ensures descenders (g, p, q, y) are never clipped
    const lineWrapper = document.createElement("span");
    lineWrapper.style.display = "block";
    lineWrapper.style.overflow = "hidden";
    lineWrapper.style.padding = "0.1em 0 0.35em";
    lineWrapper.style.margin = "-0.1em 0 -0.35em";

    // Inner: the element GSAP will animate
    const lineInner = document.createElement("span");
    lineInner.style.display = "block";
    lineInner.style.willChange = "transform";

    lineWords.forEach((wordSpan, i) => {
      lineInner.appendChild(wordSpan);
      if (i < lineWords.length - 1) {
        lineInner.appendChild(document.createTextNode(" "));
      }
    });

    lineWrapper.appendChild(lineInner);
    container.appendChild(lineWrapper);
    lineInners.push(lineInner);
  });

  return lineInners;
}
