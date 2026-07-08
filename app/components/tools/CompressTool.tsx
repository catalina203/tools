'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type FormatType = 'image/jpeg' | 'image/png' | 'image/webp';

export default function CompressTool() {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<FormatType>('image/jpeg');
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);
    setOriginalSize(file.size);
    setResultUrl(null);
    setResultSize(0);
    const reader = new FileReader();
    reader.onload = (ev) => setImageSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    setMaxWidth(img.naturalWidth);
  };

  const compress = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    requestAnimationFrame(() => {
      const img = imgRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setIsProcessing(false); return; }

      const targetW = maxWidth > 0 ? Math.min(maxWidth, imgNatural.w) : imgNatural.w;
      const scale = targetW / imgNatural.w;
      const targetH = Math.round(imgNatural.h * scale);

      canvas.width = targetW;
      canvas.height = targetH;

      if (format === 'image/png') {
        ctx.clearRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setResultUrl(URL.createObjectURL(blob));
            setResultSize(blob.size);
          }
          setIsProcessing(false);
        },
        format,
        quality / 100
      );
    });
  }, [quality, format, maxWidth, imgNatural]);

  const download = () => {
    if (!resultUrl) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const base = fileName.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${base}-compressed.${ext}`;
    a.click();
  };

  const reset = () => {
    setImageSrc(null);
    setResultUrl(null);
    setResultSize(0);
    setOriginalSize(0);
    setFileName('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const compressionRatio = originalSize > 0 && resultSize > 0
    ? Math.round((1 - resultSize / originalSize) * 100)
    : 0;

  const formatOptions = [
    { label: 'JPEG', value: 'image/jpeg' as FormatType, ext: '.jpg' },
    { label: 'PNG', value: 'image/png' as FormatType, ext: '.png' },
    { label: 'WebP', value: 'image/webp' as FormatType, ext: '.webp' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link
            href="/tools"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('imageTools.compress')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.compress')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.compressDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              {!imageSrc ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('imageTools.uploadImage')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    {t('imageTools.supportFormat')}
                  </p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.chooseImage')}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="p-6">
                  <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[360px]">
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="source"
                      onLoad={onImgLoad}
                      className="max-w-full max-h-[340px] rounded-lg"
                    />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('imageTools.quality')}
                    </label>
                    <span className="text-sm font-mono font-bold text-teal-500">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{t('imageTools.smaller')}</span>
                    <span>{t('imageTools.better')}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    {t('imageTools.outputFormat')}
                  </label>
                  <div className="flex gap-2">
                    {formatOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFormat(opt.value)}
                        className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all border ${
                          format === opt.value
                            ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20'
                            : 'bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-teal-300 dark:hover:border-teal-500/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('imageTools.maxWidth')}
                    </label>
                    <span className="text-sm font-mono font-bold text-teal-500">{maxWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={imgNatural.w}
                    step={10}
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>100px</span>
                    <span>{imgNatural.w}px</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">{t('imageTools.original')}</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{formatBytes(originalSize)}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">{t('imageTools.compressed')}</div>
                    <div className="font-semibold text-teal-500">
                      {resultSize > 0 ? formatBytes(resultSize) : '--'}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-1">{t('imageTools.saved')}</div>
                    <div className={`font-semibold ${compressionRatio > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                      {compressionRatio > 0 ? `-${compressionRatio}%` : '--'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {imageSrc && (
              <div className="flex gap-4">
                <button
                  onClick={compress}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-500/30 flex items-center justify-center disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('imageTools.processing')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      {t('imageTools.startCompress')}
                    </>
                  )}
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('imageTools.reselect')}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('imageTools.result')}
              </h3>
              {resultUrl ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center justify-center min-h-[180px]">
                    <img src={resultUrl} alt="result" className="max-w-full max-h-[160px] rounded-lg" />
                  </div>
                  <button
                    onClick={download}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('imageTools.download')}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.compressHint')}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('imageTools.tips')}</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">-</span>
                  {t('imageTools.tip1')}
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">-</span>
                  {t('imageTools.tip2')}
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-2">-</span>
                  {t('imageTools.tip3')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.compressFeatureTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{t('imageTools.compressFeatureDesc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '📦', key: 'compressFeature1' },
                { icon: '🎨', key: 'compressFeature2' },
                { icon: '⚡', key: 'compressFeature3' },
              ].map((f) => (
                <div key={f.key} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                  <span className="text-2xl mb-3 block">{f.icon}</span>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`imageTools.${f.key}Title` as any)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`imageTools.${f.key}Desc` as any)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.howToUse')}</h2>
            <ol className="space-y-3 text-gray-600 dark:text-gray-400">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">{i}</span>
                  <span>{t(`imageTools.compressStep${i}` as any)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.faq')}</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(`imageTools.compressFaq${i}Q` as any)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`imageTools.compressFaq${i}A` as any)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.relatedTools')}</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools/crop" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.crop')}
              </Link>
              <Link href="/tools/formatConvert" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.formatConvert')}
              </Link>
              <Link href="/tools/resize" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.resize')}
              </Link>
              <Link href="/tools/base64" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.base64')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
