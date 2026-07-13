'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type DevicePreset = {
  name: string;
  width: number;
  height: number;
};

const devicePresets: DevicePreset[] = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1280, height: 800 },
  { name: 'Desktop HD', width: 1920, height: 1080 },
];

type ViewMode = 1 | 2 | 4;
type InputMode = 'url' | 'html';
type Orientation = 'portrait' | 'landscape';
type ZoomLevel = 50 | 75 | 100;

interface DeviceFrameProps {
  preset: DevicePreset;
  orientation: Orientation;
  zoom: ZoomLevel;
  inputMode: InputMode;
  url: string;
  htmlContent: string;
  iframeKey: number;
  onReload: () => void;
  onError: (msg: string) => void;
}

function DeviceFrame({ preset, orientation, zoom, inputMode, url, htmlContent, iframeKey, onReload, onError }: DeviceFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const displayWidth = orientation === 'landscape' ? preset.height : preset.width;
  const displayHeight = orientation === 'landscape' ? preset.width : preset.height;
  const scaledW = (displayWidth * zoom) / 100;
  const scaledH = (displayHeight * zoom) / 100;

  const handleIframeLoad = useCallback(() => {
    setLoaded(true);
    setIframeError(false);
    try {
      const doc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      if (doc) {
        const bodyText = doc.body?.innerText || '';
        if (!bodyText.trim() && inputMode === 'url') {
          setIframeError(true);
          onError('X-Frame-Options');
        }
      }
    } catch {
      setIframeError(true);
      onError('X-Frame-Options');
    }
  }, [inputMode, onError]);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
    onError('X-Frame-Options');
  }, [onError]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-white">{preset.name}</span>
        <span>{displayWidth}&times;{displayHeight}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">({zoom}%)</span>
      </div>
      <div
        className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg transition-all duration-300"
        style={{ width: Math.min(scaledW, 600), height: Math.min(scaledH, 800) }}
      >
        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10 p-6">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">X-Frame-Options</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">try HTML mode or a different URL</p>
            </div>
          </div>
        )}
        {!loaded && !iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading...
            </div>
          </div>
        )}
        {inputMode === 'url' && url ? (
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={url}
            title={preset.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="w-full h-full border-0"
            style={{ zoom: zoom / 100 }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : inputMode === 'html' && htmlContent ? (
          <iframe
            ref={iframeRef}
            key={iframeKey}
            srcDoc={htmlContent}
            title={preset.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="w-full h-full border-0"
            style={{ zoom: zoom / 100 }}
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600 text-sm">
            enter URL or HTML
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResponsiveTestTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<DevicePreset>(devicePresets[2]);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [viewMode, setViewMode] = useState<ViewMode>(1);
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [reloadCount, setReloadCount] = useState(0);

  const activePresets = useCustom
    ? [{ name: 'Custom', width: Number(customWidth) || 375, height: Number(customHeight) || 667 }]
    : [selectedPreset];

  const getDisplayFrames = (): Array<{ preset: DevicePreset; index: number }> => {
    const presets = useCustom ? activePresets : devicePresets;
    if (viewMode === 1) return [{ preset: presets[0], index: 0 }];
    if (viewMode === 2) return [
      { preset: presets[0] || devicePresets[0], index: 0 },
      { preset: presets[1] || devicePresets[3], index: 1 },
    ];
    return [
      { preset: presets[0] || devicePresets[0], index: 0 },
      { preset: presets[1] || devicePresets[1], index: 1 },
      { preset: presets[2] || devicePresets[2], index: 2 },
      { preset: presets[3] || devicePresets[3], index: 3 },
    ];
  };

  const frames = getDisplayFrames();

  const handleRotate = useCallback(() => {
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  }, []);

  const handleReload = useCallback(() => {
    setIframeKey((prev) => prev + 1);
    setReloadCount((prev) => prev + 1);
    setErrorMsg('');
  }, []);

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setErrorMsg('');
  }, []);

  const handleHtmlChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    setErrorMsg('');
  }, []);

  const handleErrorMessage = useCallback((msg: string) => {
    setErrorMsg(msg);
  }, []);

  const presetsToShow = useCustom ? activePresets : devicePresets;
  const gridCols = viewMode === 1 ? 'grid-cols-1' : viewMode === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.responsiveTest')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.responsiveTest')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.responsiveTestDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setInputMode('url')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${inputMode === 'url' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('devTools.loadUrl')}
                </button>
                <button
                  onClick={() => setInputMode('html')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${inputMode === 'html' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  {t('devTools.customHtml')}
                </button>
              </div>

              {errorMsg && (
                <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>
                  {errorMsg}
                </span>
              )}
            </div>

            {inputMode === 'url' ? (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder={t('devTools.urlPlaceholder')}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  onClick={handleReload}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-1.5"
                  title={t('devTools.reload')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {t('devTools.reload')}
                </button>
              </div>
            ) : (
              <textarea
                value={htmlContent}
                onChange={handleHtmlChange}
                placeholder={t('devTools.htmlPlaceholder')}
                rows={5}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono text-sm"
                spellCheck={false}
              />
            )}

            {inputMode === 'url' && url && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('devTools.preview')}
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.devicePresets')}</span>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustom}
                    onChange={(e) => setUseCustom(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  {t('devTools.customSize')}
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {!useCustom && devicePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSelectedPreset(preset)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-300 ${
                      selectedPreset.name === preset.name
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-500/50'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
                {useCustom && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('devTools.width')}</span>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-20 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min={100}
                        max={3840}
                        placeholder="375"
                      />
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-xs">&times;</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t('devTools.height')}</span>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-20 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min={100}
                        max={3840}
                        placeholder="667"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.orientation')}</span>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${orientation === 'portrait' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {t('devTools.portrait')}
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${orientation === 'landscape' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    {t('devTools.landscape')}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.zoom')}</span>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg p-0.5">
                  {([50, 75, 100] as ZoomLevel[]).map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoom(z)}
                      className={`px-3 py-1 text-xs rounded-md transition-all duration-300 ${zoom === z ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {z}%
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRotate}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 flex items-center gap-1"
                title={t('devTools.rotate')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {t('devTools.rotate')}
              </button>

              <button
                onClick={handleReload}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300 flex items-center gap-1"
                title={t('devTools.reload')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {t('devTools.reload')}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.preview')}</span>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg p-0.5">
                  {([1, 2, 4] as ViewMode[]).map((vm) => (
                    <button
                      key={vm}
                      onClick={() => setViewMode(vm)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 ${viewMode === vm ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      {t(vm === 1 ? 'devTools.singleView' : vm === 2 ? 'devTools.dualView' : 'devTools.quadView')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`grid ${gridCols} gap-6`}>
            {frames.map((frame, i) => {
              const p = useCustom
                ? { name: 'Custom', width: Number(customWidth) || 375, height: Number(customHeight) || 667 }
                : frame.preset;
              return (
                <DeviceFrame
                  key={`${frame.index}-${reloadCount}`}
                  preset={p}
                  orientation={orientation}
                  zoom={zoom}
                  inputMode={inputMode}
                  url={url}
                  htmlContent={htmlContent}
                  iframeKey={iframeKey + i}
                  onReload={handleReload}
                  onError={handleErrorMessage}
                />
              );
            })}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
