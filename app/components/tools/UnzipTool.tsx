'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type ExtractedFile = { name: string; blob: Blob; size: number };

export default function UnzipTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const tf = useTranslations('tools');

  const [files, setFiles] = useState<ExtractedFile[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [zipName, setZipName] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      setError(tf('fileTools.unzipInvalid'));
      return;
    }
    setError('');
    setExtracting(true);
    setZipName(file.name.replace(/\.zip$/i, ''));

    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      const extracted: ExtractedFile[] = [];

      const entries = Object.entries(zip.files);
      for (const [, zipEntry] of entries) {
        if (!zipEntry.dir) {
          const blob = await zipEntry.async('blob');
          extracted.push({ name: zipEntry.name, blob, size: blob.size });
        }
      }

      extracted.sort((a, b) => a.name.localeCompare(b.name));
      setFiles(extracted);
    } catch {
      setError(tf('fileTools.unzipError'));
    }
    setExtracting(false);
  };

  const downloadFile = (f: ExtractedFile) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(f.blob);
    a.download = f.name.split('/').pop() || f.name;
    a.click();
  };

  const downloadAll = () => {
    for (const f of files) {
      downloadFile(f);
    }
  };

  const reset = () => {
    setFiles([]);
    setZipName('');
    setError('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{tf('fileTools.unzip')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tf('fileTools.unzip')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tf('fileTools.unzipDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            {files.length === 0 ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{tf('fileTools.unzipUpload')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{tf('fileTools.unzipUploadHint')}</p>
                <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {tf('fileTools.unzipSelect')}
                  <input type="file" accept=".zip" onChange={handleFile} className="hidden" />
                </label>
                {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{zipName} ({files.length} {tf('fileTools.files')})</h3>
                  <div className="flex gap-2">
                    <button onClick={downloadAll} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-lg transition-colors">{tf('fileTools.downloadAll')}</button>
                  </div>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="text-sm text-gray-900 dark:text-white truncate">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-xs text-gray-500">{formatBytes(f.size)}</span>
                        <button onClick={() => downloadFile(f)} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('imageTools.download')}</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={reset} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{tf('fileTools.chooseAnother')}</button>
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
