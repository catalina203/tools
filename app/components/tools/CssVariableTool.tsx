'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

interface Variable {
  name: string;
  value: string;
}

const STORAGE_KEY = 'cssVariables';

function loadVariables(): Variable[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveVariables(vars: Variable[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
  } catch { /* ignore */ }
}

function generateCSS(vars: Variable[]): string {
  if (vars.length === 0) return '';
  return `:root {\n${vars.map(v => `  ${v.name.startsWith('--') ? v.name : '--' + v.name}: ${v.value};`).join('\n')}\n}`;
}

function parseImport(text: string): Variable[] {
  const lines = text.split('\n');
  const vars: Variable[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
    const match = trimmed.match(/--([^:]+?):\s*(.+?)(?:;|!important;)?\s*$/);
    if (match) {
      vars.push({ name: '--' + match[1].trim(), value: match[2].trim() });
    }
  }
  return vars;
}

export default function CssVariableTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [variables, setVariables] = useState<Variable[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'value' | null>(null);
  const [editText, setEditText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importFeedback, setImportFeedback] = useState('');
  const [copyCode, setCopyCode] = useState(false);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVariables(loadVariables());
  }, []);

  useEffect(() => {
    saveVariables(variables);
  }, [variables]);

  useEffect(() => {
    if (editingIndex !== null && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingIndex]);

  const filteredVars = useMemo(() => {
    if (!searchQuery.trim()) return variables;
    const q = searchQuery.toLowerCase();
    return variables.filter(v => v.name.toLowerCase().includes(q));
  }, [variables, searchQuery]);

  const cssOutput = useMemo(() => generateCSS(variables), [variables]);

  const normalizeName = (name: string) => name.startsWith('--') ? name : '--' + name;

  const addVariable = () => {
    const name = newName.trim();
    const value = newValue.trim();
    if (!name || !value) return;
    const finalName = normalizeName(name);
    if (variables.some(v => v.name === finalName)) return;
    setVariables(prev => [...prev, { name: finalName, value }]);
    setNewName('');
    setNewValue('');
  };

  const deleteVariable = (index: number) => {
    const realIndex = variables.indexOf(filteredVars[index]);
    setVariables(prev => prev.filter((_, i) => i !== realIndex));
  };

  const startEdit = (index: number, field: 'name' | 'value') => {
    const realIndex = variables.indexOf(filteredVars[index]);
    setEditingIndex(realIndex);
    setEditingField(field);
    setEditText(variables[realIndex][field]);
  };

  const saveEdit = () => {
    if (editingIndex === null || !editingField) return;
    const val = editText.trim();
    if (!val) {
      cancelEdit();
      return;
    }
    setVariables(prev => {
      const next = [...prev];
      if (editingField === 'name') {
        const finalName = normalizeName(val);
        next[editingIndex] = { ...next[editingIndex], name: finalName };
      } else {
        next[editingIndex] = { ...next[editingIndex], value: val };
      }
      return next;
    });
    setEditingIndex(null);
    setEditingField(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingField(null);
    setEditText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    else if (e.key === 'Escape') cancelEdit();
  };

  const handleImport = () => {
    const imported = parseImport(importText);
    if (imported.length === 0) {
      setImportFeedback(t('devTools.importFailed') || 'No valid variables found');
      return;
    }
    setVariables(prev => {
      const existing = new Set(prev.map(v => v.name));
      const newVars = imported.filter(v => !existing.has(v.name));
      return [...prev, ...newVars];
    });
    setImportFeedback(`${imported.length} ${t('devTools.varCount_other') || 'variables'} imported`);
    setImportText('');
    setTimeout(() => setImportFeedback(''), 3000);
  };

  const handleExport = () => {
    if (!cssOutput) return;
    navigator.clipboard.writeText(cssOutput).then(() => {
      setCopyCode(true);
      setTimeout(() => setCopyCode(false), 2000);
    });
  };

  const copyCSS = () => {
    if (!cssOutput) return;
    navigator.clipboard.writeText(cssOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const clearAll = () => {
    if (variables.length === 0) return;
    setVariables([]);
  };

  const previewStyle = useMemo(() => {
    const style: Record<string, string> = {};
    for (const v of variables) {
      style[v.name] = v.value;
    }
    return style as React.CSSProperties;
  }, [variables]);

  const usedNames = variables.map(v => v.name.startsWith('--') ? v.name.slice(2) : v.name);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.cssVariable')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.cssVariable')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.cssVariableDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('devTools.cssVariable')}
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({variables.length} {variables.length === 1 ? t('devTools.varCount') || 'variable' : t('devTools.varCount_other') || 'variables'})
                  </span>
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('devTools.filterPlaceholder') || 'Filter variables...'}
                      className="w-48 pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('devTools.varName') || 'Variable name'}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={t('devTools.varValue') || 'Value'}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                />
                <button
                  onClick={addVariable}
                  disabled={!newName.trim() || !newValue.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {t('devTools.addVariable') || 'Add'}
                </button>
              </div>

              {variables.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">{t('devTools.noVariables') || 'No variables defined'}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">{t('devTools.cssVariableDesc')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10">
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium w-1/2">{t('devTools.varName') || 'Variable Name'}</th>
                        <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium w-1/3">{t('devTools.varValue') || 'Value'}</th>
                        <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium w-20">{t('devTools.actions') || ''}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVars.map((v, i) => (
                        <tr key={`${v.name}-${i}`} className="border-b border-gray-100 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="py-3 px-4">
                            {editingIndex === variables.indexOf(v) && editingField === 'name' ? (
                              <input
                                ref={editRef}
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={handleEditKeyDown}
                                className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-purple-500 rounded text-sm text-gray-900 dark:text-white focus:outline-none font-mono"
                              />
                            ) : (
                              <span
                                onClick={() => startEdit(i, 'name')}
                                className="cursor-pointer text-purple-600 dark:text-purple-400 font-mono text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2 py-1 rounded transition-colors -ml-2"
                              >
                                {v.name}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {editingIndex === variables.indexOf(v) && editingField === 'value' ? (
                              <input
                                ref={editRef}
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={handleEditKeyDown}
                                className="w-full px-2 py-1 bg-white dark:bg-gray-900 border border-purple-500 rounded text-sm text-gray-900 dark:text-white focus:outline-none font-mono"
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span
                                  onClick={() => startEdit(i, 'value')}
                                  className="cursor-pointer text-gray-700 dark:text-gray-300 font-mono text-sm hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition-colors -ml-2 flex-1"
                                >
                                  {v.value}
                                </span>
                                {v.value.match(/^#[0-9a-fA-F]{3,8}$/) && (
                                  <span className="w-5 h-5 rounded border border-gray-200 dark:border-white/10 shrink-0" style={{ backgroundColor: v.value }} />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => deleteVariable(i)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 p-1"
                              title={t('devTools.deleteVariable') || 'Delete'}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowImport(!showImport)}
                className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                {t('devTools.importVars') || 'Import'}
              </button>
              <button
                onClick={handleExport}
                disabled={variables.length === 0}
                className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {copyCode ? (t('devTools.copied') || 'Copied!') : (t('devTools.exportVars') || 'Export')}
              </button>
              <button
                onClick={clearAll}
                disabled={variables.length === 0}
                className="px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                {t('devTools.clearAll') || 'Clear All'}
              </button>
            </div>

            {showImport && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.importVars') || 'Import Variables'}</h3>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={t('devTools.importPlaceholder') || 'Paste CSS variables here...\ne.g.\n--primary-color: #3b82f6;\n--secondary-color: #10b981;'}
                  className="w-full h-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                  spellCheck={false}
                />
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleImport}
                    disabled={!importText.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('devTools.importVars') || 'Import'}
                  </button>
                  <button
                    onClick={() => { setShowImport(false); setImportText(''); setImportFeedback(''); }}
                    className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('devTools.cancel') || 'Cancel'}
                  </button>
                  {importFeedback && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400">{importFeedback}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.exportAll') || 'CSS Code'}</h3>
                <button
                  onClick={copyCSS}
                  disabled={!cssOutput}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>
                  {copied ? (t('devTools.copied') || 'Copied!') : (t('devTools.copy') || 'Copy')}
                </button>
              </div>
              <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm font-mono text-gray-900 dark:text-white overflow-x-auto min-h-[120px] max-h-48">
                {cssOutput || <span className="text-gray-400 dark:text-gray-500">{t('devTools.noVariables') || 'No variables defined'}</span>}
              </pre>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.preview') || 'Preview'}</h3>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 min-h-[200px]" style={previewStyle}>
                {variables.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                    <p className="text-sm">{t('devTools.noVariables') || 'Add variables to see preview'}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Color Swatches</p>
                      <div className="flex flex-wrap gap-3">
                        {variables.filter(v => v.value.match(/^#[0-9a-fA-F]{3,8}$/) || v.value.match(/^(rgb|hsl|hwb)/)).slice(0, 8).map((v, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm" style={{ backgroundColor: `var(${v.name})` }} />
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono max-w-[80px] truncate">{v.name.replace('--', '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Text Samples</p>
                      <div className="space-y-2 text-sm">
                        <p style={{ color: 'var(--primary-color, inherit)' }} className="font-medium">Primary Color Text (--primary-color)</p>
                        <p style={{ color: 'var(--secondary-color, inherit)' }} className="font-medium">Secondary Color Text (--secondary-color)</p>
                        <p style={{ color: 'var(--text-color, inherit)' }}>Body text sample (--text-color)</p>
                        <p style={{ color: 'var(--muted-color, #9ca3af)' }}>Muted text sample (--muted-color)</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Background Samples</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 rounded-xl flex items-center justify-center text-xs font-medium border border-gray-200 dark:border-white/10" style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: '#fff' }}>
                          --primary-color bg
                        </div>
                        <div className="h-16 rounded-xl flex items-center justify-center text-xs font-medium border border-gray-200 dark:border-white/10" style={{ backgroundColor: 'var(--secondary-color, #10b981)', color: '#fff' }}>
                          --secondary-color bg
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Gradient Sample</p>
                      <div className="h-16 rounded-xl flex items-center justify-center text-xs font-medium text-white" style={{ background: 'linear-gradient(135deg, var(--primary-color, #3b82f6), var(--secondary-color, #10b981))' }}>
                        gradient(--primary, --secondary)
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wider">Border Sample</p>
                      <div className="flex flex-wrap gap-3">
                        {variables.filter(v => v.value.match(/^\d+px/) || v.value.match(/^(solid|dashed|dotted)/)).slice(0, 3).map((v, i) => (
                          <div key={i} className="px-4 py-2 rounded-lg text-xs font-mono text-gray-600 dark:text-gray-400 border-2" style={{ borderColor: `var(${v.name}, #e5e7eb)`, borderStyle: 'solid' }}>
                            {v.name.replace('--', '')}: {v.value}
                          </div>
                        ))}
                        {variables.filter(v => v.value.match(/^\d+px/) || v.value.match(/^(solid|dashed|dotted)/)).length === 0 && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic">Add border variables (e.g. --border-color, --border-radius) to see samples</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
