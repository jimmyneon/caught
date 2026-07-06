import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import BottomSheet from './BottomSheet';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  placeholder?: string;
  options: Option[];
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  capitalize?: boolean;
}

export default function SelectDropdown({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  allowCustom = false,
  customPlaceholder = 'Or type your own…',
  capitalize = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const displayValue = value
    ? capitalize
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value
    : placeholder;

  return (
    <div>
      <label className="label">{label}</label>
      <button
        type="button"
        className="field flex items-center justify-between"
        onClick={() => setOpen(true)}
        style={{ color: value ? 'var(--c-ink)' : 'var(--c-ink-3)' }}
      >
        <span className={capitalize ? 'capitalize' : ''}>{displayValue}</span>
        <ChevronDown size={18} style={{ color: 'var(--c-ink-3)' }} />
      </button>

      <BottomSheet open={open} onClose={() => { setOpen(false); setCustomMode(false); }}>
        <div className="flex flex-col gap-1.5">
          <h2 className="pb-2 text-lg font-extrabold text-ink">{label}</h2>

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors active:bg-surface-3"
              style={{
                background: value === opt.value ? 'var(--c-accent-bg)' : 'var(--c-surface-3)',
                color: value === opt.value ? 'var(--c-accent)' : 'var(--c-ink)',
              }}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span className={capitalize ? 'capitalize' : ''}>{opt.label}</span>
              {value === opt.value && <Check size={18} />}
            </button>
          ))}

          {allowCustom && (
            <>
              {!customMode ? (
                <button
                  type="button"
                  className="rounded-xl px-4 py-3.5 text-left text-sm font-medium transition-colors active:bg-surface-3"
                  style={{ color: 'var(--c-ink-3)', background: 'var(--c-surface-3)' }}
                  onClick={() => setCustomMode(true)}
                >
                  + Custom…
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    className="field"
                    placeholder={customPlaceholder}
                    value={customValue}
                    autoFocus
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customValue.trim()) {
                        onChange(customValue.trim());
                        setOpen(false);
                        setCustomMode(false);
                        setCustomValue('');
                      }
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (customValue.trim()) {
                        onChange(customValue.trim());
                        setOpen(false);
                        setCustomMode(false);
                        setCustomValue('');
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
