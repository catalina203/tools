'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function CropTool() {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const [aspect, setAspect] = useState<number | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

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
    setCrop({ x: 0, y: 0, w: 100, h: 100 });
  };

  const applyAspect = (ratio: number | null) => {
    setAspect(ratio);
    if (ratio && imgNatural.w && imgNatural.h) {
      const imgRatio = imgNatural.w / imgNatural.h;
      if (imgRatio > ratio) {
        setCrop((p) => ({ ...p, h: p.w / ratio }));
      } else {
        setCrop((p) => ({ ...p, w: p.h * ratio }));
      }
    }
  };

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      dragging.current = true;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        cx: crop.x,
        cy: crop.y,
      };
      e.preventDefault();
    },
    [crop.x, crop.y]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;
      const nx = Math.max(0, Math.min(100 - crop.w, dragStart.current.cx + dx));
      const ny = Math.max(0, Math.min(100 - crop.h, dragStart.current.cy + dy));
      setCrop((p) => ({ ...p, x: nx, y: ny }));
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [crop.w, crop.h]);

  const doCrop = () => {
    if (!imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sx = (crop.x / 100) * imgNatural.w;
    const sy = (crop.y / 100) * imgNatural.h;
    const sw = (crop.w / 100) * imgNatural.w;
    const sh = (crop.h / 100) * imgNatural.h;

    canvas.width = sw;
    canvas.height = sh;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.toBlob((blob) => {
      if (blob) {
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
      }
    }, 'image/png');
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `cropped-${fileName || 'image.png'}`;
    a.click();
  };

  const reset = () => {
    setCrop({ x: 0, y: 0, w: 100, h: 100 });
    setResultUrl(null);
  };

  const aspectButtons = [
    { label: t('imageTools.cropFree'), value: null },
    { label: '1:1', value: 1 },
    { label: '4:3', value: 4 / 3 },
    { label: '16:9', value: 16 / 9 },
    { label: '3:2', value: 3 / 2 },
    { label: '2:3', value: 2 / 3 },
    { label: '9:16', value: 9 / 16 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link
            href="/tools"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('imageTools.crop')}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.crop')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.cropDesc')}</p>
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {t('imageTools.uploadImage')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    {t('imageTools.supportFormat')}
                  </p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.chooseImage')}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <>
                  <div className="bg-gray-900 dark:bg-gray-800 p-6 flex items-center justify-center min-h-[420px]">
                    <div
                      ref={containerRef}
                      className="relative inline-block select-none cursor-crosshair"
                      onMouseDown={onMouseDown}
                    >
                      <img
                        ref={imgRef}
                        src={imageSrc}
                        alt="source"
                        onLoad={onImgLoad}
                        className="max-w-full max-h-[380px] rounded-lg block"
                        draggable={false}
                      />
                      {imgNatural.w > 0 && (
                        <>
                          <div className="absolute inset-0 bg-black/50 rounded-lg" style={{ clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${crop.x}% ${crop.y}%, ${crop.x}% ${crop.y + crop.h}%, ${crop.x + crop.w}% ${crop.y + crop.h}%, ${crop.x + crop.w}% ${crop.y}%, ${crop.x}% ${crop.y}%)` }} />
                          <div
                            className="absolute border-2 border-white/90 rounded-sm shadow-lg"
                            style={{
                              left: `${crop.x}%`,
                              top: `${crop.y}%`,
                              width: `${crop.w}%`,
                              height: `${crop.h}%`,
                              cursor: 'move',
                            }}
                          >
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                              {[...Array(9)].map((_, i) => (
                                <div key={i} className="border border-white/20" />
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </>
              )}
            </div>

            {imageSrc && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('imageTools.aspectRatio')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {aspectButtons.map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => applyAspect(btn.value)}
                      className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border ${
                        aspect === btn.value
                          ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-500/20'
                          : 'bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-500/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {t('imageTools.cropArea')}: {Math.round((crop.w / 100) * imgNatural.w)} x {Math.round((crop.h / 100) * imgNatural.h)} px
                  </span>
                  <span>|</span>
                  <span>
                    {t('imageTools.originalSize')}: {imgNatural.w} x {imgNatural.h} px
                  </span>
                </div>
              </div>
            )}

            {imageSrc && (
              <div className="flex gap-4">
                <button
                  onClick={doCrop}
                  className="flex-1 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('imageTools.applyCrop')}
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('imageTools.reset')}
                </button>
                <label className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  {t('imageTools.reselect')}
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {(imgNatural.w * imgNatural.h * 4 / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 text-center">
                      <div className="text-gray-500 dark:text-gray-400 mb-1">{t('imageTools.result')}</div>
                      <div className="font-semibold text-emerald-500">
                        {(resultSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.cropHint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.cropFeatureTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{t('imageTools.cropFeatureDesc')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '✂️', key: 'cropFeature1' },
                { icon: '📐', key: 'cropFeature2' },
                { icon: '💾', key: 'cropFeature3' },
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
                  <span className="flex-shrink-0 w-7 h-7 bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">{i}</span>
                  <span>{t(`imageTools.cropStep${i}` as any)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.faq')}</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(`imageTools.cropFaq${i}Q` as any)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(`imageTools.cropFaq${i}A` as any)}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.relatedTools')}</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/tools/resize" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.resize')}
              </Link>
              <Link href="/tools/rotate" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.rotate')}
              </Link>
              <Link href="/tools/compress" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.compress')}
              </Link>
              <Link href="/tools/formatConvert" className="px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">
                {t('imageTools.formatConvert')}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
