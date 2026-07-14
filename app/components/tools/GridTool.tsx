'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type SliceData = { dataUrl: string; index: number; size: number };

export default function GridTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [slices, setSlices] = useState<SliceData[]>([]);
  const [slicing, setSlicing] = useState(false);
  const [gap, setGap] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const sliceCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setFileName(file.name);
    setSlices([]);
    const reader = new FileReader();
    reader.onload = (ev) => setImageSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sliceImage = useCallback(() => {
    if (!imgRef.current || !sliceCanvasRef.current) return;
    const img = imgRef.current;
    const canvas = sliceCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setSlicing(true);
    setSlices([]);

    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const cw = Math.floor(w / 3);
    const ch = Math.floor(h / 3);
    const result: SliceData[] = [];

    let completed = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cw + (col > 0 ? gap : 0);
        const y = row * ch + (row > 0 ? gap : 0);
        const sw = col === 2 ? w - x : cw;
        const sh = row === 2 ? h - y : ch;

        canvas.width = sw;
        canvas.height = sh;
        ctx.clearRect(0, 0, sw, sh);
        ctx.drawImage(img, x, y, sw, sh, 0, 0, sw, sh);

        canvas.toBlob((blob) => {
          if (blob) {
            result.push({ dataUrl: URL.createObjectURL(blob), index: row * 3 + col + 1, size: blob.size });
          }
          completed++;
          if (completed === 9) {
            result.sort((a, b) => a.index - b.index);
            setSlices(result);
            setSlicing(false);
          }
        }, 'image/png');
      }
    }
  }, [gap]);

  const downloadSlice = (dataUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    const base = fileName.replace(/\.[^.]+$/, '');
    a.download = `${base}_slice${index}.png`;
    a.click();
  };

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const base = fileName.replace(/\.[^.]+$/, '');

    for (const slice of slices) {
      const response = await fetch(slice.dataUrl);
      const blob = await response.blob();
      zip.file(`${base}_slice${slice.index}.png`, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${base}_grid.zip`;
    a.click();
  };

  const reset = () => {
    setImageSrc(null);
    setSlices([]);
    setFileName('');
    setGap(0);
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
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.grid')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.grid')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.gridDesc')}</p>
        </div>

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
                <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-fuchsia-500/30 cursor-pointer">
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
                  <div className="relative">
                    <img ref={imgRef} src={imageSrc} alt="source" className="max-w-full max-h-[340px] rounded-lg" />
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/30" />
                      ))}
                    </div>
                  </div>
                </div>
                <canvas ref={sliceCanvasRef} className="hidden" />
              </div>
            )}
          </div>

          {imageSrc && (
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('imageTools.gridGap')}</label>
                <span className="text-sm font-mono font-bold text-fuchsia-500">{gap}px</span>
              </div>
              <input type="range" min={0} max={10} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-fuchsia-500" />
            </div>
          )}

          {imageSrc && (
            <div className="flex gap-4">
              <button onClick={sliceImage} disabled={slicing} className="flex-1 py-3.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-fuchsia-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {slicing ? t('imageTools.processing') : t('imageTools.applyGrid')}
              </button>
              <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {t('imageTools.reselect')}
              </button>
            </div>
          )}

          {slices.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.gridResults')}</h3>
                <button onClick={downloadAll} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/30 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('imageTools.downloadAll')}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {slices.map((slice) => (
                  <div key={slice.index} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                      <img src={slice.dataUrl} alt={`slice ${slice.index}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">#{slice.index} {formatBytes(slice.size)}</span>
                      <button onClick={() => downloadSlice(slice.dataUrl, slice.index)} className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        {t('imageTools.download')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
