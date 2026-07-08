'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import ThemeToggle from '@/app/components/ThemeToggle';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import SearchBar from '@/app/components/SearchBar';
import { useFavoriteTools } from '@/app/context/FavoriteToolsContext';
import { allTools } from '@/src/data/tools';

export default function Home() {
  const [query, setQuery] = useState('');
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const tt = useTranslations('tools');
  const { favorites } = useFavoriteTools();

  // 从allTools中获取用户选择的常用工具
  const favoriteTools = favorites
    .map(key => {
      const tool = allTools.find(t => t.key === key);
      if (!tool) return null;
      // 确定工具分类
      let category = '';
      if (['crop', 'resize', 'rotate', 'brightness', 'contrast', 'saturation', 'hue', 'grayscale', 'vintage', 'blur', 'sharpen', 'watermark', 'formatConvert', 'compress', 'mosaic', 'grid', 'rounded', 'colorExtract', 'eyedropper', 'exif', 'base64', 'compare', 'bgRemove', 'toPdf'].includes(key)) {
        category = 'image';
      } else if (['jsonFormat', 'xmlFormat', 'yamlToJson', 'csvToJson', 'markdown', 'wordCount', 'dedup', 'caseConvert', 'traditionalSimplified', 'regexTest', 'urlEncode', 'md5', 'sha', 'uuid', 'password', 'lorem', 'escape', 'sqlFormat', 'diff'].includes(key)) {
        category = 'text';
      } else if (['colorPicker', 'gradient', 'shadow', 'flexbox', 'radix', 'timestamp', 'unitConvert', 'dateCalc', 'emailValidate', 'jsonVisual', 'colorConvert', 'regexVisual', 'mimeQuery'].includes(key)) {
        category = 'dev';
      } else if (['qrcode', 'barcode', 'calculator', 'scientificCalc', 'notepad', 'stickyNote', 'countdown', 'stopwatch', 'pomodoro', 'worldClock', 'timezone', 'passwordStrength', 'randomNum', 'radixCalc'].includes(key)) {
        category = 'efficiency';
      } else if (['imageConvert', 'zip', 'unzip', 'preview', 'fileHash', 'editor'].includes(key)) {
        category = 'file';
      } else if (['csvEditor', 'jsonEditor', 'chart', 'statistics'].includes(key)) {
        category = 'data';
      } else if (['colorScheme', 'fontPreview', 'gridGenerator', 'contrastCheck', 'responsiveTest', 'cssVariable'].includes(key)) {
        category = 'design';
      }
      return {
        nameKey: key,
        icon: tool.icon,
        category,
        descriptionKey: key + 'Desc',
        gradient: tool.gradient
      };
    })
    .filter(Boolean);

  const categories = [
    { nameKey: 'image', icon: '🖼️', count: 24, gradient: 'from-pink-500 to-rose-500' },
    { nameKey: 'text', icon: '📝', count: 20, gradient: 'from-emerald-500 to-teal-500' },
    { nameKey: 'dev', icon: '🛠️', count: 14, gradient: 'from-blue-500 to-cyan-500' },
    { nameKey: 'efficiency', icon: '⚡', count: 14, gradient: 'from-amber-500 to-orange-500' },
    { nameKey: 'file', icon: '📁', count: 6, gradient: 'from-violet-500 to-purple-500' },
    { nameKey: 'data', icon: '📊', count: 4, gradient: 'from-indigo-500 to-blue-500' },
    { nameKey: 'design', icon: '🎨', count: 6, gradient: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] relative overflow-hidden transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-xl">⚡</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {tc('appName')}
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-900 dark:text-white font-medium">
            {tc('home')}
          </Link>
          <Link href="/tools" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            {tc('tools')}
          </Link>
          <Link href="/about" className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            {tc('about')}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-full border border-violet-500/30 mb-6">
            <span className="text-violet-600 dark:text-violet-300 text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t('title1')}
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 dark:from-violet-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {t('title2')}
            </span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed">
            {t('description')}
          </p>

          <SearchBar query={query} setQuery={setQuery} />
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {t('categories')}
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{t('categoriesDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((category, index) => (
              <Link
                key={index}
                href="/tools"
                className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {tt(`categories.${category.nameKey}` as any)}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{category.count}个工具</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {t('myFavorites')}
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{t('myFavoritesDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTools.length > 0 ? (
              favoriteTools.map((tool, index) => {
                if (!tool) return null;
                return (
                  <Link
                    key={index}
                    href={`/tools/${tool.nameKey}`}
                    className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden block"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl">{tool.icon}</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {tt(`${tool.category}Tools.${tool.nameKey}` as any)}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {tt(`categories.${tool.category}` as any)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        {tt(`${tool.category}Tools.${tool.descriptionKey}` as any)}
                      </p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('noFavorites')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {t('noFavoritesDesc')}
                </p>
                <Link
                  href="/tools"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
                >
                  {t('addFavorites')}
                  <span className="ml-2">→</span>
                </Link>
              </div>
            )}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/tools"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50"
            >
              {tc('viewAllTools')}
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('feature1Title')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('feature1Desc')}</p>
            </div>
          </div>
          <div className="relative group bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('feature2Title')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('feature2Desc')}</p>
            </div>
          </div>
          <div className="relative group bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('feature3Title')}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-gray-200 dark:border-white/5 mt-24 bg-gray-50/80 dark:bg-[#0a0a1a]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white">⚡</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                {tc('appName')}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {tc('copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}