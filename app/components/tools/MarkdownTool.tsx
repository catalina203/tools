'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lines = html.split('\n');
  let inCodeBlock = false;
  let codeContent = '';
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        result.push(`<pre><code>${codeContent}</code></pre>`);
        codeContent = '';
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line;
      continue;
    }

    if (line.startsWith('#')) {
      const level = line.match(/^#{1,6}/)?.[0].length || 1;
      const text = line.replace(/^#{1,6}\s*/, '');
      result.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    if (line.startsWith('> ')) {
      result.push(`<blockquote><p>${line.slice(2)}</p></blockquote>`);
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(`<li>${line.slice(2)}</li>`);
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      result.push(`<li>${line.replace(/^\d+\.\s/, '')}</li>`);
      continue;
    }

    if (line === '---') {
      result.push('<hr />');
      continue;
    }

    if (line.trim() === '') {
      result.push('<p></p>');
      continue;
    }

    let processed = line;
    processed = processed.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%" />');

    if (processed.trim()) {
      result.push(`<p>${processed}</p>`);
    }
  }

  if (inCodeBlock) {
    result.push(`<pre><code>${codeContent}</code></pre>`);
  }

  const joined = result.join('\n');
  return joined
    .replace(/<li>.*?<\/li>/g, (m) => {
      const items = joined.match(/<li>.*?<\/li>/g) || [];
      return items.length ? `<ul>${items.join('')}</ul>` : m;
    });
}

export default function MarkdownTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [mdText, setMdText] = useState('# Hello World\n\nStart typing **Markdown** here...');
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');

  const html = useMemo(() => renderMarkdown(mdText), [mdText]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setMdText(text);
    } catch {}
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(viewMode === 'source' ? html : mdText);
  }, [html, mdText, viewMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('textTools.markdown')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('textTools.markdown')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('textTools.markdownDesc')}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button onClick={() => setViewMode('preview')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'preview' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{t('textTools.rendered')}</button>
            <button onClick={() => setViewMode('source')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'source' ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{t('textTools.htmlSource')}</button>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePaste} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('textTools.paste')}</button>
            <button onClick={() => setMdText('')} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-red-500 hover:border-red-300 transition-colors">{t('textTools.clear')}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-white/10">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('textTools.inputText')}</h3>
            </div>
            <textarea
              value={mdText}
              onChange={(e) => setMdText(e.target.value)}
              className="w-full h-[500px] bg-white dark:bg-gray-900 p-4 text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none"
              placeholder={t('textTools.inputPlaceholder')}
            />
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('textTools.result')}</h3>
              <button onClick={handleCopy} className="px-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors">{t('textTools.copy')}</button>
            </div>
            <div className="h-[500px] overflow-y-auto p-6 bg-white dark:bg-gray-900">
              {viewMode === 'preview' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-violet-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-gray-400 [&_blockquote]:mb-3 [&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:rounded-none [&_hr]:border-gray-300 [&_hr]:dark:border-gray-600 [&_hr]:my-4 [&_a]:text-violet-600 [&_a]:dark:text-violet-400 [&_a]:underline [&_img]:rounded-xl [&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <textarea readOnly value={html} className="w-full h-full bg-transparent text-gray-900 dark:text-white font-mono text-sm focus:outline-none resize-none" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10">
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('textTools.tip1')} · {t('textTools.tip2')} · {t('textTools.tip3')}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
