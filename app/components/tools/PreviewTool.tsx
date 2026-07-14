'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type PreviewData = {
  type: 'image' | 'text' | 'unknown';
  url: string;
  name: string;
  size: number;
  content?: string;
};

export default function PreviewTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const tf = useTranslations('tools');

  const [preview, setPreview] = useState<PreviewData | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isText = file.type.startsWith('text/') ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.xml') ||
      file.name.endsWith('.js') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.html') ||
      file.name.endsWith('.css') ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.yml') ||
      file.name.endsWith('.yaml');

    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreview({ type: 'image', url, name: file.name, size: file.size });
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setPreview({ type: 'text', url: '', name: file.name, size: file.size, content });
      };
      reader.readAsText(file);
    } else {
      const url = URL.createObjectURL(file);
      setPreview({ type: 'unknown', url, name: file.name, size: file.size });
    }
  };

  const reset = () => setPreview(null);

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
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{tf('fileTools.preview')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tf('fileTools.preview')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tf('fileTools.previewDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            {!preview ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{tf('fileTools.previewUpload')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{tf('fileTools.previewUploadHint')}</p>
                <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {tf('fileTools.previewSelect')}
                  <input type="file" onChange={handleFile} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{preview.name}</div>
                      <div className="text-xs text-gray-500">{formatBytes(preview.size)}</div>
                    </div>
                  </div>
                  <button onClick={reset} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{tf('fileTools.previewReselect')}</button>
                </div>

                {preview.type === 'image' ? (
                  <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[400px]">
                    <img src={preview.url} alt={preview.name} className="max-w-full max-h-[500px] rounded-lg" />
                  </div>
                ) : preview.type === 'text' ? (
                  <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden">
                    <pre className="p-6 text-sm font-mono text-gray-100 overflow-x-auto whitespace-pre-wrap max-h-[500px]">{preview.content}</pre>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    <p className="text-gray-500">{tf('fileTools.previewUnsupported')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
