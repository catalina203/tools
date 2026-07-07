'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { allTools, ToolItem } from '@/src/data/tools';

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
  const searchT = useTranslations('search');
  
  // Define category mapping for tools
  const toolCategoryMap: Record<string, string> = {
    // Image tools
    'crop': 'image', 'resize': 'image', 'rotate': 'image', 'brightness': 'image',
    'contrast': 'image', 'saturation': 'image', 'hue': 'image', 'grayscale': 'image',
    'vintage': 'image', 'blur': 'image', 'sharpen': 'image', 'watermark': 'image',
    'formatConvert': 'image', 'compress': 'image', 'mosaic': 'image', 'grid': 'image',
    'rounded': 'image', 'colorExtract': 'image', 'eyedropper': 'image', 'exif': 'image',
    'base64': 'image', 'compare': 'image', 'bgRemove': 'image', 'toPdf': 'image',
    // Text tools
    'jsonFormat': 'text', 'xmlFormat': 'text', 'yamlToJson': 'text', 'csvToJson': 'text',
    'markdown': 'text', 'wordCount': 'text', 'dedup': 'text', 'caseConvert': 'text',
    'traditionalSimplified': 'text', 'regexTest': 'text', 'urlEncode': 'text',
    'password': 'text', 'lorem': 'text', 'escape': 'text', 'sqlFormat': 'text', 'diff': 'text',
    // Dev tools
    'colorPicker': 'dev', 'gradient': 'dev', 'shadow': 'dev', 'flexbox': 'dev',
    'radix': 'dev', 'timestamp': 'dev', 'unitConvert': 'dev', 'dateCalc': 'dev',
    'emailValidate': 'dev', 'jsonVisual': 'dev', 'colorConvert': 'dev', 'regexVisual': 'dev',
    'mimeQuery': 'dev',
    // Efficiency tools
    'qrcode': 'efficiency', 'barcode': 'efficiency', 'calculator': 'efficiency',
    'scientificCalc': 'efficiency', 'notepad': 'efficiency', 'stickyNote': 'efficiency',
    'countdown': 'efficiency', 'stopwatch': 'efficiency', 'pomodoro': 'efficiency',
    'worldClock': 'efficiency', 'timezone': 'efficiency', 'passwordStrength': 'efficiency',
    'randomNum': 'efficiency', 'radixCalc': 'efficiency',
    // File tools
    'imageConvert': 'file', 'zip': 'file', 'unzip': 'file', 'preview': 'file',
    'fileHash': 'file', 'editor': 'file',
    // Data tools
    'csvEditor': 'data', 'jsonEditor': 'data', 'chart': 'data', 'statistics': 'data',
    // Design tools
    'colorScheme': 'design', 'fontPreview': 'design', 'gridGenerator': 'design',
    'contrastCheck': 'design', 'responsiveTest': 'design', 'cssVariable': 'design'
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
          <div
            key={index}
            className="group relative bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl p-4 hover:border-violet-500/30 dark:hover:border-white/20 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-br ${result.tool.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-lg">{result.tool.icon}</span>
              </div>
              <div className="ml-3 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t(`${result.category}Tools.${result.tool.key}` as any)}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t(`${result.category}Tools.${result.tool.key}Desc` as any)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}