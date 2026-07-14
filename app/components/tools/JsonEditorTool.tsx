'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type JsonNode = {
  key: string;
  value: unknown;
  path: string;
  depth: number;
  collapsed: boolean;
  isArray: boolean;
};

function buildNodes(data: unknown, path = '', depth = 0, key = ''): JsonNode[] {
  const nodes: JsonNode[] = [];
  const isArray = Array.isArray(data);
  const isObj = data !== null && typeof data === 'object';

  nodes.push({ key, value: data, path, depth, collapsed: depth > 2, isArray });
  if (isObj) {
    const entries = isArray ? (data as unknown[]).map((v, i) => [String(i), v] as const) : Object.entries(data as Record<string, unknown>);
    for (const [k, v] of entries) {
      const childPath = path ? `${path}.${k}` : k;
      nodes.push(...buildNodes(v, childPath, depth + 1, k));
    }
  }
  return nodes;
}

function JsonTreeView({ data, onEdit, path: parentPath, depth = 0 }: { data: unknown; onEdit: (path: string, value: unknown) => void; path?: string; depth?: number }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const isObj = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const entries = isObj
    ? isArray
      ? (data as unknown[]).map((v, i) => [String(i), v] as const)
      : Object.entries(data as Record<string, unknown>)
    : [];

  const toggle = (p: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const getColor = (val: unknown): string => {
    if (val === null) return 'text-blue-400';
    if (typeof val === 'string') return 'text-emerald-500';
    if (typeof val === 'number') return 'text-orange-400';
    if (typeof val === 'boolean') return 'text-purple-400';
    return '';
  };

  if (!isObj) {
    return (
      <span className={`${getColor(data)}`}>
        {data === null ? 'null' : typeof data === 'string' ? `"${data}"` : String(data)}
      </span>
    );
  }

  const fullPath = parentPath || 'root';

  if (depth > 0 && collapsed.has(fullPath)) {
    return (
      <span className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggle(fullPath)}>
        {isArray ? '[...]' : '{...}'}
      </span>
    );
  }

  return (
    <div className="ml-4">
      {entries.map(([k, v]) => {
        const childPath = fullPath ? `${fullPath}.${k}` : k;
        const childIsObj = v !== null && typeof v === 'object';
        const isCollapsed = collapsed.has(childPath);
        return (
          <div key={k} className="border-l border-gray-200 dark:border-white/10 pl-3 py-0.5">
            <div className="flex items-start gap-1">
              {childIsObj && (
                <button onClick={() => toggle(childPath)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-0.5 flex-shrink-0">
                  <svg className={`w-3 h-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
              {!childIsObj && <span className="w-3 flex-shrink-0" />}
              <span className="text-indigo-500 dark:text-indigo-400 font-medium">"{k}"</span>
              <span className="text-gray-400">: </span>
              {childIsObj ? (
                <JsonTreeView data={v} onEdit={onEdit} path={childPath} depth={depth + 1} />
              ) : (
                <JsonEditableValue value={v} path={childPath} onEdit={onEdit} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JsonEditableValue({ value, path: _path, onEdit }: { value: unknown; path: string; onEdit: (path: string, value: unknown) => void }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const startEdit = () => {
    setEditText(value === null ? 'null' : typeof value === 'string' ? value : JSON.stringify(value));
    setEditing(true);
  };

  const saveEdit = () => {
    try {
      const parsed = JSON.parse(editText);
      onEdit(_path, parsed);
    } catch {
    }
    setEditing(false);
  };

  const getColor = (val: unknown): string => {
    if (val === null) return 'text-blue-400';
    if (typeof val === 'string') return 'text-emerald-500';
    if (typeof val === 'number') return 'text-orange-400';
    if (typeof val === 'boolean') return 'text-purple-400';
    return '';
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
          className="w-24 px-1 py-0.5 text-xs bg-white dark:bg-gray-800 border border-emerald-500 rounded font-mono text-gray-900 dark:text-white focus:outline-none"
          autoFocus
        />
      </span>
    );
  }

  return (
    <span onClick={startEdit} className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1 rounded ${getColor(value)}`}>
      {value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value)}
    </span>
  );
}

export default function JsonEditorTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const [text, setText] = useState('{\n  \n}');
  const [data, setData] = useState<unknown>({});
  const [error, setError] = useState('');
  const [view, setView] = useState<'editor' | 'tree'>('editor');

  const format = () => {
    try {
      const parsed = JSON.parse(text);
      setData(parsed);
      setText(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const compress = () => {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed));
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const validate = () => {
    try {
      JSON.parse(text);
      setError('');
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      return false;
    }
  };

  const handleEdit = useCallback((path: string, newValue: unknown) => {
    try {
      const parsed = JSON.parse(text);
      const keys = path.split('.');
      let current = parsed;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = newValue;
      const updated = JSON.stringify(parsed, null, 2);
      setText(updated);
      setData(parsed);
      setError('');
    } catch {
    }
  }, [text]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setText('');
    setData({});
    setError('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('dataTools.jsonEditor')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dataTools.jsonEditor')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dataTools.jsonEditorDesc')}</p>
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={format} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-medium transition-colors">{t('dataTools.jsonFormat')}</button>
          <button onClick={compress} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('dataTools.jsonCompress')}</button>
          <button onClick={validate} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-medium transition-colors">{t('dataTools.jsonValidate')}</button>
          <button onClick={() => setView(view === 'editor' ? 'tree' : 'editor')} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {view === 'editor' ? t('dataTools.jsonTreeView') : t('dataTools.jsonEditor')}
          </button>
          <button onClick={copy} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('dataTools.csvCopy')}</button>
          <button onClick={download} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors">{t('imageTools.download')}</button>
          <button onClick={clear} className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-medium transition-colors">{t('imageTools.reset')}</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
          {view === 'editor' ? (
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError(''); }}
              className="w-full h-[500px] p-6 bg-white dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-white focus:outline-none resize-y"
              spellCheck={false}
            />
          ) : (
            <div className="p-6 max-h-[500px] overflow-y-auto text-sm font-mono">
              <JsonTreeView data={data} onEdit={handleEdit} />
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
