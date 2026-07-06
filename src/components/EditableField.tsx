import { useState, useRef, useEffect } from 'react';
import { Check, Pencil } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  placeholder?: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  display?: string;
}

export default function EditableField({ label, value, placeholder, onSave, multiline, display }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div>
        <div className="label">{label}</div>
        <div className="flex gap-2">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="field flex-1 resize-none"
              rows={3}
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Escape') cancel();
              }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              className="field flex-1"
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save();
                if (e.key === 'Escape') cancel();
              }}
            />
          )}
          <button
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'var(--c-accent)', color: '#fff' }}
            onClick={save}
            aria-label="Save"
          >
            <Check size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="label">{label}</div>
      <button
        className="flex w-full items-center gap-2 text-left"
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        <span
          className="flex-1 text-sm font-semibold"
          style={{ color: value ? 'var(--c-ink)' : 'var(--c-ink-3)' }}
        >
          {display || value || placeholder || 'Tap to add'}
        </span>
        <Pencil size={14} style={{ color: 'var(--c-ink-3)' }} />
      </button>
    </div>
  );
}
