import { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface Props {
  value: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}

function downscale(file: File, maxDim = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function PhotoInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="label">Photo</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) onChange(await downscale(file));
          e.target.value = '';
        }}
      />
      {value ? (
        <div className="relative">
          <img src={value} alt="Catch" className="h-44 w-full rounded-xl object-cover" />
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
            onClick={() => onChange(undefined)}
            aria-label="Remove photo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="flex h-24 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 text-stone-400 active:border-pine-600"
          onClick={() => inputRef.current?.click()}
        >
          <Camera size={22} /> Add photo
        </button>
      )}
    </div>
  );
}
