import React from "react";

export function StudentBookingIllustration({
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
      aria-label="Student booking queue ticket on smartphone"
    >
      <defs>
        <linearGradient id="phoneGrad" x1="0" y1="0" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" />
          <stop offset="1" stopColor="#D1FAE5" />
        </linearGradient>
        <filter id="phoneShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#064E3B" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="100" cy="180" rx="75" ry="7" fill="#064E3B" fillOpacity="0.08" />

      {/* STUDENT WITH SMARTPHONE (LEFT & CENTER) */}
      <g transform="translate(25, 30)">
        {/* Backpack behind left shoulder */}
        <rect x="18" y="60" width="16" height="38" rx="6" fill="#1E3A8A" />

        {/* Trousers */}
        <path d="M38 105L34 150H45L50 110L55 150H66L62 105Z" fill="#334155" />
        {/* Shoes */}
        <path d="M28 150H45V154H28Z" fill="#0F172A" />
        <path d="M55 150H72V154H55Z" fill="#0F172A" />

        {/* Collegiate Crimson Varsity Jacket (Not bright red) */}
        <path d="M30 52C30 40 42 34 52 34C62 34 74 40 74 52L70 108H34L30 52Z" fill="#991B1B" />
        {/* White shirt inner */}
        <path d="M46 34L52 50L58 34" fill="#FFFFFF" />
        {/* UA Lanyard in Collegiate Crimson */}
        <path d="M47 34L51 68L53 68L57 34" stroke="#7F1D1D" strokeWidth="2.5" fill="none" />
        <rect x="49" y="68" width="6" height="9" rx="1" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
        <rect x="50" y="69" width="4" height="3" fill="#0038A8" />

        {/* Left arm holding registration notebook (shaded deep crimson) */}
        <path d="M30 52L20 80L32 86L38 62Z" fill="#7F1D1D" />
        <rect x="14" y="74" width="20" height="26" rx="2" transform="rotate(-10 14 74)" fill="#991B1B" stroke="#7F1D1D" strokeWidth="0.8" />
        <rect x="18" y="78" width="14" height="3" transform="rotate(-10 18 78)" fill="#FFFFFF" />

        {/* Right arm bent holding smartphone forward */}
        <path d="M72 52L86 78L78 84L66 60Z" fill="#7F1D1D" />
        <circle cx="84" cy="80" r="4" fill="#FBBF24" />

        {/* Head */}
        <circle cx="52" cy="20" r="13" fill="#FBBF24" />
        {/* Hair */}
        <path d="M38 18C38 6 48 2 56 2C66 2 68 8 67 15C63 14 59 10 52 10C47 10 42 12 38 18Z" fill="#0F172A" />
        {/* Smile */}
        <path d="M54 24C56 26 59 26 60 24" stroke="#92400E" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* FLOATING SMARTPHONE WITH WEB BOOKING UI (RIGHT) */}
      <g transform="translate(105, 22)" filter="url(#phoneShadow)">
        {/* Phone Case */}
        <rect x="0" y="0" width="70" height="135" rx="12" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
        {/* Phone Screen */}
        <rect x="3" y="3" width="64" height="129" rx="9" fill="url(#phoneGrad)" />
        {/* Top Speaker notch */}
        <rect x="25" y="6" width="20" height="3" rx="1.5" fill="#0F172A" />

        {/* Web App URL Bar */}
        <rect x="6" y="14" width="58" height="11" rx="3" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="0.8" />
        <circle cx="10" cy="19.5" r="1.5" fill="#059669" />
        <text x="14" y="22" fill="#0038A8" fontSize="4.5" fontWeight="700">queua.abra.edu.ph</text>

        {/* Screen Header Banner */}
        <rect x="6" y="28" width="58" height="16" rx="3" fill="#0038A8" />
        <text x="35" y="36" fill="#FFFFFF" fontSize="4.5" fontWeight="800" textAnchor="middle">UA ONLINE BOOKING</text>
        <text x="35" y="41" fill="#BFDBFE" fontSize="3.5" fontWeight="600" textAnchor="middle">Book Queue Slip on Phone</text>

        {/* Service Options on Mobile Screen */}
        <rect x="6" y="48" width="58" height="16" rx="3" fill="#FFFFFF" stroke="#0038A8" strokeWidth="1" />
        <text x="10" y="56" fill="#0038A8" fontSize="4.5" fontWeight="800">1. OTR Credentials</text>
        <text x="10" y="61" fill="#64748B" fontSize="3.5">Transcript of Records</text>
        <rect x="52" y="52" width="9" height="7" rx="1.5" fill="#991B1B" />
        <text x="56.5" y="57" fill="#FFFFFF" fontSize="4" fontWeight="800" textAnchor="middle">+</text>

        <rect x="6" y="67" width="58" height="14" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
        <text x="10" y="74" fill="#334155" fontSize="4" fontWeight="700">2. Enrollment Change</text>
        <text x="10" y="78.5" fill="#94A3B8" fontSize="3.2">Adding / Dropping</text>

        <rect x="6" y="84" width="58" height="14" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />
        <text x="10" y="91" fill="#334155" fontSize="4" fontWeight="700">3. Clearances & Forms</text>
        <text x="10" y="95.5" fill="#94A3B8" fontSize="3.2">Graduation / Good Moral</text>

        {/* CTA Button on Screen */}
        <rect x="6" y="103" width="58" height="14" rx="4" fill="#991B1B" />
        <text x="35" y="112" fill="#FFFFFF" fontSize="5" fontWeight="800" textAnchor="middle">Generate e-Ticket</text>

        {/* Phone Bottom Home Bar */}
        <rect x="23" y="125" width="24" height="2.5" rx="1.2" fill="#0F172A" />
      </g>

      {/* Floating Sparkle / Wi-Fi Cloud badge */}
      <g transform="translate(145, 10)">
        <rect x="0" y="0" width="46" height="16" rx="8" fill="#FFFFFF" stroke="#059669" strokeWidth="1" />
        <text x="23" y="11" fill="#064E3B" fontSize="5.5" fontWeight="800" textAnchor="middle">⚡ WEB HOSTED</text>
      </g>
    </svg>
  );
}
