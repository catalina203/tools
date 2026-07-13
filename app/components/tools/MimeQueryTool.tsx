'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface MimeEntry {
  ext: string;
  mime: string;
  category: string;
  desc: string;
}

const mimeDatabase: MimeEntry[] = [
  { ext: 'pdf', mime: 'application/pdf', category: 'application', desc: 'PDF document' },
  { ext: 'json', mime: 'application/json', category: 'application', desc: 'JSON data' },
  { ext: 'xml', mime: 'application/xml', category: 'application', desc: 'XML document' },
  { ext: 'zip', mime: 'application/zip', category: 'application', desc: 'ZIP archive' },
  { ext: 'rar', mime: 'application/vnd.rar', category: 'application', desc: 'RAR archive' },
  { ext: '7z', mime: 'application/x-7z-compressed', category: 'application', desc: '7-Zip archive' },
  { ext: 'tar', mime: 'application/x-tar', category: 'application', desc: 'TAR archive' },
  { ext: 'gz', mime: 'application/gzip', category: 'application', desc: 'GZip archive' },
  { ext: 'bz2', mime: 'application/x-bzip2', category: 'application', desc: 'BZip2 archive' },
  { ext: 'xz', mime: 'application/x-xz', category: 'application', desc: 'XZ archive' },
  { ext: 'sql', mime: 'application/sql', category: 'application', desc: 'SQL file' },
  { ext: 'doc', mime: 'application/msword', category: 'application', desc: 'Word document' },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'application', desc: 'Word Open XML document' },
  { ext: 'xls', mime: 'application/vnd.ms-excel', category: 'application', desc: 'Excel spreadsheet' },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'application', desc: 'Excel Open XML spreadsheet' },
  { ext: 'ppt', mime: 'application/vnd.ms-powerpoint', category: 'application', desc: 'PowerPoint presentation' },
  { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'application', desc: 'PowerPoint Open XML presentation' },
  { ext: 'wasm', mime: 'application/wasm', category: 'application', desc: 'WebAssembly binary' },
  { ext: 'exe', mime: 'application/x-msdownload', category: 'application', desc: 'Windows executable' },
  { ext: 'dll', mime: 'application/x-msdownload', category: 'application', desc: 'Windows DLL' },
  { ext: 'msi', mime: 'application/x-msi', category: 'application', desc: 'Windows installer' },
  { ext: 'apk', mime: 'application/vnd.android.package-archive', category: 'application', desc: 'Android package' },
  { ext: 'deb', mime: 'application/vnd.debian.binary-package', category: 'application', desc: 'Debian package' },
  { ext: 'rpm', mime: 'application/x-rpm', category: 'application', desc: 'RPM package' },
  { ext: 'jar', mime: 'application/java-archive', category: 'application', desc: 'Java archive' },
  { ext: 'swf', mime: 'application/x-shockwave-flash', category: 'application', desc: 'Shockwave Flash' },
  { ext: 'psd', mime: 'application/vnd.adobe.photoshop', category: 'application', desc: 'Adobe Photoshop' },
  { ext: 'ai', mime: 'application/postscript', category: 'application', desc: 'Adobe Illustrator' },
  { ext: 'eps', mime: 'application/postscript', category: 'application', desc: 'Encapsulated PostScript' },
  { ext: 'iso', mime: 'application/x-iso9660-image', category: 'application', desc: 'ISO disk image' },
  { ext: 'bin', mime: 'application/octet-stream', category: 'application', desc: 'Binary data' },
  { ext: 'dmg', mime: 'application/x-apple-diskimage', category: 'application', desc: 'macOS disk image' },
  { ext: 'xul', mime: 'application/vnd.mozilla.xul+xml', category: 'application', desc: 'XUL document' },
  { ext: 'rtf', mime: 'application/rtf', category: 'application', desc: 'Rich Text Format' },
  { ext: 'gzip', mime: 'application/gzip', category: 'application', desc: 'GZip compressed' },
  { ext: 'woff', mime: 'application/font-woff', category: 'application', desc: 'Web Open Font Format' },
  { ext: 'woff2', mime: 'font/woff2', category: 'font', desc: 'WOFF2 font' },
  { ext: 'ttf', mime: 'font/ttf', category: 'font', desc: 'TrueType font' },
  { ext: 'otf', mime: 'font/otf', category: 'font', desc: 'OpenType font' },
  { ext: 'eot', mime: 'application/vnd.ms-fontobject', category: 'font', desc: 'Embedded OpenType font' },
  { ext: 'jpg', mime: 'image/jpeg', category: 'image', desc: 'JPEG image' },
  { ext: 'jpeg', mime: 'image/jpeg', category: 'image', desc: 'JPEG image' },
  { ext: 'png', mime: 'image/png', category: 'image', desc: 'PNG image' },
  { ext: 'gif', mime: 'image/gif', category: 'image', desc: 'GIF image' },
  { ext: 'webp', mime: 'image/webp', category: 'image', desc: 'WebP image' },
  { ext: 'svg', mime: 'image/svg+xml', category: 'image', desc: 'SVG vector image' },
  { ext: 'bmp', mime: 'image/bmp', category: 'image', desc: 'BMP image' },
  { ext: 'ico', mime: 'image/x-icon', category: 'image', desc: 'Icon file' },
  { ext: 'tiff', mime: 'image/tiff', category: 'image', desc: 'TIFF image' },
  { ext: 'tif', mime: 'image/tiff', category: 'image', desc: 'TIFF image' },
  { ext: 'avif', mime: 'image/avif', category: 'image', desc: 'AVIF image' },
  { ext: 'jxl', mime: 'image/jxl', category: 'image', desc: 'JPEG XL image' },
  { ext: 'heic', mime: 'image/heic', category: 'image', desc: 'HEIC image' },
  { ext: 'heif', mime: 'image/heif', category: 'image', desc: 'HEIF image' },
  { ext: 'raw', mime: 'image/x-raw', category: 'image', desc: 'Raw image data' },
  { ext: 'cr2', mime: 'image/x-canon-cr2', category: 'image', desc: 'Canon RAW image' },
  { ext: 'ps', mime: 'application/postscript', category: 'application', desc: 'PostScript file' },
  { ext: 'html', mime: 'text/html', category: 'text', desc: 'HTML document' },
  { ext: 'htm', mime: 'text/html', category: 'text', desc: 'HTML document' },
  { ext: 'css', mime: 'text/css', category: 'text', desc: 'CSS stylesheet' },
  { ext: 'js', mime: 'text/javascript', category: 'text', desc: 'JavaScript file' },
  { ext: 'jsx', mime: 'text/jsx', category: 'text', desc: 'JSX file' },
  { ext: 'ts', mime: 'text/typescript', category: 'text', desc: 'TypeScript file' },
  { ext: 'tsx', mime: 'text/typescript', category: 'text', desc: 'TSX file' },
  { ext: 'php', mime: 'text/x-php', category: 'text', desc: 'PHP script' },
  { ext: 'py', mime: 'text/x-python', category: 'text', desc: 'Python script' },
  { ext: 'rb', mime: 'text/x-ruby', category: 'text', desc: 'Ruby script' },
  { ext: 'java', mime: 'text/x-java', category: 'text', desc: 'Java source' },
  { ext: 'c', mime: 'text/x-c', category: 'text', desc: 'C source' },
  { ext: 'cpp', mime: 'text/x-c++', category: 'text', desc: 'C++ source' },
  { ext: 'h', mime: 'text/x-c', category: 'text', desc: 'C/C++ header' },
  { ext: 'sh', mime: 'text/x-shellscript', category: 'text', desc: 'Shell script' },
  { ext: 'bash', mime: 'text/x-shellscript', category: 'text', desc: 'Bash script' },
  { ext: 'md', mime: 'text/markdown', category: 'text', desc: 'Markdown document' },
  { ext: 'txt', mime: 'text/plain', category: 'text', desc: 'Plain text' },
  { ext: 'csv', mime: 'text/csv', category: 'text', desc: 'CSV file' },
  { ext: 'tsv', mime: 'text/tab-separated-values', category: 'text', desc: 'TSV file' },
  { ext: 'ini', mime: 'text/plain', category: 'text', desc: 'INI config file' },
  { ext: 'cfg', mime: 'text/plain', category: 'text', desc: 'Config file' },
  { ext: 'log', mime: 'text/plain', category: 'text', desc: 'Log file' },
  { ext: 'yaml', mime: 'text/yaml', category: 'text', desc: 'YAML document' },
  { ext: 'yml', mime: 'text/yaml', category: 'text', desc: 'YAML document' },
  { ext: 'toml', mime: 'text/toml', category: 'text', desc: 'TOML document' },
  { ext: 'go', mime: 'text/x-go', category: 'text', desc: 'Go source' },
  { ext: 'rs', mime: 'text/x-rust', category: 'text', desc: 'Rust source' },
  { ext: 'swift', mime: 'text/x-swift', category: 'text', desc: 'Swift source' },
  { ext: 'kt', mime: 'text/x-kotlin', category: 'text', desc: 'Kotlin source' },
  { ext: 'scala', mime: 'text/x-scala', category: 'text', desc: 'Scala source' },
  { ext: 'dart', mime: 'text/x-dart', category: 'text', desc: 'Dart source' },
  { ext: 'lua', mime: 'text/x-lua', category: 'text', desc: 'Lua script' },
  { ext: 'pl', mime: 'text/x-perl', category: 'text', desc: 'Perl script' },
  { ext: 'r', mime: 'text/x-r', category: 'text', desc: 'R script' },
  { ext: 'sql', mime: 'application/sql', category: 'application', desc: 'SQL file' },
  { ext: 'mp4', mime: 'video/mp4', category: 'video', desc: 'MP4 video' },
  { ext: 'webm', mime: 'video/webm', category: 'video', desc: 'WebM video' },
  { ext: 'avi', mime: 'video/x-msvideo', category: 'video', desc: 'AVI video' },
  { ext: 'mkv', mime: 'video/x-matroska', category: 'video', desc: 'Matroska video' },
  { ext: 'mov', mime: 'video/quicktime', category: 'video', desc: 'QuickTime video' },
  { ext: 'wmv', mime: 'video/x-ms-wmv', category: 'video', desc: 'Windows Media Video' },
  { ext: 'flv', mime: 'video/x-flv', category: 'video', desc: 'Flash video' },
  { ext: 'mpg', mime: 'video/mpeg', category: 'video', desc: 'MPEG video' },
  { ext: 'mpeg', mime: 'video/mpeg', category: 'video', desc: 'MPEG video' },
  { ext: 'ts', mime: 'video/mp2t', category: 'video', desc: 'MPEG transport stream' },
  { ext: 'm4v', mime: 'video/x-m4v', category: 'video', desc: 'M4V video' },
  { ext: '3gp', mime: 'video/3gpp', category: 'video', desc: '3GPP video' },
  { ext: '3g2', mime: 'video/3gpp2', category: 'video', desc: '3GPP2 video' },
  { ext: 'ogv', mime: 'video/ogg', category: 'video', desc: 'Ogg video' },
  { ext: 'mp3', mime: 'audio/mpeg', category: 'audio', desc: 'MP3 audio' },
  { ext: 'wav', mime: 'audio/wav', category: 'audio', desc: 'WAV audio' },
  { ext: 'ogg', mime: 'audio/ogg', category: 'audio', desc: 'Ogg audio' },
  { ext: 'aac', mime: 'audio/aac', category: 'audio', desc: 'AAC audio' },
  { ext: 'flac', mime: 'audio/flac', category: 'audio', desc: 'FLAC audio' },
  { ext: 'wma', mime: 'audio/x-ms-wma', category: 'audio', desc: 'Windows Media Audio' },
  { ext: 'm4a', mime: 'audio/mp4', category: 'audio', desc: 'M4A audio' },
  { ext: 'opus', mime: 'audio/opus', category: 'audio', desc: 'Opus audio' },
  { ext: 'midi', mime: 'audio/midi', category: 'audio', desc: 'MIDI audio' },
  { ext: 'mid', mime: 'audio/midi', category: 'audio', desc: 'MIDI audio' },
  { ext: 'amr', mime: 'audio/amr', category: 'audio', desc: 'AMR audio' },
  { ext: 'aiff', mime: 'audio/aiff', category: 'audio', desc: 'AIFF audio' },
  { ext: 'weba', mime: 'audio/webm', category: 'audio', desc: 'WebM audio' },
  { ext: 'eml', mime: 'message/rfc822', category: 'message', desc: 'Email message' },
  { ext: 'mht', mime: 'message/rfc822', category: 'message', desc: 'MHTML web archive' },
  { ext: 'mhtml', mime: 'message/rfc822', category: 'message', desc: 'MHTML web archive' },
  { ext: 'msg', mime: 'application/vnd.ms-outlook', category: 'application', desc: 'Outlook message' },
  { ext: 'gltf', mime: 'model/gltf+json', category: 'model', desc: 'GLTF 3D model' },
  { ext: 'glb', mime: 'model/gltf-binary', category: 'model', desc: 'GLB 3D model' },
  { ext: 'obj', mime: 'model/obj', category: 'model', desc: 'OBJ 3D model' },
  { ext: 'stl', mime: 'model/stl', category: 'model', desc: 'STL 3D model' },
  { ext: 'step', mime: 'model/step', category: 'model', desc: 'STEP 3D model' },
  { ext: 'stp', mime: 'model/step', category: 'model', desc: 'STEP 3D model' },
  { ext: 'iges', mime: 'model/iges', category: 'model', desc: 'IGES 3D model' },
  { ext: 'igs', mime: 'model/iges', category: 'model', desc: 'IGES 3D model' },
];

const categories = ['application', 'image', 'text', 'video', 'audio', 'font', 'message', 'model'] as const;

function detectMode(input: string): 'extension' | 'mime' {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return 'extension';
  if (trimmed.includes('/')) return 'mime';
  const hasDot = trimmed.startsWith('.');
  if (hasDot) return 'extension';
  return 'extension';
}

export default function MimeQueryTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mode = detectMode(query);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\./, '');
    let results = mimeDatabase;

    if (category !== 'all') {
      results = results.filter(e => e.category === category);
    }

    if (!q) return results;

    if (mode === 'mime') {
      return results.filter(e => e.mime.includes(q));
    }

    return results.filter(e => e.ext.includes(q) || e.mime.includes(q) || e.desc.toLowerCase().includes(q));
  }, [query, category, mode]);

  const uniqueResults = useMemo(() => {
    const seen = new Set<string>();
    return filtered.filter(e => {
      const key = `${e.ext}|${e.mime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filtered]);

  const copyMime = async (mime: string, index: number) => {
    try {
      await navigator.clipboard.writeText(mime);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.mimeQuery')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.mimeQuery')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.mimeQueryDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.searchMime')}</h3>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('devTools.mimeSearchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {query && (
                  <span className="inline-flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${mode === 'extension' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      {mode === 'extension' ? t('devTools.extension') : t('devTools.mimeType')}
                    </span>
                    {t('devTools.results')}: {uniqueResults.length}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.category')}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setCategory('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${category === 'all' ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50'}`}
                >
                  {t('devTools.all')}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${category === cat ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/50'}`}
                  >
                    {t(`devTools.${cat}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {uniqueResults.length === 0 ? (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">{t('devTools.noResults')}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">{t('devTools.tryAlternative')}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{uniqueResults.length}</span> {t('devTools.results')}
                  </div>
                </div>
                <div className="space-y-2">
                  {uniqueResults.map((entry, i) => (
                    <div key={`${entry.ext}-${entry.mime}-${i}`} className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-5 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-3 min-w-[100px]">
                          <span className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg font-mono text-sm font-bold text-purple-600 dark:text-purple-400">.{entry.ext}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono text-gray-900 dark:text-white break-all">{entry.mime}</code>
                            <button
                              onClick={() => copyMime(entry.mime, i)}
                              className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
                              title={t('devTools.copy')}
                            >
                              {copiedIndex === i ? (
                                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                            ${entry.category === 'application' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''}
                            ${entry.category === 'image' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : ''}
                            ${entry.category === 'text' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : ''}
                            ${entry.category === 'video' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}
                            ${entry.category === 'audio' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' : ''}
                            ${entry.category === 'font' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''}
                            ${entry.category === 'message' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : ''}
                            ${entry.category === 'model' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : ''}
                          `}>{t(`devTools.${entry.category}`)}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">{entry.desc}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
