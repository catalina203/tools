'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface FlexItem {
  id: number;
  color: string;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: string;
  order: number;
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

const DIRECTION_VALUES = ['row', 'column', 'row-reverse', 'column-reverse'];
const WRAP_VALUES = ['nowrap', 'wrap', 'wrap-reverse'];
const JUSTIFY_VALUES = ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
const ALIGN_VALUES = ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'];
const ALIGN_CONTENT_VALUES = ['stretch', 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'];
const SELF_VALUES = ['auto', 'stretch', 'flex-start', 'flex-end', 'center', 'baseline'];

function NumberField({ label, value, min, step, onChange }: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
      />
    </div>
  );
}

export default function FlexboxTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [direction, setDirection] = useState('row');
  const [wrap, setWrap] = useState('nowrap');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [alignContent, setAlignContent] = useState('stretch');
  const [gap, setGap] = useState(8);
  const [nextId, setNextId] = useState(4);
  const [items, setItems] = useState<FlexItem[]>([
    { id: 1, color: COLORS[0], flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    { id: 2, color: COLORS[1], flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
    { id: 3, color: COLORS[2], flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0 },
  ]);
  const [copied, setCopied] = useState(false);

  const cssValueKey = useCallback((value: string): string => {
    const map: Record<string, string> = {
      'row': 'row',
      'column': 'column',
      'row-reverse': 'rowReverse',
      'column-reverse': 'columnReverse',
      'nowrap': 'nowrap',
      'wrap': 'wrap',
      'wrap-reverse': 'wrapReverse',
      'flex-start': 'flexStart',
      'flex-end': 'flexEnd',
      'center': 'center',
      'space-between': 'spaceBetween',
      'space-around': 'spaceAround',
      'space-evenly': 'spaceEvenly',
      'stretch': 'stretch',
      'baseline': 'baseline',
      'auto': 'auto',
    };
    return map[value] || value;
  }, []);

  const addItem = useCallback(() => {
    if (items.length >= 6) return;
    setItems(prev => [...prev, {
      id: nextId,
      color: COLORS[prev.length % COLORS.length],
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
      alignSelf: 'auto',
      order: 0,
    }]);
    setNextId(prev => prev + 1);
  }, [items.length, nextId]);

  const removeItem = useCallback((id: number) => {
    if (items.length <= 2) return;
    setItems(prev => prev.filter(item => item.id !== id));
  }, [items.length]);

  const updateItem = useCallback((id: number, updates: Partial<FlexItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const containerCSS = useMemo(() => {
    const lines = [
      'display: flex;',
      `flex-direction: ${direction};`,
      `flex-wrap: ${wrap};`,
      `justify-content: ${justifyContent};`,
      `align-items: ${alignItems};`,
    ];
    if (wrap !== 'nowrap') {
      lines.push(`align-content: ${alignContent};`);
    }
    if (gap > 0) {
      lines.push(`gap: ${gap}px;`);
    }
    return lines.join('\n');
  }, [direction, wrap, justifyContent, alignItems, alignContent, gap]);

  const itemsCSS = useMemo(() => {
    return items.map((item, i) => {
      return [
        `/* ${t('devTools.item')} ${i + 1} */`,
        `flex: ${item.flexGrow} ${item.flexShrink} ${item.flexBasis || 'auto'};`,
        `align-self: ${item.alignSelf};`,
        `order: ${item.order};`,
      ].join('\n');
    }).join('\n\n');
  }, [items, t]);

  const fullCSS = useMemo(() => [containerCSS, '', itemsCSS].join('\n'), [containerCSS, itemsCSS]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = fullCSS;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullCSS]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.flexbox')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.flexbox')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.flexboxDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Container Properties */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                {t('devTools.flexbox')}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('devTools.flexDirection')}</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                  >
                    {DIRECTION_VALUES.map(v => (
                      <option key={v} value={v}>{t(`devTools.${cssValueKey(v)}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('devTools.flexWrap')}</label>
                  <select
                    value={wrap}
                    onChange={(e) => setWrap(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                  >
                    {WRAP_VALUES.map(v => (
                      <option key={v} value={v}>{t(`devTools.${cssValueKey(v)}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('devTools.justifyContent')}</label>
                  <select
                    value={justifyContent}
                    onChange={(e) => setJustifyContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                  >
                    {JUSTIFY_VALUES.map(v => (
                      <option key={v} value={v}>{t(`devTools.${cssValueKey(v)}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('devTools.alignItems')}</label>
                  <select
                    value={alignItems}
                    onChange={(e) => setAlignItems(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                  >
                    {ALIGN_VALUES.map(v => (
                      <option key={v} value={v}>{t(`devTools.${cssValueKey(v)}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('devTools.alignContent')}</label>
                <select
                  value={alignContent}
                  onChange={(e) => setAlignContent(e.target.value)}
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer ${
                    wrap === 'nowrap'
                      ? 'border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-600'
                      : 'border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
                  }`}
                  disabled={wrap === 'nowrap'}
                >
                  {ALIGN_CONTENT_VALUES.map(v => (
                    <option key={v} value={v}>{t(`devTools.${cssValueKey(v)}`)}</option>
                  ))}
                </select>
                {wrap === 'nowrap' && (
                  <p className="text-xs text-amber-500 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    {t('devTools.nowrap')} / {t('devTools.alignContent')}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.gap')}</label>
                  <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md tabular-nums">{gap}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={gap}
                  onChange={(e) => setGap(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-500
                    [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-lg
                    [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-500
                    [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
                  <span>0</span>
                  <span>25</span>
                  <span>50px</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.item')}</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{items.length}/6</span>
              </div>

              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {items.map((item, i) => (
                  <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 transition-all duration-300 hover:shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md border border-gray-200 dark:border-white/20 shadow-sm flex-shrink-0 transition-colors duration-300" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{t('devTools.item')} {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={item.color}
                          onChange={(e) => updateItem(item.id, { color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent p-0.5 hover:border-cyan-300 transition-colors"
                          title={t('devTools.itemColor')}
                        />
                        {items.length > 2 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title={t('devTools.removeItem')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <NumberField label={t('devTools.flexGrow')} value={item.flexGrow} min={0} step={0.1} onChange={(v) => updateItem(item.id, { flexGrow: v })} />
                      <NumberField label={t('devTools.flexShrink')} value={item.flexShrink} min={0} step={0.1} onChange={(v) => updateItem(item.id, { flexShrink: v })} />
                      <NumberField label={t('devTools.order')} value={item.order} step={1} onChange={(v) => updateItem(item.id, { order: v })} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('devTools.flexBasis')}</label>
                        <input
                          type="text"
                          value={item.flexBasis}
                          onChange={(e) => updateItem(item.id, { flexBasis: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('devTools.alignSelf')}</label>
                        <select
                          value={item.alignSelf}
                          onChange={(e) => updateItem(item.id, { alignSelf: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                        >
                          {SELF_VALUES.map(v => (
                            <option key={v} value={v}>{t(`devTools.${cssValueKey(v)}`)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {items.length < 6 && (
                <button
                  onClick={addItem}
                  className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all flex items-center justify-center gap-2 group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {t('devTools.addItem')}
                </button>
              )}
            </div>
          </div>

          {/* Right: Preview + CSS */}
          <div className="lg:col-span-3 space-y-6">
            {/* Preview */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {t('devTools.preview')}
              </h3>
              <div
                className="w-full min-h-[420px] rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 bg-gray-100/50 dark:bg-gray-900/30 p-5 overflow-auto transition-all duration-300"
                style={{
                  display: 'flex',
                  flexDirection: direction as React.CSSProperties['flexDirection'],
                  flexWrap: wrap as React.CSSProperties['flexWrap'],
                  justifyContent: justifyContent as React.CSSProperties['justifyContent'],
                  alignItems: alignItems as React.CSSProperties['alignItems'],
                  alignContent: wrap !== 'nowrap' ? alignContent as React.CSSProperties['alignContent'] : undefined,
                  gap: `${gap}px`,
                }}
              >
                {items.map((item, i) => (
                  <div
                    key={item.id}
                    className="rounded-xl flex items-center justify-center font-bold text-white text-2xl select-none transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{
                      backgroundColor: item.color,
                      flex: `${item.flexGrow} ${item.flexShrink} ${item.flexBasis || 'auto'}`,
                      alignSelf: item.alignSelf !== 'auto' ? item.alignSelf as React.CSSProperties['alignSelf'] : undefined,
                      order: item.order,
                      minWidth: '70px',
                      minHeight: '70px',
                      padding: '16px 20px',
                    }}
                  >
                    <span className="drop-shadow-lg opacity-90">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Code */}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  {t('devTools.cssCode')}
                </h3>
                <button
                  onClick={handleCopy}
                  disabled={!fullCSS}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/30'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {t('devTools.copied')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                      {t('devTools.copy')}
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-4 sm:p-5 text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  <code>{fullCSS || <span className="text-gray-500 italic">{'/* ... */'}</span>}</code>
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
