'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const BARCODE_TYPES = [
  { value: 'CODE128', label: 'CODE128' },
  { value: 'CODE128A', label: 'CODE128A' },
  { value: 'CODE128B', label: 'CODE128B' },
  { value: 'CODE128C', label: 'CODE128C' },
  { value: 'EAN-13', label: 'EAN-13' },
  { value: 'EAN-8', label: 'EAN-8' },
  { value: 'UPC-A', label: 'UPC-A' },
  { value: 'UPC-E', label: 'UPC-E' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'ITF', label: 'ITF' },
  { value: 'MSI', label: 'MSI' },
  { value: 'PHARMACODE', label: 'Pharmacode' },
  { value: 'CODABAR', label: 'Codabar' },
];

export default function BarcodeTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [text, setText] = useState('');
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(60);
  const [showText, setShowText] = useState(true);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgData, setSvgData] = useState('');

  const generateBarcode = async () => {
    if (!text.trim()) return;
    try {
      const JsBarcode = (await import('jsbarcode')).default;
      const svg = svgRef.current;
      if (!svg) return;
      JsBarcode(svg, text, {
        format: barcodeType,
        width,
        height,
        displayValue: showText,
        background: bgColor,
        lineColor: fgColor,
        margin: 10,
        valid: (valid: boolean) => valid,
      });
      const serializer = new XMLSerializer();
      setSvgData(serializer.serializeToString(svg));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (text.trim()) {
      generateBarcode();
    }
  }, [barcodeType, width, height, showText, fgColor, bgColor]);

  const downloadSVG = () => {
    if (!svgData) return;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!svgRef.current) return;
    const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `barcode-${text.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };
    img.src = url;
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.barcode')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.barcode')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.barcodeDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.barcodeInput')}</h3>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('efficiencyTools.barcodePlaceholder')}
                className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                onClick={generateBarcode}
                disabled={!text.trim()}
                className="mt-4 w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('efficiencyTools.barcodeGenerate')}
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.options')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.barcodeType')}</label>
                  <select value={barcodeType} onChange={(e) => setBarcodeType(e.target.value)} className="w-full h-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                    {BARCODE_TYPES.map((bt) => (
                      <option key={bt.value} value={bt.value}>{bt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.barcodeWidth')} ({width})</label>
                    <input type="range" min="1" max="5" step="0.5" value={width} onChange={(e) => setWidth(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.barcodeHeight')} ({height})</label>
                    <input type="range" min="30" max="120" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.barcodeFgColor')}</label>
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-white dark:bg-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.barcodeBgColor')}</label>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer bg-white dark:bg-gray-900" />
                  </div>
                </div>
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                  <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} className="w-5 h-5 text-violet-500 border-gray-300 rounded focus:ring-violet-500" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{t('efficiencyTools.barcodeShowText')}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.preview')}</h3>
              <div className="bg-white rounded-xl p-4 shadow-inner w-full overflow-x-auto flex justify-center">
                <svg ref={svgRef} className="max-w-full"></svg>
                {!text.trim() && (
                  <div className="h-20 flex items-center text-gray-400 dark:text-gray-500 text-sm">{t('efficiencyTools.barcodeNoPreview')}</div>
                )}
              </div>
              {text.trim() && (
                <div className="flex gap-3 mt-4">
                  <button onClick={downloadSVG} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30">
                    {t('efficiencyTools.downloadSVG')}
                  </button>
                  <button onClick={downloadPNG} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('efficiencyTools.downloadPNG')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
