'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface GridItem {
  id: number;
  colSpan: number;
  rowSpan: number;
}

const ITEM_COLORS = [
  'from-indigo-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
  'from-lime-400 to-green-500',
  'from-fuchsia-400 to-pink-500',
  'from-red-400 to-rose-500',
];

interface PresetConfig {
  nameKey: string;
  columns: string;
  rows: string;
  items: number;
}

const PRESETS: PresetConfig[] = [
  { nameKey: 'threeColumns', columns: '1fr 1fr 1fr', rows: 'auto', items: 3 },
  { nameKey: 'twoColumnsSidebar', columns: '1fr 3fr', rows: 'auto', items: 2 },
  { nameKey: 'fourColumns', columns: '1fr 1fr 1fr 1fr', rows: 'auto', items: 4 },
  { nameKey: 'holyGrail', columns: '1fr 3fr 1fr', rows: 'auto 1fr auto', items: 3 },
  { nameKey: 'dashboard', columns: '200px 1fr 1fr', rows: '60px 1fr 1fr 60px', items: 6 },
];

function getDefaultItems(count: number): GridItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    colSpan: 1,
    rowSpan: 1,
  }));
}

const ALIGN_OPTIONS = ['stretch', 'start', 'end', 'center'];

export default function GridLayoutTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [columns, setColumns] = useState('1fr 1fr 1fr');
  const [rows, setRows] = useState('auto');
  const [gap, setGap] = useState(8);
  const [justifyItems, setJustifyItems] = useState('stretch');
  const [alignItems, setAlignItems] = useState('stretch');
  const [justifyContent, setJustifyContent] = useState('normal');
  const [alignContent, setAlignContent] = useState('normal');
  const [showGridLines, setShowGridLines] = useState(true);
  const [copied, setCopied] = useState(false);
  const [items, setItems] = useState<GridItem[]>(getDefaultItems(3));
  const [itemCount, setItemCount] = useState(3);

  const updateItem = useCallback((id: number, updates: Partial<GridItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...updates } : it));
  }, []);

  const setCount = useCallback((count: number) => {
    const clamped = Math.max(2, Math.min(9, count));
    setItemCount(clamped);
    setItems(prev => {
      if (clamped > prev.length) {
        const newItems = [...prev];
        for (let i = prev.length + 1; i <= clamped; i++) {
          newItems.push({ id: i, colSpan: 1, rowSpan: 1 });
        }
        return newItems;
      }
      return prev.slice(0, clamped);
    });
  }, []);

  const applyPreset = useCallback((preset: PresetConfig) => {
    setColumns(preset.columns);
    setRows(preset.rows);
    setCount(preset.items);
  }, [setCount]);

  const gridStyle = useMemo(() => {
    const displayItems = items.slice(0, itemCount);
    return {
      display: 'grid',
      gridTemplateColumns: columns || '1fr',
      gridTemplateRows: rows || 'auto',
      gap: `${gap}px`,
      justifyItems,
      alignItems,
      justifyContent,
      alignContent,
    } as React.CSSProperties;
  }, [columns, rows, gap, justifyItems, alignItems, justifyContent, alignContent]);

  const cssCode = useMemo(() => {
    const lines: string[] = [];
    lines.push(`display: grid;`);
    if (columns) lines.push(`grid-template-columns: ${columns};`);
    if (rows) lines.push(`grid-template-rows: ${rows};`);
    if (gap) lines.push(`gap: ${gap}px;`);
    if (justifyItems !== 'stretch') lines.push(`justify-items: ${justifyItems};`);
    if (alignItems !== 'stretch') lines.push(`align-items: ${alignItems};`);
    if (justifyContent !== 'normal') lines.push(`justify-content: ${justifyContent};`);
    if (alignContent !== 'normal') lines.push(`align-content: ${alignContent};`);
    return lines.join('\n');
  }, [columns, rows, gap, justifyItems, alignItems, justifyContent, alignContent]);

  const fullHtmlCode = useMemo(() => {
    const containerCss = cssCode.replace(/\n/g, '\n  ');
    let html = `<div style="\n  ${containerCss}\n">\n`;
    for (let i = 0; i < itemCount; i++) {
      const it = items.find(x => x.id === i + 1);
      const style: string[] = [];
      if (it && it.colSpan > 1) style.push(`grid-column: span ${it.colSpan}`);
      if (it && it.rowSpan > 1) style.push(`grid-row: span ${it.rowSpan}`);
      const styleStr = style.length ? ` style="${style.join('; ')}"` : '';
      html += `  <div${styleStr}>Item ${i + 1}</div>\n`;
    }
    html += '</div>';
    return html;
  }, [cssCode, itemCount, items]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = cssCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.gridLayout')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.gridLayout')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.gridLayoutDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.presets')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.nameKey}
                    onClick={() => applyPreset(preset)}
                    className="px-4 py-3 text-sm rounded-xl font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 hover:text-violet-600 dark:hover:text-violet-400 bg-white dark:bg-gray-900 transition-all duration-300"
                  >
                    {t(`devTools.${preset.nameKey}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.gridTemplateColumns')}</h3>
              <input
                type="text"
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. 1fr 1fr 1fr"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.gridTemplateRows')}</h3>
              <input
                type="text"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. auto 1fr auto"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.gap')}</label>
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{gap}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0px</span>
                <span>20px</span>
                <span>40px</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.justifyItems')}</h3>
              <div className="flex flex-wrap gap-2">
                {ALIGN_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setJustifyItems(opt)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border ${
                      justifyItems === opt
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {t(`devTools.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.alignItems')}</h3>
              <div className="flex flex-wrap gap-2">
                {ALIGN_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAlignItems(opt)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border ${
                      alignItems === opt
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {t(`devTools.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.justifyContent')}</h3>
              <div className="flex flex-wrap gap-2">
                {(['normal', 'start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setJustifyContent(opt)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border ${
                      justifyContent === opt
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {t(`devTools.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.alignContent')}</h3>
              <div className="flex flex-wrap gap-2">
                {(['normal', 'start', 'end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly']).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAlignContent(opt)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border ${
                      alignContent === opt
                        ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {t(`devTools.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.itemCount')}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCount(itemCount - 1)}
                    disabled={itemCount <= 2}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <span className="text-lg font-mono font-bold text-violet-500 min-w-[20px] text-center">{itemCount}</span>
                  <button
                    onClick={() => setCount(itemCount + 1)}
                    disabled={itemCount >= 9}
                    className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {items.slice(0, itemCount).map((item, idx) => (
                  <div key={item.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 space-y-3 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className={`w-5 h-5 rounded bg-gradient-to-br ${ITEM_COLORS[idx % ITEM_COLORS.length]}`} />
                        {t('devTools.itemCount')} {item.id}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('devTools.colSpan')}</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={item.colSpan}
                          onChange={(e) => updateItem(item.id, { colSpan: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a1a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('devTools.rowSpan')}</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={item.rowSpan}
                          onChange={(e) => updateItem(item.id, { rowSpan: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0a0a1a] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showGridLines}
                    onChange={(e) => setShowGridLines(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-violet-500 transition-colors duration-300" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-300" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {t('devTools.showGridLines')}
                </span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.preview')}</h3>
                <span className="text-xs text-gray-400 font-mono">{columns}</span>
              </div>
              <div
                className="w-full min-h-[320px] rounded-xl p-3 transition-all duration-300 border border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900/50"
                style={gridStyle}
              >
                {items.slice(0, itemCount).map((item, idx) => (
                  <div
                    key={item.id}
                    className={`rounded-xl flex items-center justify-center text-white font-bold text-lg select-none transition-all duration-300 bg-gradient-to-br ${ITEM_COLORS[idx % ITEM_COLORS.length]} ${
                      showGridLines ? 'ring-1 ring-white/30 ring-inset shadow-sm' : ''
                    }`}
                    style={{
                      gridColumn: item.colSpan > 1 ? `span ${item.colSpan}` : undefined,
                      gridRow: item.rowSpan > 1 ? `span ${item.rowSpan}` : undefined,
                      minHeight: '60px',
                    }}
                  >
                    <span className="drop-shadow-sm">{item.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.cssCode')}</h3>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    copied
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-violet-500/30'
                  }`}
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
                <pre className="w-full min-h-[100px] bg-gray-900 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-100 font-mono text-sm overflow-x-auto whitespace-pre-wrap transition-all">
                  <code>{cssCode || <span className="text-gray-500">/* no grid code */</span>}</code>
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
