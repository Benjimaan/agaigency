import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  /** Show subtitle "Agence Digitale Premium" */
  showSubtitle?: boolean;
}

/**
 * AgaiGency official inline SVG logo — crisp on all screens.
 *
 * Monogram: "A" with upward-arrow crossbar in satin gold gradient.
 * Text "AGAIGENCY": uses `currentColor` so it adapts to parent text-color.
 *
 *   <Logo className="text-white hover:text-[#D4AF37]" />
 */
export default function Logo({
  showSubtitle = true,
  className,
  ...props
}: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 460 100"
      fill="none"
      role="img"
      aria-label="AgaiGency"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D76E" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8902C" />
        </linearGradient>
      </defs>

      {/* Monogram A — upward arrow crossbar */}
      <g fill="url(#logo-gold)">
        {/* Left pillar */}
        <polygon points="8,95 40,5 48,5 19,95" />
        {/* Right pillar */}
        <polygon points="48,5 80,95 69,95 40,5" />
        {/* Arrow crossbar */}
        <polygon points="26,61 44,43 62,61 57,68 44,55 31,68" />
      </g>

      {/* Wordmark */}
      <text
        x="100"
        y="60"
        fill="currentColor"
        fontFamily="Montserrat, Inter, system-ui, sans-serif"
        fontSize="34"
        fontWeight="700"
        letterSpacing="3"
      >
        AGAIGENCY
      </text>

      {/* Separator line */}
      <line
        x1="100"
        y1="70"
        x2="350"
        y2="70"
        stroke="url(#logo-gold)"
        strokeWidth="1.2"
        opacity="0.5"
      />

      {/* Subtitle */}
      {showSubtitle && (
        <text
          x="100"
          y="86"
          fontFamily="Montserrat, Inter, system-ui, sans-serif"
          fontSize="11"
          fontWeight="400"
          fill="url(#logo-gold)"
          letterSpacing="2"
          opacity="0.8"
        >
          AGENCE DIGITALE PREMIUM
        </text>
      )}
    </svg>
  );
}
