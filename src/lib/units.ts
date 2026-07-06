const KG_PER_LB = 0.45359237;

export function kgToLbOz(kg: number): { lb: number; oz: number } {
  const totalOz = (kg / KG_PER_LB) * 16;
  const lb = Math.floor(totalOz / 16);
  const oz = Math.round((totalOz - lb * 16) * 10) / 10;
  return oz >= 16 ? { lb: lb + 1, oz: 0 } : { lb, oz };
}

export function lbOzToKg(lb: number, oz: number): number {
  return Math.round((lb + oz / 16) * KG_PER_LB * 1000) / 1000;
}

export function formatWeight(kg: number | undefined, units: 'metric' | 'imperial'): string {
  if (kg == null) return '';
  if (units === 'metric') return `${Math.round(kg * 100) / 100} kg`;
  const { lb, oz } = kgToLbOz(kg);
  return `${lb} lb ${oz} oz`;
}
