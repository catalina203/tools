'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function CompareTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<'side' | 'slider'>('side');
  const [sliderPos, setSliderPos] = useState(50);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);
    setProcessedSrc(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImageSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const applyGrayscale = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) setProcessedSrc(URL.createObjectURL(blob));
    }, 'image/png');
  }, []);

  const applyBlur = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);
    const r = 5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let tr = 0, tg = 0, tb = 0, count = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < w && py >= 0 && py < h) {
              const idx = (py * w + px) * 4;
              tr += copy[idx];
              tg += copy[idx + 1];
              tb += copy[idx + 2];
              count++;
            }
          }
        }
        const idx = (y * w + x) * 4;
        data[idx] = tr / count;
        data[idx + 1] = tg / count;
        data[idx + 2] = tb / count;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) setProcessedSrc(URL.createObjectURL(blob));
    }, 'image/png');
  }, []);

  const reset = () => {
    setImageSrc(null);
    setProcessedSrc(null);
    setFileName('');
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pct)));
  };

  const hasBoth = imageSrc && processedSrc;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.compare')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.compare')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.compareDesc')}</p>
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
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.chooseImage')}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="p-6">
                  {hasBoth ? (
                    <div>
                      <div className="flex gap-2 mb-4">
                        <button onClick={() => setMode('side')} className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${mode === 'side' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{t('imageTools.compareSide')}</button>
                        <button onClick={() => setMode('slider')} className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${mode === 'slider' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>{t('imageTools.compareSlider')}</button>
                      </div>
                      {mode === 'side' ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">{t('imageTools.original')}</div>
                            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                              <img src={imageSrc} alt="original" className="max-w-full max-h-[280px] rounded-lg" />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">{t('imageTools.processed')}</div>
                            <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                              <img src={processedSrc} alt="processed" className="max-w-full max-h-[280px] rounded-lg" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div ref={containerRef} className="relative select-none" onMouseMove={handleSliderMove} onTouchMove={handleSliderMove}>
                          <div className="bg-gray-900 dark:bg-gray-800 rounded-xl overflow-hidden min-h-[300px]">
                            <img src={imageSrc} alt="original" className="w-full" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} />
                            <div className="absolute inset-0">
                              <img src={processedSrc} alt="processed" className="w-full" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }} />
                            </div>
                            <div className="absolute inset-y-0" style={{ left: `${sliderPos}%`, width: '3px' }}>
                              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-200 rounded-full shadow-lg flex items-center justify-center cursor-ew-resize">
                                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4 4 4m8-8l4 4-4 4" /></svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[360px]">
                      <img ref={imgRef} src={imageSrc} alt="source" className="max-w-full max-h-[340px] rounded-lg" />
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {imageSrc && !hasBoth && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('imageTools.compareEffects')}</h3>
                <div className="flex gap-3">
                  <button onClick={applyGrayscale} className="flex-1 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
                    {t('imageTools.grayscale')}
                  </button>
                  <button onClick={applyBlur} className="flex-1 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all">
                    {t('imageTools.blur')}
                  </button>
                </div>
              </div>
            )}

            {imageSrc && (
              <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {t('imageTools.reselect')}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('imageTools.compareInfo')}</h3>
              {imageSrc ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                    <span className="text-gray-500">{t('imageTools.compareMode')}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{mode === 'side' ? t('imageTools.compareSide') : t('imageTools.compareSlider')}</span>
                  </div>
                  {hasBoth && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                        <span className="text-gray-500">{t('imageTools.fileName')}</span>
                        <span className="text-gray-900 dark:text-white font-mono text-xs">{fileName}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">{t('imageTools.compareMode')}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{mode === 'side' ? t('imageTools.compareSide') : t('imageTools.compareSlider')}</span>
                      </div>
                    </>
                  )}
                  {!hasBoth && (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.compareHint')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.compareUploadHint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
