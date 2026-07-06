import { jsPDF } from 'jspdf';
import type { CatchRecord, Settings } from '../types';
import { formatWeight } from './units';
import { fmtDate, fmtTime, windSector } from './format';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportCSV(catches: CatchRecord[]) {
  const headers = [
    'date', 'time', 'species', 'weight_kg', 'method', 'water_type', 'kept', 'notes',
    'lat', 'lon', 'temp_c', 'weather', 'wind_kph', 'wind_dir', 'pressure_hpa',
    'pressure_trend', 'moon', 'tide', 'tide_height_m',
  ];
  const rows = catches.map((c) => {
    const d = new Date(c.createdAt);
    const cond = c.conditions ?? {};
    return [
      d.toLocaleDateString(), d.toLocaleTimeString(), c.species, c.weightKg, c.method,
      c.waterType, c.kept == null ? '' : c.kept ? 'kept' : 'released', c.notes,
      c.lat, c.lon, cond.tempC, cond.weatherLabel, cond.windKph,
      cond.windDir != null ? windSector(cond.windDir) : '', cond.pressureHpa,
      cond.pressureTrend, cond.moonLabel, cond.tideState, cond.tideHeightM,
    ].map(csvEscape).join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  download(new Blob([csv], { type: 'text/csv' }), 'caught-log.csv');
}

export function exportPDF(catches: CatchRecord[], settings: Settings) {
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(20);
  doc.text('Caught \u2014 Catch Report', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`${catches.length} catches \u2022 generated ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;
  for (const c of catches) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const cond = c.conditions ?? {};
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const title = `${c.species ?? 'Unknown fish'}${c.weightKg != null ? ` \u2014 ${formatWeight(c.weightKg, settings.units)}` : ''}`;
    doc.text(title, 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const parts = [
      `${fmtDate(c.createdAt)} ${fmtTime(c.createdAt)}`,
      c.waterType,
      c.method,
      cond.tempC != null ? `${Math.round(cond.tempC)}\u00B0C ${cond.weatherLabel ?? ''}` : undefined,
      cond.windDir != null ? `wind ${windSector(cond.windDir)} ${Math.round(cond.windKph ?? 0)} km/h` : undefined,
      cond.pressureHpa != null ? `${Math.round(cond.pressureHpa)} hPa ${cond.pressureTrend ?? ''}` : undefined,
      cond.moonLabel,
      cond.tideState ? `tide ${cond.tideState}` : undefined,
      c.kept == null ? undefined : c.kept ? 'kept' : 'released',
    ].filter(Boolean);
    doc.text(parts.join('  \u2022  '), 14, y);
    y += 4;
    if (c.notes) {
      doc.text(doc.splitTextToSize(c.notes, 180), 14, y);
      y += 4;
    }
    y += 5;
  }
  doc.save('caught-report.pdf');
}
