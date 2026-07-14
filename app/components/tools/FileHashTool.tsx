'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const algorithms = [
  { id: 'SHA-1', label: 'SHA-1' },
  { id: 'SHA-256', label: 'SHA-256' },
  { id: 'SHA-384', label: 'SHA-384' },
  { id: 'SHA-512', label: 'SHA-512' },
  { id: 'MD5', label: 'MD5' },
];

async function md5(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function computeHash(data: ArrayBuffer, algo: string): Promise<string> {
  if (algo === 'MD5') return md5(data);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

type HashResult = { algo: string; hash: string };

export default function FileHashTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const tf = useTranslations('tools');

  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [results, setResults] = useState<HashResult[]>([]);
  const [computing, setComputing] = useState(false);
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>(['SHA-256']);
  const [copied, setCopied] = useState('');

  const toggleAlgo = (algo: string) => {
    setSelectedAlgos((prev) =>
      prev.includes(algo) ? prev.filter((a) => a !== algo) : [...prev, algo]
    );
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setResults([]);
    setComputing(true);

    const data = await file.arrayBuffer();
    const hashResults: HashResult[] = [];
    for (const algo of selectedAlgos) {
      const hash = await computeHash(data, algo);
      hashResults.push({ algo, hash });
    }
    setResults(hashResults);
    setComputing(false);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(hash);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const reset = () => {
    setFileName('');
    setFileSize(0);
    setResults([]);
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
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{tf('fileTools.fileHash')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tf('fileTools.fileHash')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tf('fileTools.fileHashDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{tf('fileTools.hashAlgorithms')}</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {algorithms.map((algo) => (
                <button key={algo.id} onClick={() => toggleAlgo(algo.id)} className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${selectedAlgos.includes(algo.id) ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-amber-300 dark:hover:border-amber-500/50'}`}>
                  {algo.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            {!fileName ? (
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{tf('fileTools.hashUpload')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{tf('fileTools.hashUploadHint')}</p>
                <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 cursor-pointer">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  {tf('fileTools.hashSelect')}
                  <input type="file" onChange={handleFile} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{fileName}</div>
                      <div className="text-xs text-gray-500">{formatBytes(fileSize)}</div>
                    </div>
                  </div>
                  <button onClick={reset} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{tf('fileTools.hashReselect')}</button>
                </div>

                {computing ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{tf('fileTools.hashComputing')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((r) => (
                      <div key={r.algo} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{r.algo}</span>
                          <button onClick={() => copyHash(r.hash)} className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {copied === r.hash ? tf('fileTools.hashCopied') : tf('fileTools.hashCopy')}
                          </button>
                        </div>
                        <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all select-all">{r.hash}</div>
                      </div>
                    ))}
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
