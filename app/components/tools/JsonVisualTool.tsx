'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue; }
interface JsonArray extends Array<JsonValue> {}

interface TreeNode {
  key: string | number;
  value: JsonValue;
  path: string;
  depth: number;
  expanded: boolean;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  size?: number;
}

function parseJsonWithPaths(json: JsonValue, path = '$', depth = 0, expanded = true): TreeNode[] {
  const nodes: TreeNode[] = [];
  
  if (json === null) {
    nodes.push({ key: 'null', value: null, path, depth, expanded, type: 'null', size: 0 });
    return nodes;
  }
  
  if (Array.isArray(json)) {
    const size = json.length;
    nodes.push({ key: '', value: json, path, depth, expanded, type: 'array', size });
    if (expanded) {
      json.forEach((item, index) => {
        nodes.push(...parseJsonWithPaths(item, `${path}[${index}]`, depth + 1, true));
      });
    }
    return nodes;
  }
  
  if (typeof json === 'object') {
    const keys = Object.keys(json);
    const size = keys.length;
    nodes.push({ key: '', value: json, path, depth, expanded, type: 'object', size });
    if (expanded) {
      keys.forEach(key => {
        nodes.push(...parseJsonWithPaths((json as JsonObject)[key], `${path}.${key}`, depth + 1, true));
      });
    }
    return nodes;
  }
  
  if (typeof json === 'string') {
    nodes.push({ key: '', value: json, path, depth, expanded, type: 'string', size: json.length });
  } else if (typeof json === 'number') {
    nodes.push({ key: '', value: json, path, depth, expanded, type: 'number', size: 0 });
  } else if (typeof json === 'boolean') {
    nodes.push({ key: '', value: json, path, depth, expanded, type: 'boolean', size: 0 });
  }
  
  return nodes;
}

function getTypeColor(type: TreeNode['type']): string {
  switch (type) {
    case 'object': return 'text-purple-500 dark:text-purple-400';
    case 'array': return 'text-blue-500 dark:text-blue-400';
    case 'string': return 'text-green-500 dark:text-green-400';
    case 'number': return 'text-orange-500 dark:text-orange-400';
    case 'boolean': return 'text-red-500 dark:text-red-400';
    case 'null': return 'text-gray-500 dark:text-gray-400';
    default: return 'text-gray-900 dark:text-white';
  }
}

function formatValue(node: TreeNode): string {
  const { value, type } = node;
  if (type === 'string') return `"${value}"`;
  if (type === 'null') return 'null';
  if (type === 'object') return `{${(value as JsonObject ? Object.keys(value as JsonObject).length : 0)} 项}`;
  if (type === 'array') return `[${(value as JsonArray).length} 项]`;
  return String(value);
}

function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === search.toLowerCase() 
      ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white rounded px-0.5">{part}</mark>
      : <span key={i}>{part}</span>
  );
}

export default function JsonVisualTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [input, setInput] = useState('');
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [showLineNumbers, setShowLineNumbers] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    setError('');
    if (!value.trim()) {
      setParsedJson(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setParsedJson(parsed);
    } catch (e) {
      setError(t('devTools.jsonVisualError'));
      setParsedJson(null);
    }
  };

  const treeNodes = useMemo(() => {
    if (!parsedJson) return [];
    return parseJsonWithPaths(parsedJson);
  }, [parsedJson]);

  const filteredNodes = useMemo(() => {
    if (!search) return treeNodes;
    const searchLower = search.toLowerCase();
    return treeNodes.filter(node => {
      const keyStr = String(node.key).toLowerCase();
      const valueStr = formatValue(node).toLowerCase();
      const pathStr = node.path.toLowerCase();
      return keyStr.includes(searchLower) || valueStr.includes(searchLower) || pathStr.includes(searchLower);
    });
  }, [treeNodes, search]);

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const expandAll = () => {
    const allPaths = new Set<string>();
    treeNodes.forEach(node => {
      if (node.type === 'object' || node.type === 'array') {
        allPaths.add(node.path);
      }
    });
    setExpandedPaths(allPaths);
  };

  const collapseAll = () => {
    setExpandedPaths(new Set());
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const copyValue = (value: JsonValue) => {
    if (value === null || typeof value !== 'object') {
      navigator.clipboard.writeText(formatValue({ key: '', value, path: '', depth: 0, expanded: true, type: typeof value as TreeNode['type'] }));
    } else {
      navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    }
  };

  const formatJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setParsedJson(parsed);
      setError('');
    } catch {
      setError(t('devTools.jsonVisualError'));
    }
  };

  const minifyJson = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setParsedJson(parsed);
      setError('');
    } catch {
      setError(t('devTools.jsonVisualError'));
    }
  };

  const loadSample = () => {
    const sample = {
      "users": [
        { "id": 1, "name": "张三", "email": "zhangsan@example.com", "active": true, "tags": ["admin", "user"] },
        { "id": 2, "name": "李四", "email": "lisi@example.com", "active": false, "tags": ["user"] }
      ],
      "config": {
        "version": "1.0.0",
        "features": { "darkMode": true, "notifications": false },
        "limits": { "maxUsers": 1000, "timeout": 30000 }
      },
      "metadata": { "created": "2024-01-15T10:30:00Z", "version": 2 }
    };
    setInput(JSON.stringify(sample, null, 2));
    setParsedJson(sample);
    setError('');
  };

  const clearAll = () => {
    setInput('');
    setParsedJson(null);
    setError('');
    setSearch('');
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.jsonVisual')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.jsonVisual')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.jsonVisualDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.inputJson')}</h3>
                <button onClick={loadSample} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  {t('devTools.loadSample')}
                </button>
              </div>
              <textarea value={input} onChange={(e) => handleInputChange(e.target.value)} className="w-full h-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm" placeholder={t('devTools.jsonInputPlaceholder')} spellCheck={false} />
              {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.options')}</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                  <input type="checkbox" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} className="w-5 h-5 text-purple-500 border-gray-300 rounded focus:ring-purple-500" />
                  <span className="text-gray-700 dark:text-gray-300">{t('devTools.showLineNumbers')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={formatJson} disabled={!input} className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{t('devTools.format')}</button>
              <button onClick={minifyJson} disabled={!input} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t('devTools.minify')}</button>
              <button onClick={clearAll} disabled={!input} className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('devTools.treeView')}
                  {filteredNodes.length > 0 && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({filteredNodes.length} {t('devTools.nodes')})</span>}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('devTools.searchPlaceholder')} className="w-64 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm pl-10" />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={expandAll} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">{t('devTools.expandAll')}</button>
                    <button onClick={collapseAll} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">{t('devTools.collapseAll')}</button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden max-h-[600px] overflow-auto">
                {filteredNodes.length === 0 && !error ? (
                  <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p>{input ? t('devTools.noMatches') : t('devTools.enterJsonToVisualize')}</p>
                  </div>
                ) : (
                  <table className="w-full font-mono text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 sticky top-0">
                      <tr>
                        {showLineNumbers && <th className="px-4 py-2 text-right text-gray-500 dark:text-gray-400 w-12">{t('devTools.line')}</th>}
                        <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 w-8">{t('devTools.expand')}</th>
                        <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">{t('devTools.key')}</th>
                        <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">{t('devTools.value')}</th>
                        <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 w-48">{t('devTools.path')}</th>
                        <th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400 w-32">{t('devTools.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNodes.map((node, index) => {
                        const isExpandable = node.type === 'object' || node.type === 'array';
                        const isExpanded = expandedPaths.has(node.path);
                        const indent = node.depth * 24;
                        
                        return (
                          <tr key={node.path} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {showLineNumbers && <td className="px-4 py-2 text-right text-gray-400 dark:text-gray-500 text-xs">{index + 1}</td>}
                            <td className="px-4 py-2">
                              {isExpandable ? (
                                <button onClick={() => toggleExpand(node.path)} className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                  <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                              ) : (
                                <div className="w-8 h-8" />
                              )}
                            </td>
                            <td className="px-4 py-2" style={{ paddingLeft: `${16 + indent}px` }}>
                              <span className="font-medium text-gray-900 dark:text-white">{node.key === '' ? (node.type === 'array' ? '[]' : '{}') : node.key}</span>
                              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${getTypeColor(node.type)}`}>{node.type}</span>
                            </td>
                            <td className="px-4 py-2 max-w-xs truncate">
                              {highlightMatch(formatValue(node), search)}
                            </td>
                            <td className="px-4 py-2 text-gray-500 dark:text-gray-400 truncate font-mono text-xs">{node.path}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button onClick={() => copyPath(node.path)} title={t('devTools.copyPath')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors rounded">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                                </button>
                                <button onClick={() => copyValue(node.value)} title={t('devTools.copyValue')} className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors rounded">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2v-12a2 2 0 012-2z" /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.tips')}</h3><ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400"><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.jsonVisualTip1')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.jsonVisualTip2')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.jsonVisualTip3')}</li><li className="flex items-start gap-2"><span className="text-purple-500">•</span>{t('devTools.jsonVisualTip4')}</li></ul></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}