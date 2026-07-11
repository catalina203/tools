'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function hexToRgb(hex: string): {r: number, g: number, b: number} | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): {h: number, s: number, l: number} {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): {r: number, g: number, b: number} {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHsv(r: number, g: number, b: number): {h: number, s: number, v: number} {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function hsvToRgb(h: number, s: number, v: number): {r: number, g: number, b: number} {
  h /= 360; s /= 100; v /= 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToCmyk(r: number, g: number, b: number): {c: number, m: number, y: number, k: number} {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

function cmykToRgb(c: number, m: number, y: number, k: number): {r: number, g: number, b: number} {
  c /= 100; m /= 100; y /= 100; k /= 100;
  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));
  return { r, g, b };
}

function parseRgb(input: string): {r: number, g: number, b: number} | null {
  const match = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*/i);
  if (match) return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  return null;
}

function parseHsl(input: string): {h: number, s: number, l: number} | null {
  const match = input.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*/i);
  if (match) return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
  return null;
}

function parseHsv(input: string): {h: number, s: number, v: number} | null {
  const match = input.match(/hsv\(?\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*/i);
  if (match) return { h: parseInt(match[1]), s: parseInt(match[2]), v: parseInt(match[3]) };
  return null;
}

function parseCmyk(input: string): {c: number, m: number, y: number, k: number} | null {
  const match = input.match(/cmyk\(?\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*/i);
  if (match) return { c: parseInt(match[1]), m: parseInt(match[2]), y: parseInt(match[3]), k: parseInt(match[4]) };
  return null;
}

function computeConversions(input: string, format: string): { conversions: Record<string, string>; error: string } {
  const result: Record<string, string> = {};
  let rgb: {r: number, g: number, b: number} | null = null;
  
  try {
    switch (format) {
      case 'hex':
        const hexRgb = hexToRgb(input);
        if (!hexRgb) throw new Error('Invalid hex color');
        rgb = hexRgb;
        break;
      case 'rgb': {
        const parsed = parseRgb(input);
        if (!parsed) throw new Error('Invalid RGB format');
        rgb = parsed;
        break;
      }
      case 'hsl': {
        const parsed = parseHsl(input);
        if (!parsed) throw new Error('Invalid HSL format');
        rgb = hslToRgb(parsed.h, parsed.s, parsed.l);
        break;
      }
      case 'hsv': {
        const parsed = parseHsv(input);
        if (!parsed) throw new Error('Invalid HSV format');
        rgb = hsvToRgb(parsed.h, parsed.s, parsed.v);
        break;
      }
      case 'cmyk': {
        const parsed = parseCmyk(input);
        if (!parsed) throw new Error('Invalid CMYK format');
        rgb = cmykToRgb(parsed.c, parsed.m, parsed.y, parsed.k);
        break;
      }
    }
    
    if (!rgb) throw new Error('Invalid color');
    
    const { r, g, b } = rgb;
    const newResult: Record<string, string> = {};
    newResult.hex = rgbToHex(r, g, b);
    newResult.rgb = `rgb(${r}, ${g}, ${b})`;
    newResult.rgba = `rgba(${r}, ${g}, ${b}, 1)`;
    const hsl = rgbToHsl(r, g, b);
    newResult.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    const hsv = rgbToHsv(r, g, b);
    newResult.hsv = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    const cmyk = rgbToCmyk(r, g, b);
    newResult.cmyk = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    
    return { conversions: newResult, error: '' };
  } catch {
    return { conversions: {}, error: 'devTools.invalidColor' };
  }
}

export default function ColorConvertTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [input, setInput] = useState('#3b82f6');
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk'>('hex');

  const { conversions, error } = useMemo(() => 
    computeConversions(input, format), 
    [input, format]
  );

  const copyValue = (value: string) => {
    if (value) navigator.clipboard.writeText(value);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.colorConvert')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.colorConvert')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.colorConvertDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.inputColor')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.inputFormat')}</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value as 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk')} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="hex">{t('devTools.hex')}</option>
                    <option value="rgb">{t('devTools.rgb')}</option>
                    <option value="hsl">{t('devTools.hsl')}</option>
                    <option value="hsv">{t('devTools.hsv')}</option>
                    <option value="cmyk">{t('devTools.cmyk')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('devTools.colorValue')}</label>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder={t('devTools.colorInputPlaceholder')} />
                  {format === 'hex' && (
                    <input type="color" value={input} onChange={(e) => setInput(e.target.value)} className="w-full h-10 mt-2 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer" />
                  )}
                </div>
                <div className="relative">
                  <div className="w-full h-20 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-indigo-500 to-purple-500 rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: conversions.hex || '#3b82f6' }} />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2 mt-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.conversions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'hex', label: t('devTools.hex'), icon: '#' },
                  { key: 'rgb', label: t('devTools.rgb'), icon: 'RGB' },
                  { key: 'rgba', label: t('devTools.rgba'), icon: 'RGBA' },
                  { key: 'hsl', label: t('devTools.hsl'), icon: 'HSL' },
                  { key: 'hsv', label: t('devTools.hsv'), icon: 'HSV' },
                  { key: 'cmyk', label: t('devTools.cmyk'), icon: 'CMYK' }
                ].map(({ key, label, icon }) => (
                  <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-mono">{icon}</span>
                        {label}
                      </span>
                      <button onClick={() => copyValue(conversions[key] || '')} disabled={!conversions[key]} className="px-3 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.copy')}</button>
                    </div>
                    <input type="text" value={conversions[key] || ''} readOnly className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.colorPreview')}</h3>
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 rounded-xl shadow-lg" style={{ backgroundColor: conversions.hex || '#3b82f6' }} />
              </div>
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {conversions.hex && <span className="font-mono">{conversions.hex}</span>}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-blue-500">•</span>{t('devTools.colorConvertTip1')}</li><li className="flex items-start gap-2"><span className="text-blue-500">•</span>{t('devTools.colorConvertTip2')}</li><li className="flex items-start gap-2"><span className="text-blue-500">•</span>{t('devTools.colorConvertTip3')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}