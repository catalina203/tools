'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { allTools, ToolItem } from '@/src/data/tools';
import { Link } from '@/src/i18n/navigation';
import { useFavoriteTools } from '@/app/context/FavoriteToolsContext';

type SearchResult = {
  tool: ToolItem;
  category: string;
};

export default function SearchResults({
  query 
}: {
  query: string;
}) {
  const t = useTranslations('tools');
  const { toggleFavorite, isFavorite } = useFavoriteTools();
  
  // Define category mapping for tools
  const toolCategoryMap: Record<string, string> = {
    // Image tools (24)
    'crop': 'image', 'resize': 'image', 'rotate': 'image', 'brightness': 'image',
    'contrast': 'image', 'saturation': 'image', 'hue': 'image', 'grayscale': 'image',
    'vintage': 'image', 'blur': 'image', 'sharpen': 'image', 'watermark': 'image',
    'formatConvert': 'image', 'compress': 'image', 'mosaic': 'image', 'grid': 'image',
    'rounded': 'image', 'colorExtract': 'image', 'eyedropper': 'image', 'exif': 'image',
    'base64': 'image', 'compare': 'image', 'bgRemove': 'image', 'toPdf': 'image',
    // Text tools (18)
    'markdown': 'text', 'markdownToHtml': 'text', 'wordCount': 'text',
    'textClean': 'text', 'whitespace': 'text', 'dedup': 'text',
    'caseConvert': 'text', 'traditionalSimplified': 'text', 'escape': 'text', 'textReverse': 'text',
    'lineSort': 'text', 'lineNumber': 'text', 'trimText': 'text',
    'mergeLines': 'text', 'splitText': 'text', 'extractInfo': 'text',
    'lorem': 'text', 'diff': 'text',
    // Dev tools (32)
    'jsonFormat': 'dev', 'xmlFormat': 'dev', 'sqlFormat': 'dev', 'colorConvert': 'dev',
    'yamlToJson': 'dev', 'csvToJson': 'dev', 'urlEncode': 'dev', 'base64Text': 'dev',
    'md5': 'dev', 'sha': 'dev', 'uuid': 'dev', 'password': 'dev', 'emailValidate': 'dev',
    'regexTest': 'dev', 'regexVisual': 'dev', 'jsonVisual': 'dev',
    'colorPicker': 'dev', 'gradient': 'dev', 'shadow': 'dev',
    'flexbox': 'dev', 'gridLayout': 'dev', 'gridGenerator': 'dev', 'cssVariable': 'dev',
    'responsiveTest': 'dev', 'contrastCheck': 'dev',
    'radix': 'dev', 'timestamp': 'dev', 'unitConvert': 'dev', 'dateCalc': 'dev',
    'mimeQuery': 'dev',
    // Efficiency tools (14)
    'qrcode': 'efficiency', 'barcode': 'efficiency', 'calculator': 'efficiency',
    'scientificCalc': 'efficiency', 'notepad': 'efficiency', 'stickyNote': 'efficiency',
    'countdown': 'efficiency', 'stopwatch': 'efficiency', 'pomodoro': 'efficiency',
    'worldClock': 'efficiency', 'timezone': 'efficiency', 'passwordStrength': 'efficiency',
    'randomNum': 'efficiency', 'radixCalc': 'efficiency',
    // File tools (6)
    'imageConvert': 'file', 'zip': 'file', 'unzip': 'file', 'preview': 'file',
    'fileHash': 'file', 'editor': 'file',
    // Data tools (4)
    'csvEditor': 'data', 'jsonEditor': 'data', 'chart': 'data', 'statistics': 'data',
    // PDF tools (11)
    'pdfMerge': 'pdf', 'pdfSplit': 'pdf', 'pdfCompress': 'pdf', 'pdfToImage': 'pdf',
    'pdfRotate': 'pdf', 'pdfOrganize': 'pdf', 'pdfWatermark': 'pdf', 'pdfPageNumber': 'pdf',
    'pdfProtect': 'pdf', 'pdfUnlock': 'pdf', 'pdfInfo': 'pdf',
  };

  const results = useMemo(() => {
    if (!query || !query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    const searchResults: SearchResult[] = [];
    
    allTools.forEach((tool) => {
      const category = toolCategoryMap[tool.key];
      if (!category) return;
      
      const toolName = t(`${category}Tools.${tool.key}` as any) ?? tool.key;
      const toolDesc = t(`${category}Tools.${tool.key}Desc` as any) ?? '';
      
      if (
        toolName.toLowerCase().includes(lowerQuery) ||
        toolDesc.toLowerCase().includes(lowerQuery) ||
        tool.key.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          tool,
          category
        });
      }
    });
    
    return searchResults;
  }, [query, t]);

  if (!query.trim()) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          没有找到匹配的工具
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          建议尝试更换关键词或查看全部工具
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        找到 {results.length} 个匹配结果
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <Link
            key={index}
            href={`/tools/${result.tool.key}`}
            className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-5 pr-12 hover:border-violet-500/30 dark:hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer block"
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(result.tool.key); }}
              className="absolute top-3 right-3 text-xl hover:scale-110 transition-transform z-10"
            >
              {isFavorite(result.tool.key) ? '⭐' : '☆'}
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${result.tool.gradient} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                <span className="text-xl">{result.tool.icon}</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={t(`${result.category}Tools.${result.tool.key}` as any)}>
                  {t(`${result.category}Tools.${result.tool.key}` as any)}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {t(`${result.category}Tools.${result.tool.key}Desc` as any)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
