'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function RotateTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
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

  const rotateLeft = () => setRotation((r) => r - 90);
  const rotateRight = () => setRotation((r) => r + 90);
  const resetTransform = () => { setRotation(0); setFlipH(false); setFlipV(false); };

  const apply = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rad = (rotation * Math.PI) / 180;
    const isRightAngle = rotation % 90 === 0;
    const swap = isRightAngle && Math.abs(rotation % 180) !== 0;

    const w = swap ? img.naturalHeight : img.naturalWidth;
    const h = swap ? img.naturalWidth : img.naturalHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
      }
    }, 'image/png');
  }, [rotation, flipH, flipV]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `rotated-${fileName || 'image.png'}`;
    a.click();
  };

  const reset = () => {
    setImageSrc(null);
    setResultUrl(null);
    setResultSize(0);
    setFileName('');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const rotationPresets = [
    { label: '-90°', value: -90 },
    { label: '0°', value: 0 },
    { label: '90°', value: 90 },
    { label: '180°', value: 180 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.rotate')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.rotate')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.rotateDesc')}</p>
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
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/30 cursor-pointer">
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
                    <img ref={imgRef} src={imageSrc} alt="source" className="max-w-full max-h-[340px] rounded-lg transition-transform duration-300" style={{ transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})` }} />
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('imageTools.rotation')}</label>
                  <div className="flex gap-2">
                    {rotationPresets.map((p) => (
                      <button key={p.value} onClick={() => setRotation(p.value)} className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all border ${rotation === p.value ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-cyan-300 dark:hover:border-cyan-500/50'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <input type="range" min={0} max={360} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-cyan-500" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0°</span>
                      <span>{t('imageTools.currentAngle')}: {rotation}°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('imageTools.flip')}</label>
                  <div className="flex gap-3">
                    <button onClick={() => setFlipH(!flipH)} className={`flex-1 py-3 rounded-lg font-medium transition-all border ${flipH ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-cyan-300'}`}>
                      {t('imageTools.flipHorizontal')}
                    </button>
                    <button onClick={() => setFlipV(!flipV)} className={`flex-1 py-3 rounded-lg font-medium transition-all border ${flipV ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-cyan-300'}`}>
                      {t('imageTools.flipVertical')}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={rotateLeft} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" /></svg>
                    {t('imageTools.rotateLeft90')}
                  </button>
                  <button onClick={rotateRight} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center">
                    {t('imageTools.rotateRight90')}
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" /></svg>
                  </button>
                </div>

                <button onClick={resetTransform} className="w-full py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-500 transition-colors">
                  {t('imageTools.resetTransform')}
                </button>
              </div>
            )}

            {imageSrc && (
              <div className="flex gap-4">
                <button onClick={apply} className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('imageTools.applyTransform')}
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
                <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    {t('imageTools.resultSize')}: {formatBytes(resultSize)}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.rotateHint')}</p>
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
