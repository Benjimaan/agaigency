import type { SVGProps } from "react";

interface LogoProps extends SVGProps<SVGSVGElement> {
  /** Show subtitle "Agence Digitale Premium" */
  showSubtitle?: boolean;
}

/**
 * AgaiGency inline SVG logo — crisp on all screens (Retina, mobile).
 *
 * Color behaviour:
 *  - Monogram "A", "Gency" text, separator & subtitle use the gold gradient.
 *  - "Agai" text uses `currentColor` so it adapts to parent text color.
 *
 * Apply Tailwind color utilities on the wrapper to control currentColor:
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
      viewBox="0 0 400 100"
      fill="none"
      role="img"
      aria-label="AgaiGency"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4b87a" />
          <stop offset="50%" stopColor="#c9a96e" />
          <stop offset="100%" stopColor="#b8944f" />
        </linearGradient>
        <linearGradient id="logo-gold-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4b87a" />
          <stop offset="100%" stopColor="#b8944f" />
        </linearGradient>
      </defs>

      {/* Monogram A */}
      <g transform="translate(10, 8)">
        <path
          d="M38 4 L68 76 L60 76 L52 58 L24 58 L16 76 L8 76 L38 4Z"
          fill="url(#logo-gold)"
          opacity="0.9"
        />
        <path d="M38 22 L50 52 L26 52 L38 22Z" fill="#0a0a0a" />
        <line x1="22" y1="52" x2="54" y2="52" stroke="url(#logo-gold-light)" strokeWidth="2" />
        {/* Tech circuit lines — left leg */}
        <line x1="20" y1="64" x2="28" y2="64" stroke="#0a0a0a" strokeWidth="1.5" opacity="0.6" />
        <circle cx="28" cy="64" r="1.5" fill="#0a0a0a" opacity="0.6" />
        <line x1="14" y1="70" x2="24" y2="70" stroke="#0a0a0a" strokeWidth="1.5" opacity="0.6" />
        <circle cx="24" cy="70" r="1.5" fill="#0a0a0a" opacity="0.6" />
        {/* Tech circuit lines — right leg */}
        <line x1="48" y1="64" x2="56" y2="64" stroke="#0a0a0a" strokeWidth="1.5" opacity="0.6" />
        <circle cx="48" cy="64" r="1.5" fill="#0a0a0a" opacity="0.6" />
        <line x1="52" y1="70" x2="62" y2="70" stroke="#0a0a0a" strokeWidth="1.5" opacity="0.6" />
        <circle cx="52" cy="70" r="1.5" fill="#0a0a0a" opacity="0.6" />
        {/* Highlight flare */}
        <circle cx="38" cy="8" r="3" fill="#d4b87a" opacity="0.4" />
      </g>

      {/* Text: AgaiGency */}
      <text
        x="95"
        y="52"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="38"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        <tspan fill="currentColor">Agai</tspan>
        <tspan fill="url(#logo-gold)">Gency</tspan>
      </text>

      {/* Separator line */}
      <line
        x1="95"
        y1="62"
        x2="330"
        y2="62"
        stroke="url(#logo-gold-light)"
        strokeWidth="1.5"
        opacity="0.6"
      />

      {/* Subtitle */}
      {showSubtitle && (
        <text
          x="95"
          y="80"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="14"
          fontWeight="400"
          fill="url(#logo-gold)"
          letterSpacing="2"
          opacity="0.85"
        >
          Agence Digitale Premium
        </text>
      )}
    </svg>
  );
}
