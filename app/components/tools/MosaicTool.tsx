'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type GridLayout = '1x2' | '2x1' | '2x2' | '3x2' | '2x3';

const layoutMap: Record<GridLayout, { cols: number; rows: number; label: string }> = {
  '1x2': { cols: 2, rows: 1, label: '1×2' },
  '2x1': { cols: 1, rows: 2, label: '2×1' },
  '2x2': { cols: 2, rows: 2, label: '2×2' },
  '3x2': { cols: 2, rows: 3, label: '3×2' },
  '2x3': { cols: 3, rows: 2, label: '2×3' },
};

export default function MosaicTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [images, setImages] = useState<{ src: string; name: string }[]>([]);
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const [gap, setGap] = useState(4);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) return;

    const existing = [...images];
    Promise.all(
      valid.map(
        (file) =>
          new Promise<{ src: string; name: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ src: ev.target?.result as string, name: file.name });
            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      setImages([...existing, ...newImages].slice(0, 6));
      setResultUrl(null);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  };

  const apply = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cols, rows } = layoutMap[layout];
    const maxCells = cols * rows;
    const used = images.slice(0, maxCells);

    const totalW = 1200;
    const totalH = 1200;
    const cellW = (totalW - gap * (cols - 1)) / cols;
    const cellH = (totalH - gap * (rows - 1)) / rows;

    canvas.width = totalW;
    canvas.height = totalH;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, totalW, totalH);

    let loaded = 0;
    used.forEach((imgData, idx) => {
      const img = new Image();
      img.onload = () => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * (cellW + gap);
        const y = row * (cellH + gap);

        const scale = Math.max(cellW / img.naturalWidth, cellH / img.naturalHeight);
        const sw = img.naturalWidth * scale;
        const sh = img.naturalHeight * scale;
        const sx = x - (sw - cellW) / 2;
        const sy = y - (sh - cellH) / 2;

        ctx.drawImage(img, sx, sy, sw, sh);

        loaded++;
        if (loaded === used.length) {
          canvas.toBlob((blob) => {
            if (blob) {
              setResultUrl(URL.createObjectURL(blob));
              setResultSize(blob.size);
            }
          }, 'image/png');
        }
      };
      img.src = imgData.src;
    });
  }, [images, layout, gap]);

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'mosaic.png';
    a.click();
  };

  const reset = () => {
    setImages([]);
    setResultUrl(null);
    setResultSize(0);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const layouts: GridLayout[] = ['1x2', '2x1', '2x2', '3x2', '2x3'];
  const maxCells = layoutMap[layout].cols * layoutMap[layout].rows;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.mosaic')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.mosaic')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.mosaicDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.mosaicImages')}</h3>
                {images.length > 0 && (
                  <span className="text-sm text-gray-500">{images.length}/{maxCells}</span>
                )}
              </div>

              {images.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{t('imageTools.mosaicUploadHint')}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">{t('imageTools.mosaicMinHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.chooseImages')}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                  </label>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative group aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                        <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                          ✕
                        </button>
                      </div>
                    ))}
                    {images.length < maxCells && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                      </label>
                    )}
                  </div>
                  <label className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.addMore')}
                    <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {images.length >= 2 && (
              <>
                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('imageTools.mosaicLayout')}</label>
                    <div className="flex flex-wrap gap-2">
                      {layouts.map((l) => (
                        <button key={l} onClick={() => setLayout(l)} className={`px-4 py-2 text-sm rounded-lg font-medium transition-all border ${layout === l ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50'}`}>
                          {layoutMap[l].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageTools.mosaicGap')}</label>
                      <span className="text-sm font-mono font-bold text-purple-500">{gap}px</span>
                    </div>
                    <input type="range" min={0} max={20} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={apply} className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('imageTools.applyMosaic')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('imageTools.reselect')}
                  </button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('imageTools.mosaicHint')}</p>
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
