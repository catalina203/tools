'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function Base64ImageTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [base64Str, setBase64Str] = useState('');
  const [outputFormat, setOutputFormat] = useState('image/png');
  const [copied, setCopied] = useState(false);
  const [decodedSrc, setDecodedSrc] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'encode' | 'decode'>('encode');
  const [pastedStr, setPastedStr] = useState('');
  const [decodeError, setDecodeError] = useState('');

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatLabels: Record<string, string> = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/webp': 'WebP',
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setDecodedSrc(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImageSrc(result);
      setBase64Str(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDecodeInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.trim();
    setPastedStr(val);
    setDecodeError('');

    if (!val) {
      setDecodedSrc(null);
      return;
    }

    try {
      const cleaned = val.replace(/\s/g, '');
      if (!cleaned.startsWith('data:image')) {
        const match = cleaned.match(/^[A-Za-z0-9+/=]+$/);
        if (!match) {
          setDecodeError(t('imageTools.base64Invalid'));
          setDecodedSrc(null);
          return;
        }
        const guessed = `data:image/png;base64,${cleaned}`;
        setDecodedSrc(guessed);
      } else {
        setDecodedSrc(cleaned);
      }
    } catch {
      setDecodeError(t('imageTools.base64Invalid'));
      setDecodedSrc(null);
    }
  };

  const convert = () => {
    if (!imageSrc || !canvasRef.current) return;
    const img = imgRef.current;
    if (!img) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const quality = outputFormat === 'image/png' ? undefined : 0.92;
    const dataUrl = canvas.toDataURL(outputFormat, quality);
    setBase64Str(dataUrl);
    setCopied(false);
  };

  const copyBase64 = () => {
    navigator.clipboard.writeText(base64Str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getSize = (dataUrl: string) => {
    const raw = atob(dataUrl.split(',')[1]);
    return (raw.length / 1024).toFixed(1);
  };

  const reset = () => {
    setImageSrc(null);
    setBase64Str('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.base64')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.base64')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.base64Desc')}</p>
        </div>

        <div className="flex gap-2 mb-8">
          <button onClick={() => setPreviewMode('encode')} className={`px-6 py-3 rounded-xl font-medium transition-all ${previewMode === 'encode' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {t('imageTools.base64Encode')}
          </button>
          <button onClick={() => setPreviewMode('decode')} className={`px-6 py-3 rounded-xl font-medium transition-all ${previewMode === 'decode' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {t('imageTools.base64Decode')}
          </button>
        </div>

        {previewMode === 'encode' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                {!imageSrc ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('imageTools.uploadImage')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('imageTools.supportFormat')}</p>
                    <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 cursor-pointer">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {t('imageTools.chooseImage')}
                      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[300px]">
                      <img ref={imgRef} src={imageSrc} alt="source" className="max-w-full max-h-[280px] rounded-lg" />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
              </div>

              {imageSrc && (
                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('imageTools.base64Format')}</label>
                  <div className="flex gap-2">
                    {Object.entries(formatLabels).map(([fmt, label]) => (
                      <button key={fmt} onClick={() => setOutputFormat(fmt)} className={`px-4 py-2.5 text-sm rounded-lg font-medium transition-all ${outputFormat === fmt ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {imageSrc && (
                <div className="flex gap-4">
                  <button onClick={convert} className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {t('imageTools.base64Convert')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('imageTools.reselect')}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.base64Result')}</h3>
                  {base64Str && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{getSize(base64Str)} KB</span>
                      <button onClick={copyBase64} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs rounded-lg transition-colors">
                        {copied ? t('imageTools.copied') : t('imageTools.copyBase64')}
                      </button>
                    </div>
                  )}
                </div>
                {base64Str ? (
                  <textarea readOnly value={base64Str} className="w-full h-64 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono text-gray-900 dark:text-white resize-none focus:outline-none" />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.base64Hint')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('imageTools.base64Input')}</h3>
                <textarea value={pastedStr} onChange={handleDecodeInput} placeholder={t('imageTools.base64Placeholder')} className="w-full h-64 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {decodeError && (
                  <p className="text-sm text-red-500 mt-2">{decodeError}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('imageTools.preview')}</h3>
                {decodedSrc ? (
                  <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[300px]">
                    <img src={decodedSrc} alt="decoded" className="max-w-full max-h-[280px] rounded-lg" onError={() => setDecodeError(t('imageTools.base64Invalid'))} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.base64DecodeHint')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
