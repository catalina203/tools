'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';
import { PDFDocument } from 'pdf-lib';

export default function PdfCompressTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [file, setFile] = useState<{ name: string; buffer: ArrayBuffer; size: number } | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const pdfFile = selected[0];
    if (pdfFile.type !== 'application/pdf') return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      setFile({ name: pdfFile.name, buffer, size: pdfFile.size });
      setResultUrl(null);
      setResultSize(0);
    };
    reader.readAsArrayBuffer(pdfFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const compress = useCallback(async () => {
    if (!file) return;
    setCompressing(true);
    try {
      const pdf = await PDFDocument.load(file.buffer, { ignoreEncryption: true });

      const pages = pdf.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        const scale = quality / 100;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.round(width * scale);
        tempCanvas.height = Math.round(height * scale);
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.scale(scale, scale);
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, width, height);

        const newPage = pdf.insertPage(0, [width, height]);
        const jpgUri = tempCanvas.toDataURL('image/jpeg', 0.85);
        const pngBytes = await fetch(jpgUri).then((r) => r.arrayBuffer());
        const jpgImage = await pdf.embedJpg(new Uint8Array(pngBytes));
        newPage.drawImage(jpgImage, { x: 0, y: 0, width, height });

        pdf.removePage(pages.indexOf(page) + 1);
      }

      const compressedBytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      alert(t('pdfTools.compressError'));
    } finally {
      setCompressing(false);
    }
  }, [file, quality, t]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `compressed_${file?.name || 'output.pdf'}`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setResultUrl(null);
    setResultSize(0);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.pdfCompress')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pdfTools.pdfCompress')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('pdfTools.pdfCompressDesc')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('pdfTools.compressUpload')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('pdfTools.compressUploadHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 cursor-pointer">
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
                    <svg className="w-8 h-8 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                      <div className="text-xs text-gray-500">{formatSize(file.size)}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('pdfTools.qualityLabel')}</label>
                        <span className="text-sm text-gray-500">{quality}%</span>
                      </div>
                      <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{t('pdfTools.smaller')}</span>
                        <span>{t('pdfTools.better')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={compress} disabled={compressing} className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    {compressing ? t('pdfTools.compressing') : t('pdfTools.compressBtn')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('pdfTools.reselect')}
                  </button>
                </div>

                {resultUrl && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-gray-900 dark:text-white font-medium mb-3">{t('pdfTools.compressDone')}</p>
                      <div className="flex justify-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">{t('pdfTools.originalSize')}: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{formatSize(file.size)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('pdfTools.compressedSize')}: </span>
                          <span className="text-emerald-500 font-medium">{formatSize(resultSize)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('pdfTools.saved')}: </span>
                          <span className="text-emerald-500 font-medium">{file.size > 0 ? `${Math.round((1 - resultSize / file.size) * 100)}%` : '0%'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <button onClick={download} className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t('pdfTools.downloadCompressed')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.compressInfo')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-500">{t('pdfTools.originalSize')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{file ? formatSize(file.size) : '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">{t('pdfTools.compressQuality')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{quality}%</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdfTools.compressTip')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('pdfTools.compressTipDesc')}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
