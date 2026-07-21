'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

type PdfMeta = {
  pageCount: number;
  fileSize: string;
  title: string;
  author: string;
  subject: string;
  keywords: string;
  producer: string;
  creator: string;
  creationDate: string;
  modificationDate: string;
  version: string;
  dimensions: string[];
  thumbnail: string;
};

export default function PdfInfoTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [meta, setMeta] = useState<PdfMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date | undefined) => {
    if (!date) return '-';
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const pdfFile = selected[0];
    if (pdfFile.type !== 'application/pdf') return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      try {
        const pdf = await PDFDocument.load(buffer);
        const pdfjsDoc = await pdfjsLib.getDocument({
          data: buffer.slice(0),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/standard_fonts/',
        }).promise;
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvas, viewport } as any).promise;

        const dims: string[] = [];
        for (let i = 1; i <= Math.min(pdfjsDoc.numPages, 5); i++) {
          const p = await pdfjsDoc.getPage(i);
          const vp = p.getViewport({ scale: 1 });
          dims.push(`${vp.width.toFixed(0)} x ${vp.height.toFixed(0)} pt`);
        }
        if (pdfjsDoc.numPages > 5) dims.push('...');

        setMeta({
          pageCount: pdf.getPageCount(),
          fileSize: formatSize(pdfFile.size),
          title: pdf.getTitle() || '-',
          author: pdf.getAuthor() || '-',
          subject: pdf.getSubject() || '-',
          keywords: pdf.getKeywords() || '-',
          producer: pdf.getProducer() || '-',
          creator: pdf.getCreator() || '-',
          creationDate: formatDate(pdf.getCreationDate()),
          modificationDate: formatDate(pdf.getModificationDate()),
          version: (pdf as any).getVersion() || '-',
          dimensions: dims,
          thumbnail: canvas.toDataURL('image/jpeg', 0.6),
        });
      } catch {
        alert(t('pdfTools.loadError'));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(pdfFile);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reset = () => {
    setMeta(null);
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2.5 border-b border-gray-200 dark:border-white/10 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white font-medium text-right max-w-[60%] truncate" title={value}>{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('pdfTools.pdfInfo')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('pdfTools.pdfInfo')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('pdfTools.pdfInfoDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!meta ? (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('pdfTools.infoUpload')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('pdfTools.infoUploadHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t('pdfTools.selectPdf')}
                    <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {meta.thumbnail && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    <img src={meta.thumbnail} alt="Preview" className="w-full max-h-96 object-contain" />
                  </div>
                )}
                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.infoDocument')}</h3>
                  <div className="divide-y divide-gray-200 dark:divide-white/10">
                    <InfoRow label={t('pdfTools.infoPageCount')} value={String(meta.pageCount)} />
                    <InfoRow label={t('pdfTools.infoFileSize')} value={meta.fileSize} />
                    <InfoRow label={t('pdfTools.infoVersion')} value={meta.version} />
                    <InfoRow label={t('pdfTools.infoTitle')} value={meta.title} />
                    <InfoRow label={t('pdfTools.infoAuthor')} value={meta.author} />
                    <InfoRow label={t('pdfTools.infoSubject')} value={meta.subject} />
                    <InfoRow label={t('pdfTools.infoKeywords')} value={meta.keywords} />
                    <InfoRow label={t('pdfTools.infoProducer')} value={meta.producer} />
                    <InfoRow label={t('pdfTools.infoCreator')} value={meta.creator} />
                    <InfoRow label={t('pdfTools.infoCreationDate')} value={meta.creationDate} />
                    <InfoRow label={t('pdfTools.infoModDate')} value={meta.modificationDate} />
                  </div>
                </div>
                {meta.dimensions.length > 0 && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.infoPageDims')}</h3>
                    <div className="divide-y divide-gray-200 dark:divide-white/10">
                      {meta.dimensions.map((dim, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10 last:border-0">
                          <span className="text-sm text-gray-500">{i < 5 ? `${t('pdfTools.page')} ${i + 1}` : ''}</span>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">{dim}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={reset} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  {t('pdfTools.reselect')}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {meta && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('pdfTools.infoSummary')}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-gray-500">{t('pdfTools.totalPages')}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{meta.pageCount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">{t('pdfTools.infoFileSize')}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{meta.fileSize}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pdfTools.infoTip')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('pdfTools.infoTipDesc')}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
