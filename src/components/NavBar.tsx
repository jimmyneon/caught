import { NavLink } from 'react-router-dom';
import { Fish, BookOpen, MapPin, Calendar, CalendarCheck } from 'lucide-react';

const items = [
  { to: '/', label: 'Catch', Icon: Fish },
  { to: '/log', label: 'Log', Icon: BookOpen },
  { to: '/map', label: 'Map', Icon: MapPin },
  { to: '/plan', label: 'Plan', Icon: CalendarCheck },
  { to: '/calendar', label: 'Dates', Icon: Calendar },
];

export default function NavBar() {
  return (
    <nav className="relative z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
      <div
        className="glass flex items-center justify-around rounded-full px-2 py-2"
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-col items-center gap-1 rounded-full px-3 py-1.5 transition-all"
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? 'var(--c-accent)' : 'var(--c-ink-3)', transition: 'all 0.2s ease' }}
                />
                <span
                  className="text-[10px] font-bold tracking-tight"
                  style={{ color: isActive ? 'var(--c-accent)' : 'var(--c-ink-3)', transition: 'all 0.2s ease' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
