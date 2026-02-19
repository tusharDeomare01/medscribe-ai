"use client";

export function MedicalIllustrationLogin() {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[420px] h-auto drop-shadow-2xl"
    >
      {/* Background circle glow */}
      <defs>
        <radialGradient id="glowLogin" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>

      <circle cx="300" cy="250" r="220" fill="url(#glowLogin)" className="illust-fill" />

      {/* Main clipboard/document — DrawSVG stroke */}
      <rect className="illust-draw" x="175" y="60" width="250" height="340" rx="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" opacity="0" />
      <rect x="175" y="60" width="250" height="340" rx="20" fill="url(#cardGrad)" className="illust-fill" />

      {/* Clipboard top */}
      <rect className="illust-draw" x="240" y="45" width="120" height="30" rx="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0" />
      <rect x="240" y="45" width="120" height="30" rx="15" fill="url(#primaryGrad)" opacity="0.9" className="illust-fill" />
      <circle cx="300" cy="60" r="6" fill="white" opacity="0.9" className="illust-fill" />

      {/* Lines representing text */}
      <rect x="210" y="110" width="180" height="8" rx="4" fill="rgba(255,255,255,0.12)" className="illust-fill" />
      <rect x="210" y="130" width="140" height="8" rx="4" fill="rgba(255,255,255,0.08)" className="illust-fill" />
      <rect x="210" y="150" width="160" height="8" rx="4" fill="rgba(255,255,255,0.06)" className="illust-fill" />

      {/* SOAP Section markers — DrawSVG boxes + fill labels */}
      <rect className="illust-draw" x="210" y="180" width="28" height="28" rx="8" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0" />
      <rect x="210" y="180" width="28" height="28" rx="8" fill="#0ea5e9" opacity="0.2" className="illust-fill" />
      <text x="218" y="200" fill="#0ea5e9" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif" className="illust-fill">S</text>
      <rect x="245" y="184" width="120" height="6" rx="3" fill="rgba(255,255,255,0.1)" className="illust-fill" />
      <rect x="245" y="196" width="90" height="6" rx="3" fill="rgba(255,255,255,0.06)" className="illust-fill" />

      <rect className="illust-draw" x="210" y="220" width="28" height="28" rx="8" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0" />
      <rect x="210" y="220" width="28" height="28" rx="8" fill="#10b981" opacity="0.2" className="illust-fill" />
      <text x="218" y="240" fill="#10b981" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif" className="illust-fill">O</text>
      <rect x="245" y="224" width="130" height="6" rx="3" fill="rgba(255,255,255,0.1)" className="illust-fill" />
      <rect x="245" y="236" width="100" height="6" rx="3" fill="rgba(255,255,255,0.06)" className="illust-fill" />

      <rect className="illust-draw" x="210" y="260" width="28" height="28" rx="8" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0" />
      <rect x="210" y="260" width="28" height="28" rx="8" fill="#f59e0b" opacity="0.2" className="illust-fill" />
      <text x="218" y="280" fill="#f59e0b" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif" className="illust-fill">A</text>
      <rect x="245" y="264" width="110" height="6" rx="3" fill="rgba(255,255,255,0.1)" className="illust-fill" />
      <rect x="245" y="276" width="80" height="6" rx="3" fill="rgba(255,255,255,0.06)" className="illust-fill" />

      <rect className="illust-draw" x="210" y="300" width="28" height="28" rx="8" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0" />
      <rect x="210" y="300" width="28" height="28" rx="8" fill="#8b5cf6" opacity="0.2" className="illust-fill" />
      <text x="219" y="320" fill="#8b5cf6" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif" className="illust-fill">P</text>
      <rect x="245" y="304" width="140" height="6" rx="3" fill="rgba(255,255,255,0.1)" className="illust-fill" />
      <rect x="245" y="316" width="95" height="6" rx="3" fill="rgba(255,255,255,0.06)" className="illust-fill" />

      {/* Stethoscope icon — DrawSVG */}
      <circle cx="480" cy="120" r="45" fill="url(#primaryGrad)" opacity="0.12" className="illust-fill" />
      <path
        className="illust-draw"
        d="M465 105 C465 95, 475 88, 480 88 C485 88, 495 95, 495 105 L495 120 C495 132, 487 140, 480 140 C473 140, 465 132, 465 120Z"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        fill="none"
        opacity="0"
      />
      <circle cx="480" cy="145" r="5" fill="hsl(var(--primary))" opacity="0.6" className="illust-fill" />

      {/* AI Brain chip — DrawSVG */}
      <circle cx="120" cy="350" r="40" fill="rgba(139,92,246,0.1)" className="illust-fill" />
      <rect className="illust-draw" x="100" y="330" width="40" height="40" rx="8" fill="none" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" opacity="0" />
      <rect x="100" y="330" width="40" height="40" rx="8" fill="rgba(139,92,246,0.15)" className="illust-fill" />
      {/* Brain circuit lines — DrawSVG */}
      <line className="illust-draw" x1="108" y1="340" x2="132" y2="340" stroke="#8b5cf6" strokeWidth="1.5" opacity="0" />
      <line className="illust-draw" x1="108" y1="350" x2="132" y2="350" stroke="#8b5cf6" strokeWidth="1.5" opacity="0" />
      <line className="illust-draw" x1="108" y1="360" x2="132" y2="360" stroke="#8b5cf6" strokeWidth="1.5" opacity="0" />
      <line className="illust-draw" x1="115" y1="335" x2="115" y2="365" stroke="#8b5cf6" strokeWidth="1.5" opacity="0" />
      <line className="illust-draw" x1="125" y1="335" x2="125" y2="365" stroke="#8b5cf6" strokeWidth="1.5" opacity="0" />

      {/* NER highlight badges — float in from right */}
      <g className="illust-badge">
        <rect x="430" y="250" width="100" height="28" rx="14" fill="#ef444420" stroke="#ef444440" strokeWidth="1" />
        <text x="448" y="269" fill="#f87171" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">Diagnosis</text>
      </g>

      <g className="illust-badge">
        <rect x="440" y="290" width="105" height="28" rx="14" fill="#0ea5e920" stroke="#0ea5e940" strokeWidth="1" />
        <text x="453" y="309" fill="#38bdf8" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">Medication</text>
      </g>

      <g className="illust-badge">
        <rect x="420" y="330" width="95" height="28" rx="14" fill="#10b98120" stroke="#10b98140" strokeWidth="1" />
        <text x="435" y="349" fill="#34d399" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">Procedure</text>
      </g>

      {/* Floating particles — pulsing */}
      <circle className="illust-particle" cx="100" cy="120" r="3" fill="hsl(var(--primary))" opacity="0.3" />
      <circle className="illust-particle" cx="500" cy="400" r="2.5" fill="#8b5cf6" opacity="0.4" />
      <circle className="illust-particle" cx="150" cy="200" r="2" fill="#10b981" opacity="0.3" />
      <circle className="illust-particle" cx="520" cy="180" r="3" fill="#f59e0b" opacity="0.3" />
    </svg>
  );
}

export function MedicalIllustrationRegister() {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[420px] h-auto drop-shadow-2xl"
    >
      <defs>
        <radialGradient id="glowRegister" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      <circle cx="300" cy="250" r="220" fill="url(#glowRegister)" className="illust-fill" />

      {/* Central user profile card — DrawSVG */}
      <rect className="illust-draw" x="180" y="80" width="240" height="300" rx="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" opacity="0" />
      <rect x="180" y="80" width="240" height="300" rx="20" fill="rgba(255,255,255,0.05)" className="illust-fill" />

      {/* Avatar circle — DrawSVG ring */}
      <circle className="illust-draw" cx="300" cy="160" r="45" fill="none" stroke="url(#regGrad)" strokeWidth="2" opacity="0" />
      <circle cx="300" cy="160" r="45" fill="url(#regGrad)" opacity="0.15" className="illust-fill" />
      {/* Person icon — DrawSVG */}
      <circle className="illust-draw" cx="300" cy="148" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0" />
      <path className="illust-draw" d="M275 185 C275 170, 285 162, 300 162 C315 162, 325 170, 325 185" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" opacity="0" strokeLinecap="round" />

      {/* + badge */}
      <circle cx="330" cy="130" r="14" fill="url(#regGrad)" className="illust-fill" />
      <line className="illust-draw" x1="324" y1="130" x2="336" y2="130" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0" />
      <line className="illust-draw" x1="330" y1="124" x2="330" y2="136" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0" />

      {/* Form field lines */}
      <rect x="210" y="220" width="180" height="12" rx="6" fill="rgba(255,255,255,0.08)" className="illust-fill" />
      <rect x="210" y="245" width="180" height="12" rx="6" fill="rgba(255,255,255,0.06)" className="illust-fill" />
      <rect x="210" y="270" width="180" height="12" rx="6" fill="rgba(255,255,255,0.05)" className="illust-fill" />

      {/* Submit button shape */}
      <rect x="210" y="305" width="180" height="36" rx="18" fill="url(#regGrad)" opacity="0.2" className="illust-fill" />
      <rect x="260" y="317" width="80" height="6" rx="3" fill="rgba(255,255,255,0.3)" className="illust-fill" />

      {/* Shield / security badge — DrawSVG */}
      <g transform="translate(90, 100)">
        <circle cx="30" cy="30" r="35" fill="rgba(16,185,129,0.08)" className="illust-fill" />
        <path
          className="illust-draw"
          d="M30 8 L50 18 L50 35 C50 50 40 58 30 62 C20 58 10 50 10 35 L10 18 Z"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          opacity="0"
        />
        <path
          d="M30 8 L50 18 L50 35 C50 50 40 58 30 62 C20 58 10 50 10 35 L10 18 Z"
          fill="rgba(16,185,129,0.12)"
          className="illust-fill"
        />
        <path className="illust-draw" d="M22 32 L28 38 L40 24" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
      </g>

      {/* Microphone / voice icon — DrawSVG */}
      <g transform="translate(460, 130)">
        <circle cx="25" cy="25" r="30" fill="rgba(14,165,233,0.08)" className="illust-fill" />
        <rect className="illust-draw" x="18" y="10" width="14" height="22" rx="7" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0" />
        <path className="illust-draw" d="M12 28 C12 38 18 42 25 42 C32 42 38 38 38 28" stroke="#0ea5e9" strokeWidth="2" fill="none" opacity="0" />
        <line className="illust-draw" x1="25" y1="42" x2="25" y2="48" stroke="#0ea5e9" strokeWidth="2" opacity="0" />
      </g>

      {/* Chart / analytics icon */}
      <g transform="translate(460, 300)">
        <circle cx="25" cy="25" r="30" fill="rgba(245,158,11,0.08)" className="illust-fill" />
        <rect x="12" y="30" width="8" height="14" rx="2" fill="#f59e0b" opacity="0.4" className="illust-fill" />
        <rect x="22" y="22" width="8" height="22" rx="2" fill="#f59e0b" opacity="0.5" className="illust-fill" />
        <rect x="32" y="14" width="8" height="30" rx="2" fill="#f59e0b" opacity="0.6" className="illust-fill" />
      </g>

      {/* Connected nodes / network — DrawSVG */}
      <circle cx="100" cy="300" r="6" fill="#8b5cf6" opacity="0.4" className="illust-fill" />
      <circle cx="130" cy="340" r="4" fill="#8b5cf6" opacity="0.3" className="illust-fill" />
      <circle cx="80" cy="350" r="5" fill="#8b5cf6" opacity="0.35" className="illust-fill" />
      <line className="illust-draw" x1="100" y1="300" x2="130" y2="340" stroke="#8b5cf6" strokeWidth="1" opacity="0" />
      <line className="illust-draw" x1="100" y1="300" x2="80" y2="350" stroke="#8b5cf6" strokeWidth="1" opacity="0" />
      <line className="illust-draw" x1="130" y1="340" x2="80" y2="350" stroke="#8b5cf6" strokeWidth="1" opacity="0" />

      {/* Floating particles — pulsing */}
      <circle className="illust-particle" cx="520" cy="80" r="3" fill="hsl(var(--primary))" opacity="0.3" />
      <circle className="illust-particle" cx="70" cy="200" r="2.5" fill="#10b981" opacity="0.4" />
      <circle className="illust-particle" cx="540" cy="420" r="2" fill="#f59e0b" opacity="0.3" />
    </svg>
  );
}
