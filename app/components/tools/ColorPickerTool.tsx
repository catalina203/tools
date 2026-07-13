'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
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

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  const c = (1 - r - k) / (1 - k) || 0;
  const m = (1 - g - k) / (1 - k) || 0;
  const y = (1 - b - k) / (1 - k) || 0;
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

const HISTORY_KEY = 'colorPickerHistory';
const MAX_HISTORY = 10;

function loadHistory(): string[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHistory(colors: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(colors));
  } catch {}
}

export default function ColorPickerTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [hex, setHex] = useState('#3b82f6');
  const [hue, setHue] = useState(217);
  const [sat, setSat] = useState(100);
  const [lig, setLig] = useState(50);
  const [history, setHistory] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const rgb = useMemo(() => hslToRgb(hue, sat, lig), [hue, sat, lig]);
  const currentHex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsl = useMemo(() => ({ h: hue, s: sat, l: lig }), [hue, sat, lig]);
  const hsv = useMemo(() => rgbToHsv(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  const formatValues = useMemo(() => [
    { key: 'hex', value: currentHex },
    { key: 'rgb', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'hsl', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { key: 'hsv', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    { key: 'cmyk', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ], [currentHex, rgb, hsl, hsv, cmyk]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const updateFromHex = useCallback((newHex: string) => {
    setHex(newHex);
    const parsed = hexToRgb(newHex);
    if (parsed) {
      const newHsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
      setHue(newHsl.h);
      setSat(newHsl.s);
      setLig(newHsl.l);
    }
  }, []);

  const addToHistory = useCallback((colorHex: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((c) => c !== colorHex);
      const updated = [colorHex, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const handleColorInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateFromHex(val);
  }, [updateFromHex]);

  const handleHueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const h = Number(e.target.value);
    setHue(h);
    const newRgb = hslToRgb(h, sat, lig);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [sat, lig]);

  const handleSatChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const s = Number(e.target.value);
    setSat(s);
    const newRgb = hslToRgb(hue, s, lig);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [hue, lig]);

  const handleLigChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const l = Number(e.target.value);
    setLig(l);
    const newRgb = hslToRgb(hue, sat, l);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [hue, sat]);

  const drawPalette = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const hueColor = hslToRgb(hue, 100, 50);
    const hueHex = rgbToHex(hueColor.r, hueColor.g, hueColor.b);

    const gradWhite = ctx.createLinearGradient(0, 0, w, 0);
    gradWhite.addColorStop(0, '#ffffff');
    gradWhite.addColorStop(1, hueHex);
    ctx.fillStyle = gradWhite;
    ctx.fillRect(0, 0, w, h);

    const gradBlack = ctx.createLinearGradient(0, 0, 0, h);
    gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
    gradBlack.addColorStop(1, '#000000');
    ctx.fillStyle = gradBlack;
    ctx.fillRect(0, 0, w, h);

    const pickerX = (sat / 100) * w;
    const pickerY = (1 - lig / 100) * h;

    ctx.beginPath();
    ctx.arc(pickerX, pickerY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pickerX, pickerY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [hue, sat, lig]);

  useEffect(() => {
    drawPalette();
  }, [drawPalette]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsInteracting(true);
    updateCanvasColor(e);
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isInteracting) {
      updateCanvasColor(e);
    }
  }, [isInteracting]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  const handleCanvasMouseLeave = useCallback(() => {
    if (isInteracting) {
      setIsInteracting(false);
    }
  }, [isInteracting]);

  const updateCanvasColor = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const s = Math.round((x / rect.width) * 100);
    const l = Math.round((1 - y / rect.height) * 100);
    setSat(s);
    setLig(l);
    const newRgb = hslToRgb(hue, s, l);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [hue]);

  const handleSelectColor = useCallback((colorHex: string) => {
    updateFromHex(colorHex);
  }, [updateFromHex]);

  const copyToClipboard = useCallback(async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {}
  }, []);

  const handleSelectHistory = useCallback((colorHex: string) => {
    updateFromHex(colorHex);
  }, [updateFromHex]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.colorPicker')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.colorPicker')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.colorPickerDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Color Palette & Sliders */}
          <div className="lg:col-span-2 space-y-6">
            {/* Canvas Palette */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.colorPreview')}</h3>
              <div
                ref={canvasContainerRef}
                className="relative w-full select-none"
                style={{ touchAction: 'none' }}
              >
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={300}
                  className="w-full h-auto rounded-xl cursor-crosshair"
                  style={{ aspectRatio: '400/300' }}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseLeave}
                />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 rounded-xl shadow-lg border-2 border-gray-200 dark:border-white/10 transition-colors" style={{ backgroundColor: currentHex }} />
                <div>
                  <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{currentHex}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                </div>
              </div>
            </div>

            {/* HSL Sliders */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">HSL {t('devTools.colorPicker')}</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{t('devTools.hue')}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono">{hue}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={hue}
                    onChange={handleHueChange}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                    }}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{t('devTools.saturation')}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono">{sat}%</span>
                  </div>
                  <div className="relative w-full h-2 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 rounded-lg" style={{ background: `linear-gradient(to right, ${(() => { const {r, g, b} = hslToRgb(hue, 0, 50); return rgbToHex(r, g, b); })()}, ${(() => { const {r, g, b} = hslToRgb(hue, 100, 50); return rgbToHex(r, g, b); })()})` }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sat}
                      onChange={handleSatChange}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer"
                      style={{ '--range-progress': `${sat}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{t('devTools.lightness')}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono">{lig}%</span>
                  </div>
                  <div className="relative w-full h-2 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 rounded-lg" style={{ background: `linear-gradient(to right, #000000, ${(() => { const {r, g, b} = hslToRgb(hue, sat, 50); return rgbToHex(r, g, b); })()}, #ffffff)` }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={lig}
                      onChange={handleLigChange}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer"
                      style={{ '--range-progress': `${lig}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Color History */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.colorHistory')}</h3>
              {history.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {history.map((color, i) => (
                    <button
                      key={`${color}-${i}`}
                      onClick={() => handleSelectHistory(color)}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 dark:border-white/10 hover:scale-110 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500">{t('devTools.noHistory') || 'No colors yet'}</p>
              )}
            </div>
          </div>

          {/* Right: Formats & Pickers */}
          <div className="space-y-6">
            {/* Color Input */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.colorPicker')}</h3>
              <input
                type="color"
                value={hex}
                onChange={(e) => {
                  handleColorInput(e);
                  addToHistory(e.target.value);
                }}
                className="w-full h-16 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
              />
            </div>

            {/* Color Formats */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.colorFormats')}</h3>
              <div className="space-y-3">
                {formatValues.map((item, i) => (
                  <div key={item.key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t(`devTools.${item.key}`)}</span>
                      <button
                        onClick={() => {
                          copyToClipboard(item.value, i);
                          if (item.key === 'hex') addToHistory(item.value);
                        }}
                        className={`px-3 py-1 text-xs rounded-lg border transition-all duration-200 ${
                          copiedIndex === i
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50'
                        }`}
                      >
                        {copiedIndex === i ? t('devTools.copied') : t('devTools.copy')}
                      </button>
                    </div>
                    <div className="font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 truncate">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Color Swatches */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Colors</h3>
              <div className="grid grid-cols-6 gap-2">
                {[
                  '#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#0000ff',
                  '#8800ff', '#ff00ff', '#ff0088', '#00ff88', '#00ffff', '#888888',
                  '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      handleSelectColor(color);
                      addToHistory(color);
                    }}
                    className="w-full aspect-square rounded-lg border border-gray-200 dark:border-white/10 hover:scale-110 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
