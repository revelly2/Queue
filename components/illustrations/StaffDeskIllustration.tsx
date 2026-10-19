import React from "react";

export function StaffDeskIllustration({
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
      aria-label="Registrar Counter Officer at service window"
    >
      {/* Ground Shadow */}
      <ellipse cx="100" cy="180" rx="80" ry="8" fill="#0F172A" fillOpacity="0.08" />

      {/* REGISTRAR SERVICE WINDOW COUNTER DESK */}
      <rect x="20" y="115" width="160" height="55" rx="6" fill="#0038A8" stroke="#002776" strokeWidth="2" />
      <rect x="15" y="112" width="170" height="10" rx="4" fill="#002776" />
      {/* Desk Signboard */}
      <rect x="65" y="132" width="70" height="22" rx="4" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1.2" />
      <text x="100" y="142" fill="#991B1B" fontSize="5" fontWeight="800" textAnchor="middle">WINDOW 1</text>
      <text x="100" y="150" fill="#0038A8" fontSize="6.5" fontWeight="800" textAnchor="middle">REGISTRAR OFFICER</text>

      {/* Documents, Stamps & Computer on Desk */}
      <rect x="30" y="98" width="28" height="16" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
      <rect x="32" y="100" width="24" height="11" rx="1" fill="#EFF6FF" />
      <rect x="42" y="114" width="4" height="6" fill="#64748B" />

      {/* Official Transcripts on Desk */}
      <rect x="140" y="104" width="24" height="14" rx="1" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
      <circle cx="158" cy="111" r="3" fill="#991B1B" />

      {/* REGISTRAR OFFICER (BEHIND COUNTER) */}
      <g transform="translate(68, 48)">
        {/* Uniform (University Blazer in Royal Blue + Crimson Tie) */}
        <path d="M16 38C16 26 28 22 36 22C44 22 56 26 56 38L54 70H18L16 38Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <path d="M16 38L28 68L36 38L44 68L56 38" fill="#0038A8" />
        {/* Tie in Collegiate Crimson (Not bright red) */}
        <path d="M34 26L36 24L38 26L37 45L36 48L35 45Z" fill="#991B1B" />
        {/* Crimson Lapel Pin */}
        <circle cx="26" cy="38" r="2" fill="#991B1B" />

        {/* Head */}
        <circle cx="36" cy="12" r="11" fill="#FBBF24" />
        {/* Hair */}
        <path d="M25 11C25 2 32 -2 40 -2C48 -2 50 4 49 10C45 9 41 6 35 6C31 6 27 8 25 11Z" fill="#1E293B" />
        {/* Glasses */}
        <circle cx="32" cy="12" r="3.5" stroke="#0F172A" strokeWidth="1" fill="none" />
        <circle cx="40" cy="12" r="3.5" stroke="#0F172A" strokeWidth="1" fill="none" />
        <line x1="35.5" y1="12" x2="36.5" y2="12" stroke="#0F172A" strokeWidth="1" />
        {/* Smile */}
        <path d="M34 17C35 19 37 19 38 17" stroke="#92400E" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  );
}
