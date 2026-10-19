import React from "react";

export function SystemArchitectureIllustration({
  size = 280,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 400 288"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="University Registrar Queue System Command Center illustration"
    >
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0038A8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#991B1B" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="blueCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
      </defs>

      {/* Background Soft Glow Aura */}
      <rect x="20" y="20" width="360" height="248" rx="24" fill="url(#cloudGrad)" />

      {/* Grid Pattern in Background */}
      <g opacity="0.12" stroke="#0038A8" strokeWidth="0.75" strokeDasharray="3 3">
        <line x1="60" y1="30" x2="60" y2="260" />
        <line x1="130" y1="30" x2="130" y2="260" />
        <line x1="200" y1="30" x2="200" y2="260" />
        <line x1="270" y1="30" x2="270" y2="260" />
        <line x1="340" y1="30" x2="340" y2="260" />
        <line x1="30" y1="70" x2="370" y2="70" />
        <line x1="30" y1="130" x2="370" y2="130" />
        <line x1="30" y1="190" x2="370" y2="190" />
      </g>

      {/* ========================================================
          CENTRAL COMMAND MAINFRAME / SERVER RACK
         ======================================================== */}
      {/* Ground Shadow */}
      <ellipse cx="200" cy="246" rx="140" ry="12" fill="#0F172A" fillOpacity="0.07" />

      {/* Main Server Tower / Hub */}
      <rect x="156" y="58" width="88" height="175" rx="12" fill="#002776" stroke="#0038A8" strokeWidth="2.5" />
      <rect x="162" y="66" width="76" height="42" rx="6" fill="#04143A" />
      
      {/* Server Bay Unit 1 (Telemetry monitor) */}
      <rect x="168" y="73" width="64" height="28" rx="4" fill="#0B1E48" />
      <path d="M172 87L180 81L188 90L198 78L210 85L224 76" stroke="#008837" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="224" cy="76" r="2.5" fill="#008837" />

      {/* Server Bay Unit 2 (LED Activity Matrix) */}
      <rect x="162" y="115" width="76" height="28" rx="6" fill="#04143A" />
      <circle cx="174" cy="129" r="3.5" fill="#991B1B" />
      <circle cx="188" cy="129" r="3.5" fill="#008837" />
      <circle cx="202" cy="129" r="3.5" fill="#38BDF8" />
      <circle cx="216" cy="129" r="3.5" fill="#FBBF24" />

      {/* Server Bay Unit 3 (Storage slots) */}
      <rect x="162" y="150" width="76" height="32" rx="6" fill="#04143A" />
      <rect x="168" y="156" width="64" height="4" rx="2" fill="#1E3A8A" />
      <rect x="168" y="164" width="64" height="4" rx="2" fill="#1E3A8A" />
      <rect x="168" y="172" width="64" height="4" rx="2" fill="#1E3A8A" />

      {/* System Brand Tag on Tower */}
      <rect x="176" y="194" width="48" height="16" rx="4" fill="#991B1B" />
      <text x="200" y="205" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle" letterSpacing="0.05em">QUE-UA</text>

      {/* ========================================================
          LEFT SATELLITE: MOBILE STUDENT QUEUE NODE
         ======================================================== */}
      {/* Connecting Flow Line */}
      <path d="M106 148C126 148 136 128 156 128" stroke="#991B1B" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Smartphone Card */}
      <g transform="translate(46, 92)">
        <rect x="0" y="0" width="60" height="110" rx="10" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <rect x="4" y="6" width="52" height="98" rx="6" fill="#FFFFFF" />
        
        {/* Speaker slot */}
        <rect x="22" y="2" width="16" height="2.5" rx="1" fill="#475569" />
        
        {/* Phone UI */}
        <rect x="8" y="12" width="44" height="14" rx="3" fill="#991B1B" />
        <text x="30" y="22" fill="#FFFFFF" fontSize="5.5" fontWeight="800" textAnchor="middle">UA e-PASS</text>
        
        <rect x="8" y="32" width="44" height="34" rx="4" fill="#FEF2F2" stroke="#FECACA" strokeWidth="0.8" />
        <text x="30" y="44" fill="#64748B" fontSize="4.5" fontWeight="700" textAnchor="middle">TICKET #</text>
        <text x="30" y="58" fill="#991B1B" fontSize="12" fontWeight="900" textAnchor="middle">R-108</text>
        
        <rect x="12" y="72" width="36" height="5" rx="2" fill="#0038A8" />
        <text x="30" y="76" fill="#FFFFFF" fontSize="3.8" fontWeight="700" textAnchor="middle">WINDOW 1</text>

        <rect x="12" y="81" width="36" height="4" rx="2" fill="#008837" />
        <text x="30" y="84.2" fill="#FFFFFF" fontSize="3.5" fontWeight="700" textAnchor="middle">FEES CLEARED</text>
      </g>

      {/* Floating Badge Left */}
      <g transform="translate(36, 68)">
        <rect x="0" y="0" width="80" height="20" rx="10" fill="#FFFFFF" stroke="#FECACA" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(153,27,27,0.1))" />
        <circle cx="12" cy="10" r="4" fill="#991B1B" />
        <text x="22" y="13" fill="#991B1B" fontSize="6.5" fontWeight="800">Mobile Booking</text>
      </g>

      {/* ========================================================
          RIGHT SATELLITE: REGISTRAR COUNTER DISPATCH NODE
         ======================================================== */}
      {/* Connecting Flow Line */}
      <path d="M244 128C264 128 274 148 294 148" stroke="#0038A8" strokeWidth="2" strokeDasharray="4 4" />

      {/* Counter Window Monitor Card */}
      <g transform="translate(294, 96)">
        <rect x="0" y="0" width="76" height="54" rx="8" fill="#04143A" stroke="#0038A8" strokeWidth="2" />
        <rect x="3" y="3" width="70" height="48" rx="6" fill="#002776" />
        
        {/* Monitor Header */}
        <rect x="7" y="7" width="62" height="12" rx="3" fill="#0038A8" />
        <circle cx="13" cy="13" r="2.5" fill="#008837" />
        <text x="20" y="16" fill="#FFFFFF" fontSize="5.5" fontWeight="800">WINDOW 01 • LIVE</text>
        
        {/* Serving Ticket Card */}
        <rect x="7" y="23" width="62" height="23" rx="4" fill="#FFFFFF" />
        <text x="38" y="31" fill="#64748B" fontSize="4.5" fontWeight="700" textAnchor="middle">NOW SERVING</text>
        <text x="38" y="42" fill="#991B1B" fontSize="10" fontWeight="900" textAnchor="middle">R-108</text>

        {/* Monitor Base */}
        <path d="M34 54L30 68H46L42 54" fill="#64748B" />
        <rect x="22" y="68" width="32" height="4" rx="2" fill="#334155" />
      </g>

      {/* Floating Badge Right */}
      <g transform="translate(284, 68)">
        <rect x="0" y="0" width="84" height="20" rx="10" fill="#FFFFFF" stroke="#BFDBFE" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,56,168,0.1))" />
        <circle cx="12" cy="10" r="4" fill="#0038A8" />
        <text x="22" y="13" fill="#002776" fontSize="6.5" fontWeight="800">Staff Dispatch</text>
      </g>

      {/* Real-time Packet Pulses */}
      <circle cx="134" cy="138" r="3.5" fill="#991B1B">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="266" cy="138" r="3.5" fill="#0038A8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
