interface BackgroundArtProps {
  variant: 'dawn-lake' | 'misty-river' | 'mountain-lake' | 'sunset-coastline' | 'rain' | 'fog' | 'evening-fishing';
  className?: string;
}

export function BackgroundArt({ variant, className = '' }: BackgroundArtProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" fill="none">
        {variant === 'dawn-lake' && <DawnLake />}
        {variant === 'misty-river' && <MistyRiver />}
        {variant === 'mountain-lake' && <MountainLake />}
        {variant === 'sunset-coastline' && <SunsetCoastline />}
        {variant === 'rain' && <Rain />}
        {variant === 'fog' && <Fog />}
        {variant === 'evening-fishing' && <EveningFishing />}
      </svg>
    </div>
  );
}

function DawnLake() {
  return (
    <>
      <defs>
        <linearGradient id="dawn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde6d3" />
          <stop offset="40%" stopColor="#f5e6e0" />
          <stop offset="100%" stopColor="#e8eef0" />
        </linearGradient>
        <linearGradient id="dawn-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8dde8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#a8c8d8" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#dawn-sky)" opacity="0.5" />
      <circle cx="280" cy="180" r="40" fill="#fce4c8" opacity="0.4" />
      <path d="M0 420 Q100 400 200 410 T400 415 L400 800 L0 800 Z" fill="url(#dawn-water)" />
      <path d="M0 430 Q80 420 160 425 T320 430 T400 428" stroke="#fff" strokeWidth="1" opacity="0.3" fill="none" />
      <path d="M0 460 Q100 445 200 455 T400 458" stroke="#fff" strokeWidth="0.8" opacity="0.2" fill="none" />
      <path d="M0 500 Q120 485 240 495 T400 498" stroke="#fff" strokeWidth="0.6" opacity="0.15" fill="none" />
    </>
  );
}

function MistyRiver() {
  return (
    <>
      <defs>
        <linearGradient id="mist-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e0" />
          <stop offset="50%" stopColor="#d8dcd5" />
          <stop offset="100%" stopColor="#c8d0c5" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#mist-bg)" opacity="0.4" />
      <path d="M50 350 Q120 340 180 345 Q250 350 320 340 L400 335 L400 360 L0 360 Z" fill="#c5ccc0" opacity="0.3" />
      <path d="M0 400 Q80 390 160 395 Q240 400 320 390 L400 385 L400 420 L0 420 Z" fill="#b5c0b0" opacity="0.25" />
      <path d="M180 380 Q200 370 220 380 Q240 390 220 400 Q200 410 180 400 Q160 390 180 380 Z" fill="#a8b5a0" opacity="0.15" />
      <ellipse cx="200" cy="500" rx="180" ry="40" fill="#d0d5c8" opacity="0.2" />
    </>
  );
}

function MountainLake() {
  return (
    <>
      <defs>
        <linearGradient id="mt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8e2e8" />
          <stop offset="100%" stopColor="#e8eef0" />
        </linearGradient>
        <linearGradient id="mt-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b8d0d8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#98b8c8" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#mt-sky)" opacity="0.4" />
      <path d="M0 380 L60 280 L100 320 L160 240 L220 300 L280 260 L340 290 L400 270 L400 400 L0 400 Z" fill="#c0ccd0" opacity="0.3" />
      <path d="M0 400 L400 400 L400 800 L0 800 Z" fill="url(#mt-water)" />
      <path d="M60 280 L100 320 L160 240 L220 300 L280 260 L340 290 L400 270 L400 280 L340 300 L280 270 L220 310 L160 250 L100 330 L60 290 Z" fill="#fff" opacity="0.15" />
    </>
  );
}

function SunsetCoastline() {
  return (
    <>
      <defs>
        <linearGradient id="sunset-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4c8a8" />
          <stop offset="30%" stopColor="#e8b898" />
          <stop offset="60%" stopColor="#d8a8a0" />
          <stop offset="100%" stopColor="#c89898" />
        </linearGradient>
        <linearGradient id="sunset-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8a898" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a88888" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#sunset-sky)" opacity="0.35" />
      <circle cx="200" cy="200" r="50" fill="#fce0c0" opacity="0.3" />
      <path d="M0 420 L400 420 L400 800 L0 800 Z" fill="url(#sunset-water)" />
      <path d="M0 430 Q100 420 200 425 T400 428" stroke="#fff" strokeWidth="0.8" opacity="0.2" fill="none" />
      <path d="M0 470 Q120 455 240 465 T400 468" stroke="#fff" strokeWidth="0.6" opacity="0.15" fill="none" />
    </>
  );
}

function Rain() {
  return (
    <>
      <defs>
        <linearGradient id="rain-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c5cdd5" />
          <stop offset="100%" stopColor="#b0b8c5" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#rain-bg)" opacity="0.3" />
      {Array.from({ length: 30 }).map((_, i) => (
        <line
          key={i}
          x1={(i * 37) % 400}
          y1={(i * 53) % 400}
          x2={(i * 37) % 400 - 8}
          y2={(i * 53) % 400 + 30}
          stroke="#a0b0c0"
          strokeWidth="1"
          opacity="0.15"
        />
      ))}
    </>
  );
}

function Fog() {
  return (
    <>
      <defs>
        <linearGradient id="fog-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#d0d0d0" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#fog-bg)" opacity="0.25" />
      <ellipse cx="100" cy="300" rx="200" ry="60" fill="#e8e8e8" opacity="0.2" />
      <ellipse cx="300" cy="400" rx="180" ry="50" fill="#e0e0e0" opacity="0.15" />
      <ellipse cx="200" cy="500" rx="220" ry="70" fill="#d8d8d8" opacity="0.1" />
    </>
  );
}

function EveningFishing() {
  return (
    <>
      <defs>
        <linearGradient id="evening-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3040" />
          <stop offset="50%" stopColor="#3a4050" />
          <stop offset="100%" stopColor="#4a5060" />
        </linearGradient>
        <linearGradient id="evening-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4050" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2a3040" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#evening-sky)" opacity="0.3" />
      <circle cx="300" cy="150" r="30" fill="#f0e8c0" opacity="0.2" />
      <path d="M0 450 L400 450 L400 800 L0 800 Z" fill="url(#evening-water)" />
      <path d="M0 460 Q80 450 160 455 T320 458 T400 455" stroke="#a0a8b0" strokeWidth="0.8" opacity="0.15" fill="none" />
      <path d="M0 490 Q100 478 200 485 T400 488" stroke="#a0a8b0" strokeWidth="0.6" opacity="0.1" fill="none" />
    </>
  );
}
