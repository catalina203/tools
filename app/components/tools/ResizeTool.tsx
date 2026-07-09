'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function ResizeTool() {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);
    setResultUrl(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImageSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
    setTargetWidth(img.naturalWidth);
    setTargetHeight(img.naturalHeight);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && imgNatural.w > 0) {
      setTargetHeight(Math.round((val / imgNatural.w) * imgNatural.h));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && imgNatural.h > 0) {
      setTargetWidth(Math.round((val / imgNatural.h) * imgNatural.w));
    }
  };

  const resize = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || targetWidth <= 0 || targetHeight <= 0) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
      }
    }, 'image/png');
  }, [targetWidth, targetHeight]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `resized-${fileName || 'image.png'}`;
    a.click();
  };

  const reset = () => {
    setImageSrc(null);
    setResultUrl(null);
    setResultSize(0);
    setFileName('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const presets = [
    { label: '50%', w: 0.5 },
    { label: '75%', w: 0.75 },
    { label: '150%', w: 1.5 },
    { label: '200%', w: 2 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.resize')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.resize')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.resizeDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.chooseImage')}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="p-6">
                  <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[360px]">
                    <img ref={imgRef} src={imageSrc} alt="source" onLoad={onImgLoad} className="max-w-full max-h-[340px] rounded-lg" />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('imageTools.originalWidth')}</label>
                    <div className="px-4 py-3 bg-white dark:bg-gray-900 rounded-lg text-gray-900 dark:text-white font-mono">{imgNatural.w}px</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('imageTools.originalHeight')}</label>
                    <div className="px-4 py-3 bg-white dark:bg-gray-900 rounded-lg text-gray-900 dark:text-white font-mono">{imgNatural.h}px</div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button onClick={() => setTargetWidth(imgNatural.w)} className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    {t('imageTools.resetSize')}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('imageTools.targetWidth')}</label>
                    <input type="number" value={targetWidth} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono focus:outline-none focus:border-violet-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">{t('imageTools.targetHeight')}</label>
                    <input type="number" value={targetHeight} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono focus:outline-none focus:border-violet-500" />
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <button onClick={() => setLockAspect(!lockAspect)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${lockAspect ? 'bg-violet-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {lockAspect ? t('imageTools.aspectLocked') : t('imageTools.aspectUnlocked')}
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('imageTools.presetSizes')}</label>
                  <div className="flex gap-2">
                    {presets.map((p) => (
                      <button key={p.label} onClick={() => { setTargetWidth(Math.round(imgNatural.w * p.w)); setTargetHeight(Math.round(imgNatural.h * p.w)); }} className="flex-1 py-2.5 text-sm rounded-lg font-medium border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {imageSrc && (
              <div className="flex gap-4">
                <button onClick={resize} className="flex-1 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('imageTools.startResize')}
                </button>
                <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  {t('imageTools.reselect')}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('imageTools.preview')}
              </h3>
              {resultUrl ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 flex items-center justify-center min-h-[180px]">
                    <img src={resultUrl} alt="result" className="max-w-full max-h-[160px] rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">{t('imageTools.original')}</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{targetWidth}x{targetHeight}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">{t('imageTools.result')}</div>
                      <div className="font-semibold text-emerald-500">{formatBytes(resultSize)}</div>
                    </div>
                  </div>
                  <button onClick={download} className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.resizeHint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.resizeFeatureTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{t('imageTools.resizeFeatureDesc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🔍', key: 'resizeFeature1' },
                { icon: '📐', key: 'resizeFeature2' },
                { icon: '⚡', key: 'resizeFeature3' },
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
                  <span className="flex-shrink-0 w-7 h-7 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">{i}</span>
                  <span>{t(`imageTools.resizeStep${i}` as any)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.faq')}</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(`imageTools.resizeFaq${i}Q` as any)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`imageTools.resizeFaq${i}A` as any)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.relatedTools')}</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools/crop" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('imageTools.crop')}</Link>
              <Link href="/tools/rotate" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('imageTools.rotate')}</Link>
              <Link href="/tools/compress" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('imageTools.compress')}</Link>
              <Link href="/tools/formatConvert" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('imageTools.formatConvert')}</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
