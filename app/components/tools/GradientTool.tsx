'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface ColorStop {
  color: string;
  position: number;
}

interface GradientPreset {
  name: string;
  type: 'linear' | 'radial';
  angle: number;
  radialShape: 'circle' | 'ellipse';
  stops: ColorStop[];
}

const PRESETS: GradientPreset[] = [
  { name: 'Sunset', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }] },
  { name: 'Ocean', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#2193b0', position: 0 }, { color: '#6dd5ed', position: 100 }] },
  { name: 'Neon', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#00f260', position: 0 }, { color: '#0575e6', position: 100 }] },
  { name: 'Forest', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }] },
  { name: 'Lavender', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#c471ed', position: 0 }, { color: '#f7797d', position: 100 }] },
  { name: 'Peach', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#f7797d', position: 0 }, { color: '#fbd786', position: 100 }] },
  { name: 'Midnight', type: 'linear', angle: 135, radialShape: 'circle', stops: [{ color: '#0f0c29', position: 0 }, { color: '#302b63', position: 50 }, { color: '#24243e', position: 100 }] },
];

export default function GradientTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(135);
  const [radialShape, setRadialShape] = useState<'circle' | 'ellipse'>('circle');
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#8b5cf6', position: 0 },
    { color: '#6366f1', position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const gradientStyle = useMemo(() => {
    const sorted = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');
    if (type === 'radial') {
      return `radial-gradient(${radialShape === 'circle' ? 'circle' : 'ellipse'}, ${stopsStr})`;
    }
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }, [type, angle, radialShape, colorStops]);

  const cssCode = useMemo(() => {
    const sorted = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sorted.map((s) => `  ${s.color} ${s.position}%`).join(',\n');
    if (type === 'radial') {
      return `background: radial-gradient(\n${radialShape === 'circle' ? '  circle' : '  ellipse'},\n${stopsStr}\n);`;
    }
    return `background: linear-gradient(\n  ${angle}deg,\n${stopsStr}\n);`;
  }, [type, angle, radialShape, colorStops]);

  const addStop = useCallback(() => {
    if (colorStops.length >= 8) return;
    const lastPos = colorStops[colorStops.length - 1].position;
    setColorStops([...colorStops, { color: '#6366f1', position: Math.min(lastPos + 10, 100) }]);
  }, [colorStops]);

  const removeStop = useCallback((index: number) => {
    if (colorStops.length <= 2) return;
    setColorStops(colorStops.filter((_, i) => i !== index));
  }, [colorStops]);

  const updateStopColor = useCallback((index: number, color: string) => {
    setColorStops(colorStops.map((s, i) => (i === index ? { ...s, color } : s)));
  }, [colorStops]);

  const updateStopPosition = useCallback((index: number, position: number) => {
    setColorStops(colorStops.map((s, i) => (i === index ? { ...s, position } : s)));
  }, [colorStops]);

  const applyPreset = useCallback((preset: GradientPreset) => {
    setType(preset.type);
    setAngle(preset.angle);
    setRadialShape(preset.radialShape);
    setColorStops(preset.stops.map((s) => ({ ...s })));
  }, []);

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [cssCode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.gradient')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.gradient')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.gradientDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.gradientType')}</h3>
              <div className="flex gap-2">
                {(['linear', 'radial'] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all border ${
                      type === val
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {t(val === 'linear' ? 'devTools.linear' : 'devTools.radial')}
                  </button>
                ))}
              </div>
            </div>

            {type === 'linear' && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.angle')}</label>
                  <span className="text-sm font-mono font-bold text-violet-500">{angle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0°</span>
                  <span>180°</span>
                  <span>360°</span>
                </div>
              </div>
            )}

            {type === 'radial' && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.shape')}</h3>
                <div className="flex gap-2">
                  {(['circle', 'ellipse'] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => setRadialShape(val)}
                      className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all border ${
                        radialShape === val
                          ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                      }`}
                    >
                      {t(val === 'circle' ? 'devTools.circle' : 'devTools.ellipse')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.colorStops')}</h3>
                <span className="text-xs text-gray-400">{colorStops.length}/8</span>
              </div>
              <div className="space-y-3">
                {colorStops.map((stop, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 space-y-3 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateStopColor(i, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer"
                        />
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{stop.color}</span>
                      </div>
                      {colorStops.length > 2 && (
                        <button
                          onClick={() => removeStop(i)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title={t('devTools.removeStop')}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-gray-500 dark:text-gray-400">{t('devTools.position')}</label>
                        <span className="text-xs font-mono text-gray-500">{stop.position}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={(e) => updateStopPosition(i, Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {colorStops.length < 8 && (
                <button
                  onClick={addStop}
                  className="w-full mt-3 py-2.5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-violet-300 dark:hover:border-violet-500/50 hover:text-violet-500 transition-all"
                >
                  + {t('devTools.addStop')}
                </button>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.presets')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="group relative h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: preset.type === 'linear'
                          ? `linear-gradient(${preset.angle}deg, ${preset.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`
                          : `radial-gradient(circle, ${preset.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`,
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <span className="text-xs font-medium text-white drop-shadow">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.preview')}</h3>
              </div>
              <div className="p-6">
                <div
                  className="w-full h-72 rounded-xl shadow-inner transition-all duration-300"
                  style={{ background: gradientStyle }}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.cssCode')}</h3>
                <button
                  onClick={copyCss}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('devTools.copied')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" />
                      </svg>
                      {t('devTools.copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="p-4">
                <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-4 text-sm font-mono overflow-x-auto">
                  <code>{cssCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
