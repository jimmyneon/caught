interface EmptyStateProps {
  icon: 'fish' | 'map' | 'calendar' | 'insights' | 'log';
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 pt-20 text-center">
      <div className="animate-breathe" style={{ filter: 'opacity(0.5)' }}>
        <EmptyIllustration variant={icon} />
      </div>
      <h2 className="mt-6 text-lg font-bold text-ink-2">{title}</h2>
      <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-ink-3">{message}</p>
    </div>
  );
}

function EmptyIllustration({ variant }: { variant: string }) {
  const color = 'var(--c-accent)';
  const water = 'var(--c-water)';

  if (variant === 'fish') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill={water} opacity="0.08" />
        <path d="M25 60c8-12 22-18 36-18 10 0 18 7 22 18-4 11-12 18-22 18-14 0-28-6-36-18z" fill={color} opacity="0.15" />
        <path d="M83 60l8-6v12z" fill={color} opacity="0.15" />
        <circle cx="40" cy="56" r="3" fill="white" opacity="0.6" />
        <circle cx="40" cy="56" r="1.5" fill={color} opacity="0.4" />
        <path d="M70 60c8-8 14-8 18-4" stroke={water} strokeWidth="1.5" fill="none" opacity="0.2" />
        <path d="M70 65c6 4 12 4 16 2" stroke={water} strokeWidth="1" fill="none" opacity="0.15" />
      </svg>
    );
  }

  if (variant === 'map') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill={water} opacity="0.08" />
        <path d="M45 35c0-3 2-5 5-5s5 2 5 5c0 4-5 10-5 10s-5-6-5-10z" fill={color} opacity="0.2" />
        <circle cx="50" cy="35" r="2" fill="white" opacity="0.5" />
        <path d="M30 70c10-5 20-5 30 0s20 5 30 0" stroke={water} strokeWidth="1.5" fill="none" opacity="0.2" />
        <path d="M30 80c10-5 20-5 30 0s20 5 30 0" stroke={water} strokeWidth="1" fill="none" opacity="0.15" />
      </svg>
    );
  }

  if (variant === 'calendar') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill={water} opacity="0.08" />
        <rect x="38" y="35" width="44" height="40" rx="6" fill={color} opacity="0.12" />
        <path d="M38 48h44M50 35v-6M70 35v-6" stroke={color} strokeWidth="1.5" opacity="0.2" />
        <circle cx="50" cy="58" r="2" fill={color} opacity="0.25" />
        <circle cx="60" cy="58" r="2" fill={color} opacity="0.15" />
        <circle cx="70" cy="58" r="2" fill={color} opacity="0.15" />
      </svg>
    );
  }

  if (variant === 'insights') {
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" fill={water} opacity="0.08" />
        <path d="M40 75L50 55L60 65L75 40" stroke={color} strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />
        <circle cx="40" cy="75" r="2.5" fill={color} opacity="0.25" />
        <circle cx="50" cy="55" r="2.5" fill={color} opacity="0.2" />
        <circle cx="60" cy="65" r="2.5" fill={color} opacity="0.2" />
        <circle cx="75" cy="40" r="2.5" fill={color} opacity="0.25" />
        <path d="M35 80h50" stroke={color} strokeWidth="1" opacity="0.1" />
      </svg>
    );
  }

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" fill={water} opacity="0.08" />
      <rect x="40" y="35" width="40" height="50" rx="4" fill={color} opacity="0.12" />
      <path d="M48 50h24M48 58h24M48 66h18" stroke={color} strokeWidth="1.5" opacity="0.15" />
    </svg>
  );
}
