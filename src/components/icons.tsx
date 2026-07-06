interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (size: number, className: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
});

export function FishIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 12c4-5 10-7 14-7 4 0 6 3 6 7s-2 7-6 7c-4 0-10-2-14-7z" />
      <path d="M23 12l-3-3v6z" />
      <circle cx="8" cy="11" r="0.8" fill="currentColor" />
      <path d="M12 7c-1-2-3-3-5-3 1 2 1 4 1 5" />
      <path d="M12 17c-1 2-3 3-5 3 1-2 1-4 1-5" />
    </svg>
  );
}

export function WeatherIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M6 16a4 4 0 1 1 1-7.9 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 18 16z" />
    </svg>
  );
}

export function WindIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 8h11a3 3 0 1 0-3-3" />
      <path d="M3 12h15a3 3 0 1 1-3 3" />
      <path d="M3 16h9a2.5 2.5 0 1 1-2.5 2.5" />
    </svg>
  );
}

export function PressureIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l4-3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M12 5v1.5M19 12h-1.5M12 19v-1.5M5 12h1.5" />
    </svg>
  );
}

export function WaterTempIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M10 13V5a2 2 0 1 1 4 0v8a4 4 0 1 1-4 0z" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TideIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 7c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </svg>
  );
}

export function MoonIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function GpsIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 1 8 8c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 8-8z" />
    </svg>
  );
}

export function CalendarIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function CameraIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 7a2 2 0 0 1 2-2h2l1.5-2h7L17 5h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function NotesIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M5 3h10l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v4h4M8 12h8M8 16h6" />
    </svg>
  );
}

export function TrophyIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 4H4v2a3 3 0 0 0 3 3M17 4h3v2a3 3 0 0 1-3 3" />
      <path d="M12 13v4M9 21h6M10 21v-4h4v4" />
    </svg>
  );
}

export function RiverIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M7 2c2 3 0 5 2 8s0 5 2 8 0 5 2 4" />
      <path d="M14 2c2 3 0 5 2 8s0 5 2 8" opacity="0.5" />
    </svg>
  );
}

export function LakeIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <ellipse cx="12" cy="12" rx="9" ry="6" />
      <path d="M5 11c2-1 4-1 6 0s4 1 6 0" opacity="0.4" />
    </svg>
  );
}

export function SeaIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M2 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0 2 2 2 2" />
      <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0 2 2 2 2" />
      <path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" opacity="0.5" />
    </svg>
  );
}

export function BoatIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M3 14h18l-2 5a2 2 0 0 1-2 1H7a2 2 0 0 1-2-1z" />
      <path d="M12 14V6M12 6l5 3M12 6L7 9" />
    </svg>
  );
}

export function BaitIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <ellipse cx="12" cy="12" rx="4" ry="7" />
      <path d="M12 5v14" opacity="0.4" />
      <circle cx="10" cy="10" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function LureIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 2v6" />
      <ellipse cx="12" cy="12" rx="3.5" ry="5" />
      <path d="M12 17v3M10 20h4" />
      <circle cx="11" cy="11" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function FlyIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 6c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z" />
      <path d="M12 2v4M12 14v6M8 8l-4-2M16 8l4-2M8 12l-4 2M16 12l4 2" opacity="0.4" />
    </svg>
  );
}

export function SunriseIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 2v6M4.2 10.2l1.4 1.4M2 18h2M20 18h2M18.4 11.6l1.4-1.4" />
      <path d="M2 18a10 10 0 0 1 20 0" />
      <path d="M2 22h20" />
    </svg>
  );
}

export function SunsetIcon({ size = 24, className = '', strokeWidth = 1.8 }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={strokeWidth}>
      <path d="M12 10V2M4.2 10.2l1.4 1.4M2 18h2M20 18h2M18.4 11.6l1.4-1.4" />
      <path d="M2 18a10 10 0 0 1 20 0" />
      <path d="M2 22h20M12 14l-2 2 2 2 2-2z" />
    </svg>
  );
}
