'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function formatRatio(ratio: number): string {
  return ratio.toFixed(2) + ':1';
}

function toGrayscale(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return '#' + [gray, gray, gray].map(x => {
    const h = x.toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

function adjustBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.max(0, Math.min(255, rgb.r + amount));
  const g = Math.max(0, Math.min(255, rgb.g + amount));
  const b = Math.max(0, Math.min(255, rgb.b + amount));
  return '#' + [r, g, b].map(x => {
    const h = x.toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

type WCAGLevel = 'AA_NORMAL' | 'AA_LARGE' | 'AAA_NORMAL' | 'AAA_LARGE';

const HISTORY_KEY = 'contrastCheckHistory';
const MAX_HISTORY = 12;

function loadHistory(): { fg: string; bg: string }[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: { fg: string; bg: string }[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {}
}

const WCAG_THRESHOLDS: Record<WCAGLevel, number> = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
};

export default function ContrastCheckTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [fgColor, setFgColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [history, setHistory] = useState<{ fg: string; bg: string }[]>([]);
  const [showGrayscale, setShowGrayscale] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const rgbFg = useMemo(() => hexToRgb(fgColor), [fgColor]);
  const rgbBg = useMemo(() => hexToRgb(bgColor), [bgColor]);

  const luminanceFg = useMemo(() => rgbFg ? getLuminance(rgbFg.r, rgbFg.g, rgbFg.b) : 0, [rgbFg]);
  const luminanceBg = useMemo(() => rgbBg ? getLuminance(rgbBg.r, rgbBg.g, rgbBg.b) : 0, [rgbBg]);
  const contrastRatio = useMemo(() => getContrastRatio(luminanceFg, luminanceBg), [luminanceFg, luminanceBg]);

  const badges = useMemo(() => {
    const levels: WCAGLevel[] = ['AA_NORMAL', 'AA_LARGE', 'AAA_NORMAL', 'AAA_LARGE'];
    return levels.map(level => ({
      level,
      pass: contrastRatio >= WCAG_THRESHOLDS[level],
      threshold: WCAG_THRESHOLDS[level],
    }));
  }, [contrastRatio]);

  const suggestions = useMemo(() => {
    const suggestionsList: { label: string; fg: string; bg: string }[] = [];
    const steps = [-60, -40, -20, 20, 40, 60];
    for (const step of steps) {
      const testFg = adjustBrightness(fgColor, step);
      const testRgb = hexToRgb(testFg);
      if (!testRgb) continue;
      const testLum = getLuminance(testRgb.r, testRgb.g, testRgb.b);
      const ratio = getContrastRatio(testLum, luminanceBg);
      if (ratio >= 4.5 && testFg !== fgColor) {
        suggestionsList.push({
          label: step < 0 ? `${step}` : `+${step}`,
          fg: testFg,
          bg: bgColor,
        });
      }
    }
    return suggestionsList.slice(0, 6);
  }, [fgColor, bgColor, luminanceBg]);

  const addToHistory = useCallback(() => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.fg !== fgColor || h.bg !== bgColor);
      const updated = [{ fg: fgColor, bg: bgColor }, ...filtered].slice(0, MAX_HISTORY);
      saveHistory(updated);
      return updated;
    });
  }, [fgColor, bgColor]);

  const swapColors = useCallback(() => {
    setFgColor(bgColor);
    setBgColor(fgColor);
  }, [fgColor, bgColor]);

  const handleSelectHistory = useCallback((item: { fg: string; bg: string }) => {
    setFgColor(item.fg);
    setBgColor(item.bg);
  }, []);

  const ratioLabel = formatRatio(contrastRatio);
  const isLargeRatio = contrastRatio >= 3;
  const ratioColorClass = contrastRatio >= 7
    ? 'text-emerald-500'
    : contrastRatio >= 4.5
      ? 'text-green-500'
      : contrastRatio >= 3
        ? 'text-amber-500'
        : 'text-red-500';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.contrastCheck')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.contrastCheck')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.contrastCheckDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Color Pickers & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Color Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: fgColor }} />
                  {t('devTools.foreground') || 'Foreground'}
                </h3>
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => { setFgColor(e.target.value); addToHistory(); }}
                  className="w-full h-16 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={e => {
                    const val = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value;
                    if (/^#[0-9a-f]{6}$/i.test(val)) setFgColor(val);
                  }}
                  className="w-full mt-3 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: bgColor }} />
                  {t('devTools.background') || 'Background'}
                </h3>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => { setBgColor(e.target.value); addToHistory(); }}
                  className="w-full h-16 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => {
                    const val = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value;
                    if (/^#[0-9a-f]{6}$/i.test(val)) setBgColor(val);
                  }}
                  className="w-full mt-3 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapColors}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                {t('devTools.swap') || 'Swap'}
              </button>
            </div>

            {/* Preview Area */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {t('devTools.preview') || 'Preview'}
              </h3>
              <div
                className="rounded-xl p-8 space-y-6 transition-all duration-300"
                style={{ backgroundColor: showGrayscale ? toGrayscale(bgColor) : bgColor }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: showGrayscale ? toGrayscale(fgColor) : fgColor, opacity: 0.6 }}>
                    {t('devTools.smallText') || 'Small Text'}
                  </p>
                  <p
                    className="mt-2 leading-relaxed transition-all duration-300"
                    style={{ color: showGrayscale ? toGrayscale(fgColor) : fgColor, fontSize: '14px' }}
                  >
                    The five boxing wizards jump quickly. This is small text at 14px for WCAG AA normal text testing.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: showGrayscale ? toGrayscale(fgColor) : fgColor, opacity: 0.6 }}>
                    {t('devTools.largeText') || 'Large Text'}
                  </p>
                  <p
                    className="mt-2 font-bold leading-snug transition-all duration-300"
                    style={{ color: showGrayscale ? toGrayscale(fgColor) : fgColor, fontSize: '24px' }}
                  >
                    The five boxing wizards jump quickly. Large text at 24px bold.
                  </p>
                </div>
              </div>
            </div>

            {/* Grayscale Simulation Toggle */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showGrayscale}
                  onChange={e => setShowGrayscale(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 dark:border-white/10 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('devTools.grayscale') || 'Grayscale Simulation'}
                </span>
              </label>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 ml-8">
                Simulates how colors appear in grayscale to check contrast for color vision deficiencies.
              </p>
            </div>
          </div>

          {/* Right: Results & History */}
          <div className="space-y-6">
            {/* Contrast Ratio Display */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('devTools.contrastRatio') || 'Contrast Ratio'}</p>
              <p className={`text-5xl font-bold ${ratioColorClass} transition-colors duration-300 font-mono`}>
                {ratioLabel}
              </p>
              <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${contrastRatio >= 7 ? 'bg-emerald-500' : contrastRatio >= 4.5 ? 'bg-green-500' : contrastRatio >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, (contrastRatio / 21) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1:1</span>
                <span>21:1</span>
              </div>
            </div>

            {/* WCAG Badges */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">WCAG</h3>
              <div className="space-y-3">
                {badges.map(({ level, pass, threshold }) => {
                  const labels: Record<WCAGLevel, string> = {
                    AA_NORMAL: t('devTools.aaNormal') || 'AA Normal',
                    AA_LARGE: t('devTools.aaLarge') || 'AA Large',
                    AAA_NORMAL: t('devTools.aaaNormal') || 'AAA Normal',
                    AAA_LARGE: t('devTools.aaaLarge') || 'AAA Large',
                  };
                  return (
                    <div
                      key={level}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        pass
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
                      }`}
                    >
                      <div>
                        <span className={`text-sm font-semibold ${pass ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                          {labels[level]}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">({threshold}:1)</span>
                      </div>
                      {pass ? (
                        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.suggestions') || 'Suggestions'}</h3>
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setFgColor(s.fg)}
                      className="w-full flex items-center gap-3 p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl hover:border-violet-300 dark:hover:border-violet-500/50 transition-all duration-200 text-left"
                    >
                      <span className="w-7 h-7 rounded-lg border border-gray-200 dark:border-white/10 flex-shrink-0" style={{ backgroundColor: s.fg }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{s.fg}</span>
                        <span className="text-xs text-gray-400 ml-2">({s.label})</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('devTools.noSuggestions') || 'No suggestions needed — current colors pass AA!'}</p>
              )}
            </div>

            {/* History */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.history') || 'History'}</h3>
              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.slice(0, 8).map((item, i) => (
                    <button
                      key={`${item.fg}-${item.bg}-${i}`}
                      onClick={() => handleSelectHistory(item)}
                      className="w-full flex items-center gap-3 p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl hover:border-violet-300 dark:hover:border-violet-500/50 transition-all duration-200 text-left"
                    >
                      <span className="w-7 h-7 rounded-lg border border-gray-200 dark:border-white/10 flex-shrink-0 flex items-center justify-center text-[8px] font-mono font-bold" style={{ backgroundColor: item.bg, color: item.fg }}>
                        Aa
                      </span>
                      <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-2 text-xs">
                        <span className="font-mono text-gray-700 dark:text-gray-300 truncate">{item.fg}</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300 truncate">{item.bg}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('devTools.noHistory') || 'No history yet'}</p>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
