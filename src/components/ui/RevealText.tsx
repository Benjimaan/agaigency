"use client";

import { useRef, useLayoutEffect, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitTextIntoLines } from "@/lib/splitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface RevealTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
}

export default function RevealText({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.12,
  duration = 1.2,
  once = true,
  threshold = 0.85,
}: RevealTextProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const originalText = useRef(children);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Store and reset text for splitting
    originalText.current = children;
    el.textContent = children;

    const lines = splitTextIntoLines(el);
    if (lines.length === 0) return;

    // Hide lines below the mask
    gsap.set(lines, { yPercent: 100 });

    // Animate on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: `top ${threshold * 100}%`,
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    });

    tl.to(lines, {
      yPercent: 0,
      duration,
      stagger,
      delay,
      ease: "power4.out",
    });

    tlRef.current = tl;

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      if (el) el.textContent = originalText.current;
    };
  }, [children, delay, stagger, duration, once, threshold]);

  return (
    <Tag
      ref={setRef as React.RefCallback<HTMLElement>}
      className={className}
    >
      {children}
    </Tag>
  );
}
