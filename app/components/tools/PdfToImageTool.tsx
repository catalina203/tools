'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PdfToImageTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [file, setFile] = useState<{ name: string; buffer: ArrayBuffer; pageCount: number } | null>(null);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<{ dataUrl: string; pageNum: number }[]>([]);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState(1.5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const pdfFile = selected[0];
    if (pdfFile.type !== 'application/pdf') return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      setFile({ name: pdfFile.name, buffer, pageCount: 0 });
      setImages([]);
    };
    reader.readAsArrayBuffer(pdfFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convert = useCallback(async () => {
    if (!file) return;
    setConverting(true);
    try {
      const pdf = await pdfjsLib.getDocument({ data: file.buffer.slice(0) }).promise;
      setFile((prev) => prev ? { ...prev, pageCount: pdf.numPages } : prev);

      const resultImages: { dataUrl: string; pageNum: number }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvas, viewport } as any).promise;

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'jpeg' ? 0.92 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resultImages.push({ dataUrl, pageNum: i });
      }
      setImages(resultImages);
    } catch {
      alert(t('pdfTools.convertError'));
    } finally {
      setConverting(false);
    }
  }, [file, format, scale, t]);

  const downloadAll = () => {
    images.forEach(({ dataUrl, pageNum }) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${file?.name.replace('.pdf', '') || 'page'}_${pageNum}.${format}`;
      a.click();
    });
  };

  const downloadSingle = (dataUrl: string, pageNum: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${file?.name.replace('.pdf', '') || 'page'}_${pageNum}.${format}`;
    a.click();
  };

  const reset = () => {
    setFile(null);
    setImages([]);
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.pdfToImage')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pdfTools.pdfToImage')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('pdfTools.pdfToImageDesc')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('pdfTools.convertUpload')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('pdfTools.convertUploadHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 cursor-pointer">
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
                    <svg className="w-8 h-8 text-violet-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.pageCount > 0 ? `${file.pageCount} ${t('pdfTools.pages')}` : ''}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.outputFormat')}</label>
                      <select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')} className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('pdfTools.imageScale')}</label>
                      <select value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                        <option value="0.5">0.5x</option>
                        <option value="1">1x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={convert} disabled={converting} className="flex-1 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {converting ? t('pdfTools.converting') : t('pdfTools.convertBtn')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('pdfTools.reselect')}
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.convertResults')} ({images.length})</h3>
                      <button onClick={downloadAll} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/30">
                        {t('pdfTools.downloadAll')}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {images.map(({ dataUrl, pageNum }) => (
                        <div key={pageNum} className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                            <img src={dataUrl} alt={`Page ${pageNum}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{t('pdfTools.page')} {pageNum}</span>
                            <button onClick={() => downloadSingle(dataUrl, pageNum)} className="text-xs text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                              {t('pdfTools.downloadFile')}
                            </button>
                          </div>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.convertInfo')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-500">{t('pdfTools.totalPages')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{file?.pageCount ?? '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">{t('pdfTools.outputFormat')}</span>
                  <span className="text-gray-900 dark:text-white font-medium uppercase">{format}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdfTools.convertTip')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('pdfTools.convertTipDesc')}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
