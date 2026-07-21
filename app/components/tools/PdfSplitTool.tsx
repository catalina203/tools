'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';
import { PDFDocument } from 'pdf-lib';

export default function PdfSplitTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [file, setFile] = useState<{ name: string; buffer: ArrayBuffer; pageCount: number } | null>(null);
  const [mode, setMode] = useState<'range' | 'all'>('all');
  const [range, setRange] = useState('');
  const [splitting, setSplitting] = useState(false);
  const [resultUrls, setResultUrls] = useState<{ name: string; url: string }[]>([]);
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
        setResultUrls([]);
      } catch {
        alert(t('pdfTools.loadError'));
      }
    };
    reader.readAsArrayBuffer(pdfFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseRange = (rangeStr: string, total: number): number[] => {
    const pages: number[] = [];
    const parts = rangeStr.split(',').map((p) => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= total) pages.push(i - 1);
          }
        }
      } else {
        const n = parseInt(part, 10);
        if (!isNaN(n) && n >= 1 && n <= total) pages.push(n - 1);
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const split = useCallback(async () => {
    if (!file) return;
    setSplitting(true);
    try {
      const urls: { name: string; url: string }[] = [];
      const srcPdf = await PDFDocument.load(file.buffer);
      const totalPages = srcPdf.getPageCount();

      if (mode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(srcPdf, [i]);
          newPdf.addPage(page);
          const bytes = await newPdf.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
          urls.push({ name: `page_${i + 1}.pdf`, url: URL.createObjectURL(blob) });
        }
      } else {
        const pages = parseRange(range, totalPages);
        if (pages.length === 0) {
          alert(t('pdfTools.invalidRange'));
          setSplitting(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(srcPdf, pages);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const bytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
        urls.push({ name: 'extracted.pdf', url: URL.createObjectURL(blob) });
      }

      setResultUrls(urls);
    } catch {
      alert(t('pdfTools.splitError'));
    } finally {
      setSplitting(false);
    }
  }, [file, mode, range, t]);

  const downloadAll = () => {
    resultUrls.forEach(({ name, url }) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
    });
  };

  const reset = () => {
    setFile(null);
    setRange('');
    setResultUrls([]);
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.pdfSplit')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pdfTools.pdfSplit')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('pdfTools.pdfSplitDesc')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('pdfTools.splitUpload')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('pdfTools.splitUploadHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 cursor-pointer">
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
                  <div className="flex items-center space-x-3 mb-4">
                    <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.pageCount} {t('pdfTools.pages')}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${mode === 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900'}`}>
                        <input type="radio" name="mode" value="all" checked={mode === 'all'} onChange={() => setMode('all')} className="sr-only" />
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === 'all' ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {mode === 'all' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{t('pdfTools.splitAll')}</div>
                            <div className="text-xs text-gray-500">{t('pdfTools.splitAllDesc')}</div>
                          </div>
                        </div>
                      </label>
                      <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${mode === 'range' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900'}`}>
                        <input type="radio" name="mode" value="range" checked={mode === 'range'} onChange={() => setMode('range')} className="sr-only" />
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === 'range' ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {mode === 'range' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{t('pdfTools.splitRange')}</div>
                            <div className="text-xs text-gray-500">{t('pdfTools.splitRangeDesc')}</div>
                          </div>
                        </div>
                      </label>
                    </div>

                    {mode === 'range' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.rangeInput')}</label>
                        <input type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder={t('pdfTools.rangePlaceholder')} className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={split} disabled={splitting || (mode === 'range' && !range.trim())} className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    {splitting ? t('pdfTools.splitting') : t('pdfTools.splitBtn')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('pdfTools.reselect')}
                  </button>
                </div>

                {resultUrls.length > 0 && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.splitResults')} ({resultUrls.length})</h3>
                      <button onClick={downloadAll} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/30">
                        {t('pdfTools.downloadAll')}
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {resultUrls.map(({ name, url }, i) => (
                        <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-white/10">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                          <a href={url} download={name} className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('pdfTools.downloadFile')}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.splitInfo')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-500">{t('pdfTools.totalPages')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{file?.pageCount ?? 0}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">{t('pdfTools.outputFiles')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{mode === 'all' ? file?.pageCount ?? 0 : resultUrls.length}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdfTools.splitTip')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('pdfTools.splitTipDesc')}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
