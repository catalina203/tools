'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type GridType = 'square' | 'dots' | 'isometric';

interface PresetConfig {
  nameKey: string;
  gridType: GridType;
  cellSize: number;
  lineColor: string;
  bgColor: string;
  lineWidth: number;
  opacity: number;
}

const PRESETS: PresetConfig[] = [
  { nameKey: 'blueprint', gridType: 'square', cellSize: 20, lineColor: '#1a5276', bgColor: '#eaf2f8', lineWidth: 1, opacity: 50 },
  { nameKey: 'dotPaper', gridType: 'dots', cellSize: 15, lineColor: '#555555', bgColor: '#ffffff', lineWidth: 2, opacity: 40 },
  { nameKey: 'isometricGrid', gridType: 'isometric', cellSize: 30, lineColor: '#2980b9', bgColor: '#fdfefe', lineWidth: 1, opacity: 30 },
  { nameKey: 'graphPaper', gridType: 'square', cellSize: 10, lineColor: '#3498db', bgColor: '#ffffff', lineWidth: 0.5, opacity: 25 },
];

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`;
}

export default function GridGeneratorTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [gridType, setGridType] = useState<GridType>('square');
  const [cellSize, setCellSize] = useState(20);
  const [lineColor, setLineColor] = useState('#3b82f6');
  const [bgColor, setBgColor] = useState('#f8fafc');
  const [lineWidth, setLineWidth] = useState(1);
  const [opacity, setOpacity] = useState(50);
  const [copied, setCopied] = useState(false);

  const lineColorRgba = useMemo(() => hexToRgba(lineColor, opacity / 100), [lineColor, opacity]);

  const gridStyle = useMemo(() => {
    switch (gridType) {
      case 'square':
        return {
          backgroundColor: bgColor,
          backgroundImage: `
            linear-gradient(${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px),
            linear-gradient(90deg, ${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px)
          `,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        };
      case 'dots': {
        const dotRadius = Math.max(lineWidth * 1.5, 1.5);
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(circle, ${lineColorRgba} ${dotRadius}px, transparent ${dotRadius}px)`,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        };
      }
      case 'isometric': {
        const spacing = cellSize * Math.sqrt(3);
        return {
          backgroundColor: bgColor,
          backgroundImage: `
            repeating-linear-gradient(30deg, ${lineColorRgba} 0, ${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px, transparent ${spacing}px),
            repeating-linear-gradient(-30deg, ${lineColorRgba} 0, ${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px, transparent ${spacing}px)
          `,
        };
      }
    }
  }, [gridType, cellSize, lineColorRgba, bgColor, lineWidth]);

  const cssCode = useMemo(() => {
    switch (gridType) {
      case 'square':
        return `background-color: ${bgColor};\nbackground-image:\n  linear-gradient(${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px),\n  linear-gradient(90deg, ${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px);\nbackground-size: ${cellSize}px ${cellSize}px;`;
      case 'dots': {
        const dotRadius = Math.max(lineWidth * 1.5, 1.5);
        return `background-color: ${bgColor};\nbackground-image: radial-gradient(circle, ${lineColorRgba} ${dotRadius}px, transparent ${dotRadius}px);\nbackground-size: ${cellSize}px ${cellSize}px;`;
      }
      case 'isometric': {
        const spacing = cellSize * Math.sqrt(3);
        return `background-color: ${bgColor};\nbackground-image:\n  repeating-linear-gradient(30deg, ${lineColorRgba} 0, ${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px, transparent ${spacing.toFixed(2)}px),\n  repeating-linear-gradient(-30deg, ${lineColorRgba} 0, ${lineColorRgba} ${lineWidth}px, transparent ${lineWidth}px, transparent ${spacing.toFixed(2)}px);`;
      }
    }
  }, [gridType, cellSize, lineColorRgba, bgColor, lineWidth]);

  const copyCss = useCallback(async () => {
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

  const applyPreset = useCallback((preset: PresetConfig) => {
    setGridType(preset.gridType);
    setCellSize(preset.cellSize);
    setLineColor(preset.lineColor);
    setBgColor(preset.bgColor);
    setLineWidth(preset.lineWidth);
    setOpacity(preset.opacity);
  }, []);

  const downloadPng = useCallback(() => {
    const canvas = document.createElement('canvas');
    const w = 800;
    const h = 600;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = hexToRgba(lineColor, opacity / 100);
    ctx.lineWidth = lineWidth;

    switch (gridType) {
      case 'square':
        for (let x = 0; x <= w; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(Math.round(x) + 0.5, 0);
          ctx.lineTo(Math.round(x) + 0.5, h);
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, Math.round(y) + 0.5);
          ctx.lineTo(w, Math.round(y) + 0.5);
          ctx.stroke();
        }
        break;
      case 'dots': {
        const dotRadius = Math.max(lineWidth * 1.5, 2);
        ctx.fillStyle = hexToRgba(lineColor, opacity / 100);
        for (let x = 0; x <= w; x += cellSize) {
          for (let y = 0; y <= h; y += cellSize) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
      case 'isometric': {
        const tan30 = Math.tan(30 * Math.PI / 180);
        const span = Math.ceil((h + w * tan30) / cellSize) + 2;
        for (let i = -span; i <= span; i++) {
          const y0 = i * cellSize;
          ctx.beginPath();
          ctx.moveTo(0, y0);
          ctx.lineTo(w, y0 - w * tan30);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, y0);
          ctx.lineTo(w, y0 + w * tan30);
          ctx.stroke();
        }
        break;
      }
    }

    const link = document.createElement('a');
    link.download = 'grid-pattern.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [gridType, cellSize, lineColor, bgColor, lineWidth, opacity]);

  const sliderClass = "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:shadow-lg [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-500 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.gridGenerator')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.gridGenerator')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.gridGeneratorDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.gridType')}</h3>
              <div className="flex gap-2">
                {(['square', 'dots', 'isometric'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setGridType(type)}
                    className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all border ${
                      gridType === type
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-transparent shadow-lg shadow-cyan-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-cyan-300 dark:hover:border-cyan-500/50'
                    }`}
                  >
                    {t(`devTools.${type}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.cellSize')}</label>
                <span className="text-sm font-mono font-bold text-cyan-500">{cellSize}px</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                value={cellSize}
                onChange={(e) => setCellSize(Number(e.target.value))}
                className={sliderClass}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5px</span>
                <span>100px</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.lineColor')}</label>
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{lineColor}</span>
              </div>
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.bgColor')}</label>
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{bgColor}</span>
              </div>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-transparent"
              />
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.lineWidth')}</label>
                <span className="text-sm font-mono font-bold text-cyan-500">{lineWidth}px</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className={sliderClass}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.5px</span>
                <span>5px</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.opacity')}</label>
                <span className="text-sm font-mono font-bold text-cyan-500">{opacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className={sliderClass}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.presets')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.nameKey}
                    onClick={() => applyPreset(preset)}
                    className="group relative h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                  >
                    <div className="absolute inset-0" style={{
                      backgroundColor: preset.bgColor,
                      backgroundImage: preset.gridType === 'square'
                        ? `linear-gradient(${hexToRgba(preset.lineColor, preset.opacity / 100)} ${preset.lineWidth}px, transparent ${preset.lineWidth}px), linear-gradient(90deg, ${hexToRgba(preset.lineColor, preset.opacity / 100)} ${preset.lineWidth}px, transparent ${preset.lineWidth}px)`
                        : preset.gridType === 'dots'
                        ? `radial-gradient(circle, ${hexToRgba(preset.lineColor, preset.opacity / 100)} ${Math.max(preset.lineWidth * 1.5, 1.5)}px, transparent ${Math.max(preset.lineWidth * 1.5, 1.5)}px)`
                        : `repeating-linear-gradient(30deg, ${hexToRgba(preset.lineColor, preset.opacity / 100)} 0, ${hexToRgba(preset.lineColor, preset.opacity / 100)} ${preset.lineWidth}px, transparent ${preset.lineWidth}px, transparent ${preset.cellSize * Math.sqrt(3)}px), repeating-linear-gradient(-30deg, ${hexToRgba(preset.lineColor, preset.opacity / 100)} 0, ${hexToRgba(preset.lineColor, preset.opacity / 100)} ${preset.lineWidth}px, transparent ${preset.lineWidth}px, transparent ${preset.cellSize * Math.sqrt(3)}px)`,
                      backgroundSize: preset.gridType === 'isometric' ? undefined : `${preset.cellSize}px ${preset.cellSize}px`,
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <span className="text-xs font-medium text-white drop-shadow">{t(`devTools.${preset.nameKey}`)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.preview')}</h3>
                <button
                  onClick={downloadPng}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('devTools.downloadPng')}
                </button>
              </div>
              <div className="p-6">
                <div
                  className="w-full h-80 rounded-xl shadow-inner border border-gray-200 dark:border-white/5 transition-all duration-300"
                  style={gridStyle}
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
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-cyan-300 dark:hover:border-cyan-500/50'
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
                <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-4 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
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
