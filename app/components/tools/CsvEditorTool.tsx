'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(current);
        current = '';
      } else if (ch === '\n') {
        currentRow.push(current);
        if (currentRow.length > 0 && currentRow.some(c => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        current = '';
      } else if (ch === '\r') {
      } else {
        current += ch;
      }
    }
  }
  currentRow.push(current);
  if (currentRow.length > 0 && currentRow.some(c => c !== '')) {
    rows.push(currentRow);
  }
  return rows;
}

function toCSV(rows: string[][]): string {
  return rows.map(row =>
    row.map(cell => {
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return '"' + cell.replace(/"/g, '""') + '"';
      }
      return cell;
    }).join(',')
  ).join('\n');
}

export default function CsvEditorTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [raw, setRaw] = useState('');
  const [mode, setMode] = useState<'input' | 'table'>('input');
  const fileRef = useRef<HTMLInputElement>(null);

  const loadCSV = (text: string) => {
    const parsed = parseCSV(text);
    if (parsed.length === 0) return;
    setHeaders(parsed[0]);
    setRows(parsed.slice(1));
    setRaw(text);
    setMode('table');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') loadCSV(reader.result);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (!raw.trim()) return;
    loadCSV(raw);
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const next = rows.map((r, i) =>
      i === rowIdx ? r.map((c, j) => j === colIdx ? value : c) : r
    );
    setRows(next);
  };

  const addRow = () => {
    setRows(prev => [...prev, headers.map(() => '')]);
  };

  const deleteRow = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const addColumn = () => {
    setHeaders(prev => [...prev, '']);
    setRows(prev => prev.map(r => [...r, '']));
  };

  const updateHeader = (idx: number, value: string) => {
    setHeaders(prev => prev.map((h, i) => i === idx ? value : h));
  };

  const downloadCSV = () => {
    const allRows = [headers, ...rows];
    const csv = toCSV(allRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setRows([]);
    setHeaders([]);
    setRaw('');
    setMode('input');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('dataTools.csvEditor')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dataTools.csvEditor')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dataTools.csvEditorDesc')}</p>
        </div>

        <div className="space-y-6">
          {mode === 'input' ? (
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={t('dataTools.csvPlaceholder')}
                className="w-full h-48 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
              <div className="flex gap-3">
                <button onClick={handlePaste} disabled={!raw.trim()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
                  {t('dataTools.csvParse')}
                </button>
                <label className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  {t('dataTools.csvUpload')}
                  <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{rows.length} {t('dataTools.csvRows')}, {headers.length} {t('dataTools.csvCols')}</span>
                <div className="flex gap-2">
                  <button onClick={addRow} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('dataTools.csvAddRow')}</button>
                  <button onClick={addColumn} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('dataTools.csvAddCol')}</button>
                  <button onClick={downloadCSV} className="px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors">{t('dataTools.csvDownload')}</button>
                  <button onClick={reset} className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-400 text-white rounded-lg transition-colors">{t('imageTools.reset')}</button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-white/10 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium w-10">#</th>
                      {headers.map((h, i) => (
                        <th key={i} className="px-3 py-2">
                          <input
                            value={h}
                            onChange={(e) => updateHeader(i, e.target.value)}
                            className="w-full bg-transparent text-gray-900 dark:text-white font-medium focus:outline-none border-b border-transparent focus:border-emerald-500"
                          />
                        </th>
                      ))}
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className="border-t border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-2 text-gray-400 text-xs">{ri + 1}</td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2">
                            <input
                              value={cell}
                              onChange={(e) => updateCell(ri, ci, e.target.value)}
                              className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none border-b border-transparent focus:border-emerald-500"
                            />
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <button onClick={() => deleteRow(ri)} className="text-red-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
