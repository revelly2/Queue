import React from "react";

export function StudentHeroIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 680 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className}`}
      aria-label="University of Abra students booking and tracking their queue tickets on mobile phones"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="680" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECFDF5" />
          <stop offset="1" stopColor="#FEF3C7" stopOpacity="0.8" />
        </linearGradient>
        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#064E3B" floodOpacity="0.08" />
        </filter>
        <filter id="ticketShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.14" />
        </filter>
      </defs>

      {/* Campus Background Backdrop Card */}
      <rect x="10" y="10" width="660" height="320" rx="20" fill="url(#skyGrad)" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Decorative Collegiate Geometry / Campus Arches */}
      <g opacity="0.35" stroke="#064E3B" strokeWidth="1.2">
        <path d="M40 330V150C40 90 120 90 120 150V330" fill="#FFFFFF" fillOpacity="0.4" />
        <path d="M130 330V170C130 110 200 110 200 170V330" fill="#FFFFFF" fillOpacity="0.3" />
        <path d="M480 330V160C480 100 560 100 560 160V330" fill="#FFFFFF" fillOpacity="0.3" />
        <path d="M570 330V180C570 120 640 120 640 180V330" fill="#FFFFFF" fillOpacity="0.4" />
        <line x1="20" y1="315" x2="660" y2="315" stroke="#CBD5E1" strokeWidth="2" />
      </g>

      {/* Floating Collegiate Accent Badges */}
      <g filter="url(#softGlow)">
        <rect x="45" y="32" width="180" height="34" rx="17" fill="#FFFFFF" stroke="#064E3B" strokeWidth="1" />
        <circle cx="63" cy="49" r="8" fill="#059669" />
        <path d="M60 49L62.5 51.5L66 47" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="79" y="53" fill="#064E3B" fontSize="10.5" fontWeight="700" fontFamily="system-ui">📱 100% WEB & MOBILE</text>
      </g>

      <g filter="url(#softGlow)">
        <rect x="465" y="35" width="170" height="34" rx="17" fill="#FFFFFF" stroke="#991B1B" strokeWidth="1" />
        <circle cx="483" cy="52" r="7" fill="#991B1B" />
        <text x="498" y="56" fill="#0F172A" fontSize="10.5" fontWeight="600" fontFamily="system-ui">NO MACHINE NEEDED</text>
      </g>

      {/* ========================================================
          STUDENT 1 (LEFT): Male Scholar with UA Lanyard & Folder
         ======================================================== */}
      <g transform="translate(140, 75)">
        {/* Shadow */}
        <ellipse cx="65" cy="242" rx="42" ry="7" fill="#0F172A" fillOpacity="0.08" />

        {/* Legs / Trousers */}
        <path d="M48 190L46 240H58L62 195L66 240H78L78 190Z" fill="#334155" />
        {/* Shoes */}
        <path d="M43 240H58C58 243 56 245 50 245H43V240Z" fill="#0F172A" />
        <path d="M78 240H93C93 243 91 245 85 245H78V240Z" fill="#0F172A" />

        {/* Body / University Jacket (Collegiate Crimson with White V) */}
        <path d="M35 125C35 110 50 102 65 102C80 102 95 110 95 125L92 192H38L35 125Z" fill="#991B1B" />
        {/* Inner Shirt */}
        <path d="M56 102L65 128L74 102Z" fill="#FFFFFF" />
        {/* UA Campus Lanyard (Collegiate Crimson) */}
        <path d="M57 102L63 150L65 155L67 150L73 102" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Lanyard Student ID Badge */}
        <rect x="58" y="153" width="14" height="20" rx="2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="60" y="156" width="10" height="6" fill="#0038A8" />
        <line x1="60" y1="166" x2="70" y2="166" stroke="#94A3B8" strokeWidth="1" />
        <line x1="60" y1="169" x2="67" y2="169" stroke="#94A3B8" strokeWidth="1" />

        {/* Left Arm holding Registrar Folder (Deep Shaded Crimson) */}
        <path d="M36 122L20 160L32 170L44 135Z" fill="#7F1D1D" />
        {/* Academic Manila Folder in Crimson */}
        <rect x="12" y="150" width="30" height="38" rx="2" transform="rotate(-10 12 150)" fill="#991B1B" stroke="#7F1D1D" strokeWidth="1" />
        <rect x="16" y="156" width="22" height="4" transform="rotate(-10 16 156)" fill="#FFFFFF" />
        <text x="17" y="172" transform="rotate(-10 17 172)" fill="#FFFFFF" fontSize="5" fontWeight="800">UA OTR</text>
        {/* Hand */}
        <circle cx="28" cy="184" r="5" fill="#FBBF24" />

        {/* Right Arm waving/relaxed */}
        <path d="M93 124L105 160L95 168L88 135Z" fill="#7F1D1D" />
        <circle cx="102" cy="168" r="5" fill="#FBBF24" />

        {/* Neck */}
        <rect x="59" y="88" width="12" height="16" fill="#FBBF24" />

        {/* Head */}
        <circle cx="65" cy="74" r="19" fill="#FBBF24" />
        {/* Short Dark Hair */}
        <path d="M46 72C46 54 55 48 68 48C80 48 85 55 85 66C81 66 78 62 70 62C64 62 58 66 46 72Z" fill="#0F172A" />
        {/* Glasses */}
        <circle cx="58" cy="73" r="5" stroke="#0F172A" strokeWidth="1.2" fill="none" />
        <circle cx="72" cy="73" r="5" stroke="#0F172A" strokeWidth="1.2" fill="none" />
        <line x1="63" y1="73" x2="67" y2="73" stroke="#0F172A" strokeWidth="1.2" />
        {/* Friendly Smile */}
        <path d="M60 83C62 86 68 86 70 83" stroke="#92400E" strokeWidth="1.4" strokeLinecap="round" />
      </g>

      {/* ========================================================
          CENTER: DIGITAL MOBILE E-PASS (Web-Hosted on Smartphone)
         ======================================================== */}
      <g transform="translate(285, 78)" filter="url(#ticketShadow)">
        {/* Phone Case Frame */}
        <rect x="0" y="0" width="118" height="188" rx="16" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        {/* Screen */}
        <rect x="4" y="4" width="110" height="180" rx="12" fill="#FFFFFF" />
        {/* Top Speaker pill */}
        <rect x="46" y="8" width="26" height="3" rx="1.5" fill="#0F172A" />

        {/* e-Pass Top Header in Royal Blue */}
        <rect x="4" y="16" width="110" height="28" fill="#0038A8" />
        <text x="59" y="27" fill="#BFDBFE" fontSize="6.5" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">UNIVERSITY OF ABRA</text>
        <text x="59" y="37" fill="#FFFFFF" fontSize="7" fontWeight="700" textAnchor="middle">MOBILE QUEUE E-PASS</text>

        {/* Priority Queue Code on Screen */}
        <text x="59" y="58" fill="#64748B" fontSize="7.5" fontWeight="600" textAnchor="middle">YOUR DIGITAL TICKET</text>
        <rect x="16" y="62" width="86" height="36" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
        <text x="59" y="87" fill="#0038A8" fontSize="22" fontWeight="900" fontFamily="var(--font-mono), monospace" textAnchor="middle">A-042</text>

        <text x="59" y="108" fill="#0F172A" fontSize="8" fontWeight="800" textAnchor="middle">TRANSCRIPT OF RECORDS</text>
        <text x="59" y="118" fill="#008837" fontSize="7.5" fontWeight="600" textAnchor="middle">STATUS: READY FOR WINDOW 2</text>

        {/* Mini Digital QR Mockup */}
        <rect x="44" y="124" width="30" height="30" rx="4" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1" />
        <rect x="48" y="128" width="7" height="7" fill="#0038A8" />
        <rect x="63" y="128" width="7" height="7" fill="#0038A8" />
        <rect x="48" y="143" width="7" height="7" fill="#0038A8" />
        <rect x="58" y="138" width="4" height="4" fill="#991B1B" />
        <rect x="64" y="144" width="4" height="4" fill="#0038A8" />

        {/* Web URL bar footer */}
        <rect x="12" y="160" width="94" height="14" rx="4" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
        <text x="59" y="170" fill="#991B1B" fontSize="6" fontWeight="700" textAnchor="middle">Booked via Mobile Web</text>

        {/* Home notch */}
        <rect x="42" y="179" width="34" height="2.5" rx="1.2" fill="#0F172A" />
      </g>

      {/* ========================================================
          STUDENT 2 (RIGHT): Female Scholar with Backpack & Phone
         ======================================================== */}
      <g transform="translate(420, 75)">
        {/* Shadow */}
        <ellipse cx="65" cy="242" rx="42" ry="7" fill="#0F172A" fillOpacity="0.08" />

        {/* College Backpack (Collegiate Crimson) */}
        <rect x="22" y="118" width="20" height="42" rx="7" fill="#991B1B" stroke="#7F1D1D" strokeWidth="1.2" />

        {/* Skirt / Pants */}
        <path d="M46 185L42 240H55L60 192L65 240H78L76 185Z" fill="#1E293B" />
        {/* Sneakers */}
        <path d="M38 240H54C54 244 51 246 45 246H38V240Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
        <path d="M76 240H92C92 244 89 246 83 246H76V240Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />

        {/* Collegiate Sweater (Cream with Collegiate Crimson V-Neck Stripes) */}
        <path d="M38 126C38 112 50 104 64 104C78 104 90 112 90 126L88 188H40L38 126Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        {/* Crimson Collegiate V-Neck Trim (Not bright red) */}
        <path d="M54 104L64 126L74 104" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Small UA Chest Monogram in Crimson */}
        <text x="73" y="136" fill="#991B1B" fontSize="7" fontWeight="900" fontFamily="sans-serif">UA</text>

        {/* Right Arm holding Smartphone with Live Tracking Screen */}
        <path d="M86 126L102 155L88 168L78 138Z" fill="#F8FAFC" />
        {/* Smartphone */}
        <rect x="94" y="142" width="22" height="38" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        <rect x="96" y="145" width="18" height="32" rx="2" fill="#EFF6FF" />
        <rect x="99" y="148" width="12" height="6" rx="1" fill="#0038A8" />
        <text x="105" y="162" fill="#0038A8" fontSize="6" fontWeight="900" textAnchor="middle">#A-042</text>
        <circle cx="105" cy="170" r="3" fill="#991B1B" />
        {/* Hand */}
        <circle cx="95" cy="164" r="5" fill="#FBBF24" />

        {/* Left Arm relaxing */}
        <path d="M38 126L26 156L34 164L44 136Z" fill="#F8FAFC" />
        <circle cx="28" cy="162" r="5" fill="#FBBF24" />

        {/* Neck */}
        <rect x="58" y="90" width="12" height="15" fill="#FBBF24" />

        {/* Head */}
        <circle cx="64" cy="74" r="18" fill="#FBBF24" />
        {/* Ponytail Hair (Dark Brown / Black) */}
        <path d="M46 72C46 54 55 46 68 46C82 46 84 58 84 68C78 66 72 63 64 63C54 63 48 67 46 72Z" fill="#3B2314" />
        <path d="M80 62C88 64 94 72 94 82C90 84 86 80 82 72Z" fill="#3B2314" />
        {/* Crimson Hairband (Not bright red) */}
        <path d="M52 57C58 53 72 53 78 57" stroke="#991B1B" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Eyes & Warm Smile */}
        <circle cx="58" cy="74" r="1.5" fill="#3B2314" />
        <circle cx="70" cy="74" r="1.5" fill="#3B2314" />
        <path d="M60 81C62 84 66 84 68 81" stroke="#92400E" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
