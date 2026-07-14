'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type FileItem = { file: File; size: number };

export default function ZipTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const tf = useTranslations('tools');

  const [files, setFiles] = useState<FileItem[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [zipName, setZipName] = useState('archive.zip');
  const [level, setLevel] = useState(6);
  const [originalTotal, setOriginalTotal] = useState(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    const items: FileItem[] = [];
    Array.from(selected).forEach((f) => items.push({ file: f, size: f.size }));
    setFiles((prev) => [...prev, ...items]);
    setOriginalTotal((prev) => prev + items.reduce((s, f) => s + f.size, 0));
    setZipUrl(null);
  };

  const removeFile = (index: number) => {
    const removed = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (removed) setOriginalTotal((prev) => prev - removed.size);
    setZipUrl(null);
  };

  const compress = async () => {
    if (files.length === 0) return;
    setCompressing(true);
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const item of files) {
      zip.file(item.file.name, item.file);
    }

    const content = await zip.generateAsync({
      type: 'blob',
      compression: level > 0 ? 'DEFLATE' : 'STORE',
      compressionOptions: { level },
    });

    setZipUrl(URL.createObjectURL(content));
    setCompressing(false);
  };

  const download = () => {
    if (!zipUrl) return;
    const a = document.createElement('a');
    a.href = zipUrl;
    a.download = zipName.replace(/\.zip$/i, '') + '.zip';
    a.click();
  };

  const reset = () => {
    setFiles([]);
    setZipUrl(null);
    setOriginalTotal(0);
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
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{tf('fileTools.zip')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tf('fileTools.zip')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tf('fileTools.zipDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 cursor-pointer">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {tf('fileTools.selectFiles')}
              <input type="file" multiple onChange={handleFiles} className="hidden" />
            </label>
          </div>

          {files.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{tf('fileTools.fileList')} ({files.length})</h3>
                <span className="text-sm text-gray-500">{tf('fileTools.totalSize')}: {formatBytes(originalTotal)}</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-sm text-gray-900 dark:text-white truncate">{f.file.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-500">{formatBytes(f.size)}</span>
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{tf('fileTools.compressionLevel')}: {level}</label>
                <span className="text-xs text-gray-400">{level === 0 ? tf('fileTools.noCompression') : tf('fileTools.maxCompression')}</span>
              </div>
              <input type="range" min={0} max={9} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
            </div>
          )}

          {files.length > 0 && (
            <div className="flex gap-4">
              <button onClick={compress} disabled={compressing} className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {compressing ? tf('fileTools.compressing') : tf('fileTools.startCompress')}
              </button>
              <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {t('imageTools.reset')}
              </button>
            </div>
          )}

          {zipUrl && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-gray-900 dark:text-white font-medium mb-1">{tf('fileTools.zipReady')}</p>
              <p className="text-sm text-gray-500 mb-4">{files.length} {tf('fileTools.files')}, {formatBytes(originalTotal)} {'→'} {formatBytes(zipUrl ? 0 : 0)}</p>
              <button onClick={download} className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {tf('fileTools.downloadZip')}
              </button>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
