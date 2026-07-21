'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function PdfPageNumberTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [file, setFile] = useState<{ name: string; buffer: ArrayBuffer; pageCount: number } | null>(null);
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState('#000000');
  const [position, setPosition] = useState<'bottomCenter' | 'bottomLeft' | 'bottomRight' | 'topCenter' | 'topLeft' | 'topRight'>('bottomCenter');
  const [template, setTemplate] = useState('{n}');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const pdfFile = selected[0];
    if (pdfFile.type !== 'application/pdf') return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      try {
        const pdf = await PDFDocument.load(buffer);
        setFile({ name: pdfFile.name, buffer, pageCount: pdf.getPageCount() });
        setResultUrl(null);
      } catch {
        alert(t('pdfTools.loadError'));
      }
    };
    reader.readAsArrayBuffer(pdfFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 10) / 255, g: parseInt(result[2], 10) / 255, b: parseInt(result[3], 10) / 255 }
      : { r: 0, g: 0, b: 0 };
  };

  const addPageNumbers = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const pdf = await PDFDocument.load(file.buffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const { r, g, b } = hexToRgb(color);
      const padding = 30;

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const pageNum = startNum + i;
        const numText = template.replace('{n}', String(pageNum)).replace('{total}', String(file.pageCount));

        let x = 0, y = 0;
        switch (position) {
          case 'bottomCenter':
            x = width / 2 - (numText.length * fontSize * 0.35) / 2;
            y = padding;
            break;
          case 'bottomLeft':
            x = padding;
            y = padding;
            break;
          case 'bottomRight':
            x = width - padding - numText.length * fontSize * 0.35;
            y = padding;
            break;
          case 'topCenter':
            x = width / 2 - (numText.length * fontSize * 0.35) / 2;
            y = height - padding - fontSize;
            break;
          case 'topLeft':
            x = padding;
            y = height - padding - fontSize;
            break;
          case 'topRight':
            x = width - padding - numText.length * fontSize * 0.35;
            y = height - padding - fontSize;
            break;
        }

        page.drawText(numText, {
          x, y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
        });
      });

      const bytes = await pdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
    } catch {
      alert(t('pdfTools.pageNumberError'));
    } finally {
      setProcessing(false);
    }
  }, [file, startNum, fontSize, color, position, template]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `numbered_${file?.name || 'output.pdf'}`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.pdfPageNumber')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pdfTools.pdfPageNumber')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('pdfTools.pdfPageNumberDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!file ? (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('pdfTools.pageNumberUpload')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('pdfTools.pageNumberUploadHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('pdfTools.selectPdf')}
                    <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <svg className="w-8 h-8 text-pink-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.pageCount} {t('pdfTools.pages')}</div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.pageNumberStart')}</label>
                        <input type="number" min={1} value={startNum} onChange={(e) => setStartNum(Math.max(1, Number(e.target.value)))} className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.pageNumberSize')}</label>
                        <input type="number" min={6} max={100} value={fontSize} onChange={(e) => setFontSize(Math.max(6, Math.min(100, Number(e.target.value))))} className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.pageNumberTemplate')}</label>
                      <input type="text" value={template} onChange={(e) => setTemplate(e.target.value)} placeholder="{n}" className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50" />
                      <p className="text-xs text-gray-400 mt-1">{t('pdfTools.pageNumberTemplateHint')}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.pageNumberColor')}</label>
                      <div className="flex items-center space-x-3">
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-white/10" />
                        <span className="text-sm text-gray-500">{color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdfTools.pageNumberPosition')}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight'] as const).map((pos) => (
                          <button key={pos} onClick={() => setPosition(pos)} className={`p-2 rounded-lg border text-xs transition-all ${position === pos ? 'border-pink-500 bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}>
                            {t(`pdfTools.pageNumberPos${pos.charAt(0).toUpperCase() + pos.slice(1)}` as any)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={addPageNumbers} disabled={processing} className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-400 hover:to-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {processing ? t('pdfTools.pageNumbering') : t('pdfTools.pageNumberBtn')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('pdfTools.reselect')}
                  </button>
                </div>

                {resultUrl && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium mb-4">{t('pdfTools.pageNumberDone')}</p>
                    <button onClick={download} className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('pdfTools.downloadNumbered')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.pageNumberInfo')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-500">{t('pdfTools.totalPages')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{file?.pageCount ?? '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">{t('pdfTools.pageNumberStart')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{startNum}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdfTools.pageNumberTip')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('pdfTools.pageNumberTipDesc')}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
