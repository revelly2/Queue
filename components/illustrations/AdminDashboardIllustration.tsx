import React from "react";

export function AdminDashboardIllustration({
  size = 180,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 360 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Registrar Administrator managing live queue telemetry"
    >
      <defs>
        <linearGradient id="adminScreenGrad" x1="0" y1="0" x2="160" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#04143A" />
          <stop offset="1" stopColor="#020E28" />
        </linearGradient>
        <linearGradient id="adminGlow" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#991B1B" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0038A8" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Ambient background soft aura */}
      <ellipse cx="180" cy="140" rx="150" ry="80" fill="url(#adminGlow)" />
      {/* Floor ground plane */}
      <ellipse cx="180" cy="245" rx="140" ry="12" fill="#0F172A" fillOpacity="0.06" />

      {/* ========================================================
          BACKGROUND MONITOR 1 (LEFT / TELEMETRY CHARTS)
         ======================================================== */}
      <g transform="translate(40, 45)">
        {/* Monitor Base & Stand */}
        <rect x="52" y="86" width="16" height="30" fill="#334155" />
        <rect x="36" y="114" width="48" height="6" rx="2" fill="#1E293B" />
        {/* Monitor Frame */}
        <rect x="0" y="0" width="120" height="88" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <rect x="3" y="3" width="114" height="82" rx="6" fill="url(#adminScreenGrad)" />

        {/* Telemetry Bar Chart on Screen */}
        <text x="10" y="16" fill="#93C5FD" fontSize="6" fontWeight="700">HOURLY QUEUE TRAFFIC</text>
        <line x1="10" y1="20" x2="110" y2="20" stroke="#1E3A8A" strokeWidth="0.8" />

        {/* Mini Bars */}
        <rect x="14" y="55" width="8" height="20" rx="1" fill="#0038A8" />
        <rect x="28" y="42" width="8" height="33" rx="1" fill="#991B1B" />
        <rect x="42" y="32" width="8" height="43" rx="1" fill="#008837" />
        <rect x="56" y="26" width="8" height="49" rx="1" fill="#991B1B" />
        <rect x="70" y="38" width="8" height="37" rx="1" fill="#0038A8" />
        <rect x="84" y="48" width="8" height="27" rx="1" fill="#008837" />
        <rect x="98" y="58" width="8" height="17" rx="1" fill="#334155" />
        {/* Base axis */}
        <line x1="10" y1="76" x2="110" y2="76" stroke="#334155" strokeWidth="1" />
      </g>

      {/* ========================================================
          BACKGROUND MONITOR 2 (RIGHT / LIVE WINDOW DISPATCH)
         ======================================================== */}
      <g transform="translate(195, 35)">
        {/* Stand */}
        <rect x="62" y="96" width="16" height="30" fill="#334155" />
        <rect x="46" y="124" width="48" height="6" rx="2" fill="#1E293B" />
        {/* Frame */}
        <rect x="0" y="0" width="140" height="98" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <rect x="3" y="3" width="134" height="92" rx="6" fill="url(#adminScreenGrad)" />

        {/* Top Header */}
        <rect x="8" y="8" width="124" height="15" rx="3" fill="#002776" />
        <text x="14" y="18" fill="#FFFFFF" fontSize="6.5" fontWeight="800">CAMPUS WINDOWS (ACTIVE)</text>
        <circle cx="124" cy="15.5" r="3" fill="#008837" />

        {/* Live Window Slots on Admin Screen */}
        <rect x="8" y="28" width="58" height="28" rx="3" fill="#020E28" stroke="#991B1B" strokeWidth="1" />
        <text x="14" y="38" fill="#FECACA" fontSize="5.5" fontWeight="700">W1: OTR & CREDENTIALS</text>
        <text x="14" y="50" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="monospace">A-042</text>
        <rect x="46" y="43" width="16" height="8" rx="2" fill="#991B1B" />
        <text x="54" y="49" fill="#FFFFFF" fontSize="4.5" fontWeight="800" textAnchor="middle">CALL</text>

        <rect x="74" y="28" width="58" height="28" rx="3" fill="#020E28" stroke="#1E3A8A" strokeWidth="1" />
        <text x="80" y="38" fill="#BFDBFE" fontSize="5.5" fontWeight="700">W2: ENROLLMENT</text>
        <text x="80" y="50" fill="#FFFFFF" fontSize="10" fontWeight="900" fontFamily="monospace">B-018</text>
        <rect x="112" y="43" width="16" height="8" rx="2" fill="#0038A8" />
        <text x="120" y="49" fill="#FFFFFF" fontSize="4.5" fontWeight="800" textAnchor="middle">CALL</text>

        <rect x="8" y="60" width="124" height="15" rx="3" fill="#0B2559" />
        <text x="14" y="70" fill="#A7F3D0" fontSize="5.5" fontWeight="700">CASHIER WINDOW: 1 TRANSACTION PENDING</text>
        <text x="120" y="70" fill="#FBBF24" fontSize="5.5" fontWeight="800" textAnchor="end">₱150.00</text>
      </g>

      {/* ========================================================
          ADMINISTRATOR DESK SURFACE
         ======================================================== */}
      <rect x="30" y="165" width="300" height="55" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
      <rect x="25" y="162" width="310" height="8" rx="3" fill="#0038A8" />
      {/* Front edge wood accent */}
      <rect x="30" y="212" width="300" height="8" rx="2" fill="#002776" />

      {/* Desk Items: Keyboard, Mouse, ID Badge, Documents */}
      <rect x="135" y="180" width="80" height="20" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="225" y="184" width="14" height="22" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
      {/* Official Registrar Stamp & Documents on Desk */}
      <rect x="50" y="176" width="30" height="38" rx="2" transform="rotate(-5 50 176)" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="56" y1="184" x2="72" y2="182" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="56" y1="190" x2="70" y2="189" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="68" cy="200" r="5" fill="#991B1B" fillOpacity="0.8" />

      {/* ========================================================
          REGISTRAR OFFICER / ADMIN (CENTER-LEFT FOREGROUND)
         ======================================================== */}
      <g transform="translate(130, 80)">
        {/* Officer Torso / Blazer in Royal Blue */}
        <path d="M25 65C25 45 42 38 60 38C78 38 95 45 95 65L90 120H30L25 65Z" fill="#0038A8" />
        {/* Inner white shirt */}
        <path d="M48 38L60 72L72 38Z" fill="#FFFFFF" />
        {/* Collegiate Crimson Tie (Dignified, not bright red) */}
        <path d="M57 44L60 41L63 44L62 78L60 82L58 78Z" fill="#991B1B" />
        {/* Gold University Lapel Pin */}
        <circle cx="44" cy="58" r="2.5" fill="#FBBF24" />

        {/* Arms resting on desk / typing */}
        <path d="M26 65L10 115L35 120L44 85Z" fill="#002776" />
        <path d="M94 65L110 115L85 120L76 85Z" fill="#002776" />
        {/* Hands */}
        <circle cx="28" cy="118" r="7" fill="#FBBF24" />
        <circle cx="92" cy="118" r="7" fill="#FBBF24" />

        {/* Neck */}
        <rect x="53" y="24" width="14" height="18" fill="#FBBF24" />

        {/* Head */}
        <circle cx="60" cy="12" r="18" fill="#FBBF24" />
        {/* Dark Neat Hair */}
        <path d="M42 10C42 -6 52 -12 65 -12C78 -12 82 -4 81 6C77 5 72 2 64 2C57 2 51 5 42 10Z" fill="#0F172A" />
        {/* Glasses */}
        <circle cx="53" cy="11" r="5" stroke="#0F172A" strokeWidth="1.3" fill="none" />
        <circle cx="67" cy="11" r="5" stroke="#0F172A" strokeWidth="1.3" fill="none" />
        <line x1="58" y1="11" x2="62" y2="11" stroke="#0F172A" strokeWidth="1.3" />
        {/* Confident Smile */}
        <path d="M56 20C58 23 62 23 64 20" stroke="#92400E" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* Floating Status Pill (Top Left) */}
      <g transform="translate(18, 18)">
        <rect x="0" y="0" width="112" height="22" rx="11" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.06))" />
        <circle cx="11" cy="11" r="3.5" fill="#008837" />
        <text x="20" y="14" fill="#991B1B" fontSize="6.5" fontWeight="800" letterSpacing="0.04em">UA QUEUE TELEMETRY</text>
      </g>
    </svg>
  );
}
