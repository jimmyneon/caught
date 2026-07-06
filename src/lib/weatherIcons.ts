import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Moon,
} from 'lucide-react';
import type { ComponentType } from 'react';

export function weatherIcon(code: number, isNight = false): ComponentType<{ size?: number; className?: string }> {
  if (code <= 1) return isNight ? Moon : Sun;
  if (code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code <= 48) return CloudFog;
  if (code <= 67 || (code >= 80 && code <= 82)) return code <= 57 ? CloudDrizzle : CloudRain;
  if (code <= 86) return CloudSnow;
  return CloudLightning;
}
