import React from "react";

export function StudentLobbyIllustration({
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
      aria-label="Students in Registrar Lobby viewing digital queue board"
    >
      {/* Ground shadow */}
      <ellipse cx="100" cy="180" rx="80" ry="8" fill="#064E3B" fillOpacity="0.08" />

      {/* OVERHEAD TV BOARD (TOP) */}
      <g transform="translate(30, 20)">
        {/* Wall Mount Brackets */}
        <line x1="40" y1="0" x2="40" y2="10" stroke="#64748B" strokeWidth="2" />
        <line x1="100" y1="0" x2="100" y2="10" stroke="#64748B" strokeWidth="2" />

        {/* TV Outer Bezel */}
        <rect x="10" y="10" width="120" height="65" rx="6" fill="#0F172A" stroke="#1E293B" strokeWidth="2" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))" />
        {/* TV Screen Display (Abraian Royal Blue) */}
        <rect x="13" y="13" width="114" height="59" rx="3" fill="#04143A" />

        {/* TV Header */}
        <text x="70" y="24" fill="#BFDBFE" fontSize="5.5" fontWeight="800" textAnchor="middle">NOW SERVING · WINDOW 1</text>
        <line x1="20" y1="28" x2="120" y2="28" stroke="#1E3A8A" strokeWidth="0.8" />

        {/* Big Serving Number */}
        <rect x="25" y="32" width="42" height="26" rx="4" fill="#002776" stroke="#991B1B" strokeWidth="1.2" />
        <text x="46" y="49" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="var(--font-mono), monospace" textAnchor="middle">A-024</text>
        <text x="46" y="55" fill="#BFDBFE" fontSize="4" fontWeight="600" textAnchor="middle">WINDOW 1</text>

        {/* Window 2 */}
        <rect x="73" y="32" width="42" height="26" rx="4" fill="#002776" stroke="#1E3A8A" strokeWidth="1" />
        <text x="94" y="49" fill="#93C5FD" fontSize="13" fontWeight="900" fontFamily="var(--font-mono), monospace" textAnchor="middle">B-008</text>
        <text x="94" y="55" fill="#BFDBFE" fontSize="4" fontWeight="600" textAnchor="middle">WINDOW 2</text>

        {/* Chime speaker icon */}
        <circle cx="118" cy="22" r="3" fill="#991B1B" />
      </g>

      {/* TWO STUDENTS LOOKING UP AT BOARD (BOTTOM) */}
      {/* Student 1 (Wearing Collegiate Crimson Varsity Jacket - Not bright red) */}
      <g transform="translate(55, 95)">
        <path d="M20 50L18 85H27L29 55L31 85H40L38 50Z" fill="#334155" />
        <path d="M15 85H27V88H15Z" fill="#0F172A" />
        <path d="M31 85H43V88H31Z" fill="#0F172A" />

        {/* Torso in Collegiate Crimson */}
        <path d="M14 24C14 16 22 12 29 12C36 12 44 16 44 24L40 52H18L14 24Z" fill="#991B1B" />
        <path d="M24 12L29 22L34 12" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        {/* Looking up head */}
        <circle cx="29" cy="0" r="10" fill="#FBBF24" />
        {/* Hair */}
        <path d="M20 -1C20 -9 26 -11 32 -11C38 -11 40 -6 39 0C35 -1 31 -3 26 -3C23 -3 21 -2 20 -1Z" fill="#0F172A" />
      </g>

      {/* Student 2 (Holding ticket & looking up) */}
      <g transform="translate(105, 95)">
        <path d="M20 50L18 85H27L29 55L31 85H40L38 50Z" fill="#1E293B" />
        <path d="M15 85H27V88H15Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
        <path d="M31 85H43V88H31Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />

        {/* Torso (Varsity Green Sweater) */}
        <path d="M14 24C14 16 22 12 29 12C36 12 44 16 44 24L40 52H18L14 24Z" fill="#064E3B" />
        {/* Arm holding up queue slip */}
        <path d="M38 24L48 10L42 8L34 20Z" fill="#043829" />
        <rect x="44" y="0" width="10" height="14" rx="1.5" transform="rotate(15 44 0)" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
        <text x="47" y="9" transform="rotate(15 47 9)" fill="#064E3B" fontSize="4" fontWeight="800">A-024</text>
        <circle cx="43" cy="9" r="2" fill="#FBBF24" />

        {/* Head looking up */}
        <circle cx="29" cy="0" r="10" fill="#FBBF24" />
        {/* Ponytail Hair */}
        <path d="M19 0C19 -9 26 -11 33 -11C40 -11 41 -5 40 1C36 -1 31 -3 26 -3C22 -3 20 -1 19 0Z" fill="#3B2314" />
        <path d="M19 -4C14 -6 11 -2 12 4C14 3 17 0 19 -4Z" fill="#3B2314" />
      </g>
    </svg>
  );
}
