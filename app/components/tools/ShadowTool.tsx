'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface ShadowLayerType {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface Preset {
  name: string;
  layers: Omit<ShadowLayerType, 'id'>[];
}

const PRESETS: Record<string, Preset> = {
  soft: {
    name: 'Soft',
    layers: [{ x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 30, inset: false }],
  },
  medium: {
    name: 'Medium',
    layers: [{ x: 0, y: 8, blur: 24, spread: 0, color: '#000000', opacity: 40, inset: false }],
  },
  hard: {
    name: 'Hard',
    layers: [{ x: 4, y: 4, blur: 0, spread: 0, color: '#000000', opacity: 50, inset: false }],
  },
  neon: {
    name: 'Neon Glow',
    layers: [{ x: 0, y: 0, blur: 20, spread: 5, color: '#00ff88', opacity: 70, inset: false }],
  },
  inset: {
    name: 'Inset',
    layers: [{ x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 20, inset: true }],
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

let nextId = 1;

function createLayer(overrides?: Partial<ShadowLayerType>): ShadowLayerType {
  return {
    id: nextId++,
    x: 0,
    y: 4,
    blur: 12,
    spread: 0,
    color: '#000000',
    opacity: 30,
    inset: false,
    ...overrides,
  };
}

export default function ShadowTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [layers, setLayers] = useState<ShadowLayerType[]>([createLayer()]);
  const [copied, setCopied] = useState(false);
  const [bgMode, setBgMode] = useState<'light' | 'dark' | 'checkerboard'>('light');

  const updateLayer = useCallback((id: number, updates: Partial<ShadowLayerType>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const removeLayer = useCallback((id: number) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  }, []);

  const addLayer = useCallback(() => {
    if (layers.length < 5) {
      setLayers(prev => [...prev, createLayer()]);
    }
  }, [layers.length]);

  const applyPreset = useCallback((presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    setLayers(preset.layers.map(l => createLayer(l)));
  }, []);

  const shadowCSS = useMemo(() => {
    return layers
      .map(l => {
        const { r, g, b } = hexToRgb(l.color);
        const alpha = (l.opacity / 100).toFixed(2);
        const inset = l.inset ? 'inset ' : '';
        return `${inset}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px rgba(${r}, ${g}, ${b}, ${alpha})`;
      })
      .join(',\n  ');
  }, [layers]);

  const fullCSS = useMemo(() => {
    if (!shadowCSS) return '';
    return `box-shadow: ${shadowCSS};`;
  }, [shadowCSS]);

  const handleCopy = useCallback(async () => {
    if (!fullCSS) return;
    try {
      await navigator.clipboard.writeText(fullCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = fullCSS;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fullCSS]);

  const previewBgStyle = useMemo(() => {
    if (bgMode === 'dark') return { backgroundColor: '#1a1a2e' };
    if (bgMode === 'checkerboard') {
      return {
        backgroundImage:
          'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      };
    }
    return { backgroundColor: '#f8f9fa' };
  }, [bgMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.shadow')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.shadow')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.shadowDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.presets')}</h3>
              </div>
              <select
                onChange={(e) => e.target.value && applyPreset(e.target.value)}
                defaultValue=""
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="" disabled>{t('devTools.presets')}...</option>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
            </div>

            {layers.map((layer, index) => (
              <div key={layer.id} className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs flex items-center justify-center font-bold shadow-sm">{index + 1}</span>
                    {t('devTools.shadowLayer')} {index + 1}
                  </h3>
                  {layers.length > 1 && (
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="px-3 py-1.5 text-xs text-red-500 hover:text-white border border-red-300 dark:border-red-800 hover:bg-red-500 rounded-lg transition-all duration-300"
                    >
                      <svg className="w-3.5 h-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      {t('devTools.removeShadow')}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <SliderField
                    label={t('devTools.shadowX')}
                    value={layer.x}
                    min={-50}
                    max={50}
                    unit="px"
                    onChange={(v) => updateLayer(layer.id, { x: v })}
                  />
                  <SliderField
                    label={t('devTools.shadowY')}
                    value={layer.y}
                    min={-50}
                    max={50}
                    unit="px"
                    onChange={(v) => updateLayer(layer.id, { y: v })}
                  />
                  <SliderField
                    label={t('devTools.shadowBlur')}
                    value={layer.blur}
                    min={0}
                    max={100}
                    unit="px"
                    onChange={(v) => updateLayer(layer.id, { blur: v })}
                  />
                  <SliderField
                    label={t('devTools.shadowSpread')}
                    value={layer.spread}
                    min={-50}
                    max={50}
                    unit="px"
                    onChange={(v) => updateLayer(layer.id, { spread: v })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('devTools.shadowColor')}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                        className="w-11 h-11 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent p-0.5"
                      />
                      <input
                        type="text"
                        value={layer.color}
                        onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <SliderField
                      label={t('devTools.shadowOpacity')}
                      value={layer.opacity}
                      min={0}
                      max={100}
                      unit="%"
                      onChange={(v) => updateLayer(layer.id, { opacity: v })}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={layer.inset}
                        onChange={(e) => updateLayer(layer.id, { inset: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-blue-500 transition-colors duration-300" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {t('devTools.inset')}
                    </span>
                  </label>
                </div>
              </div>
            ))}

            {layers.length < 5 && (
              <button
                onClick={addLayer}
                className="w-full py-3.5 bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-400 hover:to-slate-400 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-gray-500/30 flex items-center justify-center gap-2 group"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t('devTools.addShadow')}
              </button>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.preview')}</h3>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                  {(['light', 'dark', 'checkerboard'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setBgMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                        bgMode === mode
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      {mode === 'light' && (
                        <svg className="w-3.5 h-3.5 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm8-8a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM6 12a1 1 0 01-1 1H3a1 1 0 110-2h2a1 1 0 011 1zm12.07 5.07a1 1 0 010 1.41l-1.41 1.41a1 1 0 11-1.41-1.41l1.41-1.41a1 1 0 011.41 0zM5.93 5.93a1 1 0 011.41 0l1.41 1.41a1 1 0 11-1.41 1.41L5.93 7.34a1 1 0 010-1.41zM12 6a6 6 0 100 12 6 6 0 000-12z"/></svg>
                      )}
                      {mode === 'dark' && (
                        <svg className="w-3.5 h-3.5 inline mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a1 1 0 01.97.76A7.001 7.001 0 0017 10a7.001 7.001 0 007.76.97 1 1 0 011.24 1.24A9.003 9.003 0 0112 21 9 9 0 0112 3z" transform="rotate(0, 12, 12)"/></svg>
                      )}
                      {mode === 'checkerboard' && (
                        <svg className="w-3.5 h-3.5 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="w-full h-72 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 border border-gray-200 dark:border-white/5"
                style={previewBgStyle}
              >
                <div
                  className="w-52 h-40 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium select-none transition-all duration-300 border border-gray-100 dark:border-white/5"
                  style={{ boxShadow: shadowCSS || 'none' }}
                >
                  <div className="text-center">
                    <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {t('devTools.preview')}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.cssCode')}</h3>
                <button
                  onClick={handleCopy}
                  disabled={!shadowCSS}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    copied
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-400 hover:to-slate-400 shadow-lg shadow-gray-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {t('devTools.copied')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      {t('devTools.copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <pre className="w-full min-h-[80px] bg-gray-900 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-100 font-mono text-sm overflow-x-auto whitespace-pre-wrap transition-all">
                  <code>{fullCSS || <span className="text-gray-500">/* no shadow */</span>}</code>
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

function SliderField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md tabular-nums">
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-lg
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500
            [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${progress}%, #e5e7eb ${progress}%)`,
          }}
        />
      </div>
    </div>
  );
}
