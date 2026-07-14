'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type PickedColor = { hex: string; rgb: string; x: number; y: number };

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

export default function EyedropperTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedColors, setPickedColors] = useState<PickedColor[]>([]);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState('');

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setPickedColors([]);
    const reader = new FileReader();
    reader.onload = (ev) => setImageSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const getColorAt = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current || !imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.round(clientX - rect.left);
    const y = Math.round(clientY - rect.top);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const w = imgRef.current.naturalWidth;
    const h = imgRef.current.naturalHeight;
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    const imgX = Math.round(x * scaleX);
    const imgY = Math.round(y * scaleY);

    if (imgX < 0 || imgX >= w || imgY < 0 || imgY >= h) return null;

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(imgRef.current, 0, 0, w, h);
    const pixel = ctx.getImageData(imgX, imgY, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    return { hex, rgb, x: imgX, y: imgY };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setHoverPos({ x, y });

    const color = getColorAt(e.clientX, e.clientY);
    if (color) setHoverColor(color.hex);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const color = getColorAt(e.clientX, e.clientY);
    if (color) {
      setPickedColors((prev) => [...prev, color]);
    }
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex).then(() => {
      setCopied(hex);
      setTimeout(() => setCopied(''), 1500);
    });
  };

  const removeColor = (index: number) => {
    setPickedColors((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setPickedColors([]);
  };

  const reset = () => {
    setImageSrc(null);
    setPickedColors([]);
    setHoverColor(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.eyedropper')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.eyedropper')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.eyedropperDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              {!imageSrc ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('imageTools.uploadImage')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('imageTools.supportFormat')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.chooseImage')}
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div ref={containerRef} className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[360px] cursor-crosshair" onMouseMove={handleMouseMove} onClick={handleClick}>
                    <img ref={imgRef} src={imageSrc} alt="source" className="max-w-full max-h-[340px] rounded-lg select-none" draggable={false} />
                    {hoverColor && (
                      <div className="absolute pointer-events-none" style={{ left: hoverPos.x + 15, top: hoverPos.y - 40 }}>
                        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg px-2 py-1 flex items-center gap-2 border border-gray-200 dark:border-white/10">
                          <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: hoverColor }} />
                          <span className="font-mono text-xs text-gray-900 dark:text-white">{hoverColor}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 pb-3 text-center text-xs text-gray-500 dark:text-gray-400">
                    {t('imageTools.eyedropperHint')}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
            </div>

            {imageSrc && (
              <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {t('imageTools.reselect')}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.pickedColors')}</h3>
                {pickedColors.length > 0 && (
                  <button onClick={clearAll} className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('imageTools.clearAll')}
                  </button>
                )}
              </div>
              {pickedColors.length > 0 ? (
                <div className="space-y-2">
                  {pickedColors.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 group">
                      <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-white/10 flex-shrink-0" style={{ backgroundColor: c.hex }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{c.hex}</div>
                        <div className="text-xs text-gray-500">{c.rgb}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => copyColor(c.hex)} className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors" title={t('imageTools.clickToCopy')}>
                          {copied === c.hex ? t('imageTools.copied') : t('imageTools.clickToCopy')}
                        </button>
                        <button onClick={() => removeColor(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.eyedropperPickHint')}</p>
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
