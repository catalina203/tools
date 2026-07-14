'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type ImageItem = { dataUrl: string; name: string; width: number; height: number };

function generatePdf(images: ImageItem[]): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const loaded: ImageItem[] = [];
    let loadedCount = 0;

    images.forEach((item, idx) => {
      const img = new Image();
      img.onload = () => {
        loaded.push({ ...item, width: img.naturalWidth, height: img.naturalHeight });
        loadedCount++;
        if (loadedCount === images.length) {
          resolve(buildPdf(loaded));
        }
      };
      img.src = item.dataUrl;
    });
  });
}

function buildPdf(images: ImageItem[]): Blob {
  const objects: string[] = [];
  const streams: Uint8Array[] = [];
  const pageObjects: number[] = [];
  let objNum = 1;

  const addObj = (content: string) => {
    objects.push(`${objNum} 0 obj\n${content}\nendobj`);
    return objNum++;
  };

  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesRef = objNum;

  const pageRefs: number[] = [];
  images.forEach((img) => {
    const a4w = 595.28;
    const a4h = 841.89;
    const scale = Math.min(a4w / img.width, a4h / img.height) * 0.95;
    const pw = img.width * scale;
    const ph = img.height * scale;
    const ox = (a4w - pw) / 2;
    const oy = (a4h - ph) / 2;

    const imgObj = addObj(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.dataUrl.length} >>\nstream\n${img.dataUrl}\nendstream`);

    const streamContent = `q\n${pw} 0 0 ${ph} ${ox} ${oy} cm\n/Im${imgObj} Do\nQ`;
    const streamObj = addObj(`<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`);

    const pageObj = addObj(`<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${a4w} ${a4h}] /Contents ${streamObj} 0 R /Resources << /XObject << /Im${imgObj} ${imgObj} 0 R >> >> >>`);
    pageRefs.push(pageObj);
  });

  addObj(`<< /Type /Pages /Kids [${pageRefs.map((r) => `${r} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`);

  const xrefOffset = objects.join('\n').length + 1;
  const xref = `xref\n0 ${objNum}\n0000000000 65535 f \n${objects.map((_, i) => {
    let offset = 0;
    for (let j = 0; j < i; j++) {
      offset += objects[j].length + 1;
    }
    return String(offset).padStart(10, '0') + ' 00000 n \n';
  }).join('')}`;

  const trailer = `trailer\n<< /Size ${objNum} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfStr = objects.join('\n') + '\n' + xref + trailer;
  return new Blob([pdfStr], { type: 'application/pdf' });
}

export default function ToPdfTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [images, setImages] = useState<ImageItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newImages: ImageItem[] = [];
    let loaded = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        loaded++;
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
          newImages.push({ dataUrl, name: file.name, width: img.naturalWidth, height: img.naturalHeight });
          loaded++;
          if (loaded === files.length) {
            setImages((prev) => [...prev, ...newImages]);
            setPdfUrl(null);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPdfUrl(null);
  };

  const moveImage = (index: number, dir: number) => {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
    setPdfUrl(null);
  };

  const generate = useCallback(async () => {
    if (images.length === 0) return;
    setGenerating(true);
    try {
      const blob = await generatePdf(images);
      setPdfUrl(URL.createObjectURL(blob));
    } finally {
      setGenerating(false);
    }
  }, [images]);

  const download = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'images.pdf';
    a.click();
  };

  const reset = () => {
    setImages([]);
    setPdfUrl(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.toPdf')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('imageTools.toPdf')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('imageTools.toPdfDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {images.length === 0 ? (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('imageTools.pdfUpload')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{t('imageTools.pdfUploadHint')}</p>
                  <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 cursor-pointer">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('imageTools.pdfSelectImages')}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('imageTools.pdfImages')} ({images.length})</h3>
                    <div className="flex gap-2">
                      <label className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-red-300 dark:hover:border-red-500/50 cursor-pointer transition-all">
                        {t('imageTools.addMore')}
                        <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
                        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800">
                          <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <div className="text-xs text-gray-500 truncate">{img.name}</div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {i > 0 && (
                            <button onClick={() => moveImage(i, -1)} className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                          )}
                          {i < images.length - 1 && (
                            <button onClick={() => moveImage(i, 1)} className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                          )}
                          <button onClick={() => removeImage(i)} className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg text-red-500 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={generate} disabled={generating || images.length === 0} className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {generating ? t('imageTools.processing') : t('imageTools.pdfGenerate')}
                  </button>
                  <button onClick={reset} className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    {t('imageTools.reselect')}
                  </button>
                </div>

                {pdfUrl && (
                  <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium mb-4">{t('imageTools.pdfReady')}</p>
                    <button onClick={download} className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {t('imageTools.downloadPdf')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('imageTools.pdfInfo')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-500">{t('imageTools.pdfPageCount')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{images.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10">
                  <span className="text-gray-500">{t('imageTools.pdfPageSize')}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{pageSize.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">{t('imageTools.pdfOrientation')}</span>
                  <span className="text-gray-900 dark:text-white font-medium capitalize">{orientation}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('imageTools.pdfTip')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t('imageTools.pdfTipDesc')}</p>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
