import React from "react";

export function StudentTrackerIllustration({
  size = 180,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Student tracking queue on mobile phone"
    >
      {/* Ground bench / lawn */}
      <ellipse cx="100" cy="175" rx="75" ry="7" fill="#0F172A" fillOpacity="0.06" />

      {/* Campus Bench Wooden Slat */}
      <rect x="25" y="145" width="150" height="8" rx="3" fill="#78350F" />
      <rect x="40" y="153" width="8" height="22" rx="2" fill="#451A03" />
      <rect x="152" y="153" width="8" height="22" rx="2" fill="#451A03" />

      {/* Stack of University Books on Bench */}
      <rect x="135" y="137" width="28" height="8" rx="1.5" fill="#0038A8" />
      <rect x="138" y="131" width="24" height="6" rx="1.5" fill="#991B1B" />
      <rect x="141" y="125" width="20" height="6" rx="1.5" fill="#008837" />
      {/* Coffee Cup with Crimson sleeve */}
      <path d="M125 131L127 145H135L137 131Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
      <rect x="125.5" y="136" width="11" height="5" fill="#991B1B" />

      {/* STUDENT SEATED (CENTER) */}
      <g transform="translate(62, 45)">
        {/* Legs crossed on bench */}
        <path d="M30 75L26 105H42L48 78Z" fill="#1E293B" />
        <path d="M42 75L56 102H70L54 75Z" fill="#334155" />
        {/* Sneakers */}
        <path d="M22 105H38C38 108 35 110 30 110H22V105Z" fill="#0038A8" />
        <path d="M52 102H68C68 105 65 107 60 107H52V102Z" fill="#0038A8" />

        {/* Torso (Varsity Collegiate Crimson Jacket - Not bright red) */}
        <path d="M24 38C24 28 34 24 44 24C54 24 64 28 64 38L60 76H28L24 38Z" fill="#991B1B" />
        <path d="M38 24L44 38L50 24" stroke="#FFFFFF" strokeWidth="2" fill="none" />

        {/* Arms holding phone in front (Shaded deep crimson) */}
        <path d="M24 38L32 58L42 54L32 36Z" fill="#7F1D1D" />
        <path d="M64 38L54 58L46 54L56 36Z" fill="#7F1D1D" />
        {/* Hands */}
        <circle cx="39" cy="55" r="3.5" fill="#FBBF24" />
        <circle cx="49" cy="55" r="3.5" fill="#FBBF24" />

        {/* Smartphone Screen glowing with Queue Info */}
        <rect x="36" y="42" width="16" height="26" rx="3" fill="#0F172A" />
        <rect x="37.5" y="44" width="13" height="22" rx="1.5" fill="#EFF6FF" />
        <text x="44" y="52" fill="#0038A8" fontSize="4.5" fontWeight="900" textAnchor="middle">#2</text>
        <text x="44" y="57" fill="#008837" fontSize="3" fontWeight="700" textAnchor="middle">IN LINE</text>
        <circle cx="44" cy="62" r="2" fill="#991B1B" />

        {/* Head */}
        <circle cx="44" cy="14" r="11" fill="#FBBF24" />
        {/* Hair */}
        <path d="M33 13C33 3 40 -1 48 -1C56 -1 58 5 57 11C53 10 49 7 43 7C39 7 35 9 33 13Z" fill="#0F172A" />
        {/* Content smile looking at phone */}
        <path d="M43 18C44 20 46 20 47 18" stroke="#92400E" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* Floating Notification Badge */}
      <g transform="translate(100, 20)">
        <rect x="0" y="0" width="80" height="28" rx="6" fill="#FFFFFF" stroke="#0038A8" strokeWidth="1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.08))" />
        <circle cx="12" cy="14" r="5" fill="#008837" />
        <path d="M10 14L11.5 15.5L14 12" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        <text x="22" y="12" fill="#0038A8" fontSize="6.5" fontWeight="800">2 AHEAD OF YOU</text>
        <text x="22" y="20" fill="#64748B" fontSize="5" fontWeight="600">Proceed to Window 3</text>
      </g>
    </svg>
  );
}
