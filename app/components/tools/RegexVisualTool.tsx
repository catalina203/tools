'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const commonRegexes = [
  { name: 'email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', desc: '邮箱地址' },
  { name: 'url', pattern: '^https?://[^\\s/$.?#].[^\\s]*$', desc: 'URL 地址' },
  { name: 'ipv4', pattern: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$', desc: 'IPv4 地址' },
  { name: 'phone_cn', pattern: '^1[3-9]\\d{9}$', desc: '中国手机号' },
  { name: 'id_card_cn', pattern: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', desc: '中国身份证' },
  { name: 'date_iso', pattern: '^\\d{4}-\\d{2}-\\d{2}$', desc: 'ISO 日期 (YYYY-MM-DD)' },
  { name: 'hex_color', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', desc: '十六进制颜色' },
  { name: 'chinese', pattern: '[\\u4e00-\\u9fa5]+', desc: '中文字符' },
  { name: 'number', pattern: '^-?\\d+(\\.\\d+)?$', desc: '数字(整数/小数)' },
  { name: 'username', pattern: '^[a-zA-Z0-9_]{3,16}$', desc: '用户名(字母数字下划线)' },
  { name: 'password_strong', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', desc: '强密码' },
  { name: 'whitespace', pattern: '\\s+', desc: '空白字符' },
];

type Token =
  | { type: 'char'; value: string; raw: string }
  | { type: 'anchor'; value: string; raw: string; kind: 'start' | 'end' }
  | { type: 'quantifier'; value: string; raw: string; greedy: boolean }
  | { type: 'group'; value: string; raw: string; index: number; isNonCapturing: boolean; isLookahead: boolean; isLookbehind: boolean }
  | { type: 'alternation'; value: string; raw: string }
  | { type: 'charClass'; value: string; raw: string; negated: boolean }
  | { type: 'escape'; value: string; raw: string }
  | { type: 'dot'; value: string; raw: string }
  | { type: 'flag'; value: string; raw: string }
  | { type: 'error'; value: string; raw: string; message: string };

function tokenizeRegex(pattern: string, flags: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let groupIndex = 0;
  const stack: Array<{ type: 'group' | 'charClass'; index: number }> = [];

  while (i < pattern.length) {
    const char = pattern[i];
    
    if (char === '\\') {
      if (i + 1 < pattern.length) {
        const next = pattern[i + 1];
        const escaped = pattern.slice(i, i + 2);
        
        if ('dDwWsSbB'.includes(next)) {
          tokens.push({ type: 'escape', value: next, raw: escaped });
        } else if ('0123456789'.includes(next)) {
          tokens.push({ type: 'escape', value: `\\${next}`, raw: escaped });
        } else if ('nrtvf'.includes(next)) {
          tokens.push({ type: 'escape', value: next, raw: escaped });
        } else if (next === 'x' && i + 3 < pattern.length) {
          tokens.push({ type: 'escape', value: `x${pattern.slice(i + 2, i + 4)}`, raw: pattern.slice(i, i + 4) });
          i += 3;
        } else if (next === 'u' && i + 5 < pattern.length && pattern[i + 2] === '{') {
          let j = i + 3;
          while (j < pattern.length && pattern[j] !== '}') j++;
          tokens.push({ type: 'escape', value: `u{${pattern.slice(i + 3, j)}}`, raw: pattern.slice(i, j + 1) });
          i = j;
        } else if (next === 'p' && i + 4 < pattern.length && (pattern[i + 2] === '{' || pattern[i + 2] === 'P')) {
          let j = i + 3;
          while (j < pattern.length && pattern[j] !== '}') j++;
          tokens.push({ type: 'escape', value: `p{${pattern.slice(i + 3, j)}}`, raw: pattern.slice(i, j + 1) });
          i = j;
        } else {
          tokens.push({ type: 'char', value: next, raw: escaped });
        }
        i += 2;
      } else {
        tokens.push({ type: 'error', value: '\\', raw: '\\', message: 'Incomplete escape sequence' });
        i++;
      }
    } else if (char === '^') {
      tokens.push({ type: 'anchor', value: '^', raw: '^', kind: 'start' });
      i++;
    } else if (char === '$') {
      tokens.push({ type: 'anchor', value: '$', raw: '$', kind: 'end' });
      i++;
    } else if (char === '.') {
      tokens.push({ type: 'dot', value: '.', raw: '.' });
      i++;
    } else if ('*+?'.includes(char)) {
      const greedy = i + 1 < pattern.length && pattern[i + 1] !== '?';
      const raw = greedy ? char : char + '?';
      tokens.push({ type: 'quantifier', value: char, raw, greedy });
      if (!greedy) i++;
      i++;
    } else if (char === '{') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== '}') j++;
      if (j < pattern.length) {
        const content = pattern.slice(i + 1, j);
        const greedy = j + 1 < pattern.length && pattern[j + 1] !== '?';
        const raw = greedy ? pattern.slice(i, j + 1) : pattern.slice(i, j + 2);
        tokens.push({ type: 'quantifier', value: content, raw, greedy });
        i = j + (greedy ? 1 : 2);
      } else {
        tokens.push({ type: 'error', value: '{', raw: '{', message: 'Unclosed quantifier' });
        i++;
      }
    } else if (char === '(') {
      if (i + 1 < pattern.length) {
        const next = pattern[i + 1];
        if (next === '?') {
          if (i + 2 < pattern.length) {
            const next2 = pattern[i + 2];
            if (next2 === ':' || next2 === '=' || next2 === '!' || next2 === '<' || next2 === '>') {
              const isNonCapturing = next2 === ':';
              const isLookahead = next2 === '=' || (next2 === '<' && i + 3 < pattern.length && pattern[i + 3] === '=');
              const isLookbehind = next2 === '!' || (next2 === '<' && i + 3 < pattern.length && pattern[i + 3] === '!');
              
              let j = i + 3;
              let depth = 1;
              while (j < pattern.length && depth > 0) {
                if (pattern[j] === '(') depth++;
                else if (pattern[j] === ')') depth--;
                j++;
              }
              const raw = pattern.slice(i, j);
              tokens.push({ 
                type: 'group', 
                value: isNonCapturing ? '(?:' : isLookahead ? '(?=' : isLookbehind ? '(?<=' : '(?!', 
                raw, 
                index: isNonCapturing ? -1 : groupIndex++,
                isNonCapturing,
                isLookahead,
                isLookbehind
              });
              i = j;
            } else {
              tokens.push({ type: 'char', value: '(', raw: '(' });
              i++;
            }
          } else {
            tokens.push({ type: 'char', value: '(', raw: '(' });
            i++;
          }
        } else {
          groupIndex++;
          stack.push({ type: 'group', index: groupIndex });
          tokens.push({ type: 'group', value: '(', raw: '(', index: groupIndex, isNonCapturing: false, isLookahead: false, isLookbehind: false });
          i++;
        }
      } else {
        tokens.push({ type: 'char', value: '(', raw: '(' });
        i++;
      }
    } else if (char === ')') {
      if (stack.length > 0 && stack[stack.length - 1].type === 'group') {
        stack.pop();
      }
      tokens.push({ type: 'char', value: ')', raw: ')' });
      i++;
    } else if (char === '|') {
      tokens.push({ type: 'alternation', value: '|', raw: '|' });
      i++;
    } else if (char === '[') {
      let j = i + 1;
      let negated = false;
      if (pattern[j] === '^') {
        negated = true;
        j++;
      }
      if (pattern[j] === ']') j++;
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\' && j + 1 < pattern.length) j += 2;
        else j++;
      }
      const raw = pattern.slice(i, j + 1);
      tokens.push({ type: 'charClass', value: raw.slice(1, -1), raw, negated });
      i = j + 1;
    } else {
      tokens.push({ type: 'char', value: char, raw: char });
      i++;
    }
  }

  if (flags) {
    for (const flag of flags) {
      tokens.push({ type: 'flag', value: flag, raw: flag });
    }
  }

  return tokens;
}

function getTokenColor(token: Token): string {
  switch (token.type) {
    case 'anchor': return 'text-purple-600 dark:text-purple-400';
    case 'quantifier': return 'text-orange-600 dark:text-orange-400';
    case 'group': return token.isNonCapturing ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400';
    case 'alternation': return 'text-red-600 dark:text-red-400';
    case 'charClass': return 'text-cyan-600 dark:text-cyan-400';
    case 'escape': return 'text-fuchsia-600 dark:text-fuchsia-400';
    case 'dot': return 'text-amber-600 dark:text-amber-400';
    case 'flag': return 'text-gray-600 dark:text-gray-400';
    case 'error': return 'text-red-500 dark:text-red-500 underline';
    default: return 'text-gray-900 dark:text-white';
  }
}

function getTokenLabel(token: Token): string {
  switch (token.type) {
    case 'anchor': return token.kind === 'start' ? 'Start (^)' : 'End ($)';
    case 'quantifier': return `Quantifier (${token.value}${token.greedy ? '' : '?'})`;
    case 'group': 
      if (token.isNonCapturing) return 'Non-capturing group (?:)';
      if (token.isLookahead) return 'Lookahead (?= / ?!)';
      if (token.isLookbehind) return 'Lookbehind (?<= / ?<!)';
      return `Capturing group #${token.index}`;
    case 'alternation': return 'Alternation (|)';
    case 'charClass': return `Character class ${token.negated ? '[^...]' : '[...]'}`;
    case 'escape': return `Escape (\\${token.value})`;
    case 'dot': return 'Any character (.)';
    case 'flag': return `Flag (${token.value})`;
    case 'error': return `Error: ${token.message}`;
    default: return 'Literal character';
  }
}

function generateRailroadDiagram(pattern: string): string {
  if (!pattern) return '';
  
  const escapeHtml = (str: string) => str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');

  let result = '<div class="railroad" style="font-family: monospace; line-height: 2.5;">';
  let i = 0;
  let depth = 0;
  
  while (i < pattern.length) {
    const char = pattern[i];
    
    if (char === '(') {
      if (i + 2 < pattern.length && pattern[i + 1] === '?' && pattern[i + 2] === ':') {
        result += '<span style="color: #3b82f6; font-weight: bold;">(?:</span>';
        i += 3;
      } else {
        depth++;
        result += `<span style="color: #10b981; font-weight: bold;">(</span>`;
        i++;
      }
    } else if (char === ')') {
      result += `<span style="color: #10b981; font-weight: bold;">)</span>`;
      i++;
    } else if (char === '|') {
      result += '<span style="color: #ef4444; font-weight: bold; padding: 0 4px;">|</span>';
      i++;
    } else if (char === '[') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\' && j + 1 < pattern.length) j += 2;
        else j++;
      }
      result += `<span style="color: #06b6d4;">${escapeHtml(pattern.slice(i, j + 1))}</span>`;
      i = j + 1;
    } else if (char === '\\') {
      if (i + 1 < pattern.length) {
        result += `<span style="color: #d946ef;">\\${escapeHtml(pattern[i + 1])}</span>`;
        i += 2;
      } else {
        result += '<span style="color: #ef4444;">\\</span>';
        i++;
      }
    } else if ('*+?'.includes(char)) {
      result += `<span style="color: #f97316; font-weight: bold;">${escapeHtml(char)}</span>`;
      i++;
    } else if (char === '{') {
      let j = i;
      while (j < pattern.length && pattern[j] !== '}') j++;
      if (j < pattern.length) {
        result += `<span style="color: #f97316; font-weight: bold;">${escapeHtml(pattern.slice(i, j + 1))}</span>`;
        i = j + 1;
      } else {
        result += '<span style="color: #ef4444;">{</span>';
        i++;
      }
    } else if (char === '^' || char === '$') {
      result += `<span style="color: #8b5cf6; font-weight: bold;">${escapeHtml(char)}</span>`;
      i++;
    } else if (char === '.') {
      result += '<span style="color: #f59e0b;">.</span>';
      i++;
    } else {
      result += `<span style="color: #374151;">${escapeHtml(char)}</span>`;
      i++;
    }
  }
  
  result += '</div>';
  return result;
}

function generateHighlightedText(testString: string, matches: Array<{ match: string; index: number; groups: string[]; length: number }>, regex: string, flags: string): React.ReactNode {
  if (!testString || matches.length === 0) return <span>{testString}</span>;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((m, i) => {
    if (m.index > lastIndex) {
      parts.push(<span key={`text-${i}`}>{testString.slice(lastIndex, m.index)}</span>);
    }
    parts.push(
      <mark key={`match-${i}`} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white rounded px-0.5" title={`Index: ${m.index}, Length: ${m.length}${m.groups.length ? ', Groups: ' + m.groups.join(', ') : ''}`}>
        {m.match}
      </mark>
    );
    lastIndex = m.index + m.length;
  });
  
  if (lastIndex < testString.length) {
    parts.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
  }
  
  return <span className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{parts}</span>;
}

export default function RegexVisualTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [regex, setRegex] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');
  const [activeToken, setActiveToken] = useState<Token | null>(null);

  // Validate regex and compute error state
  const isRegexValid = useMemo(() => {
    if (!regex) return true;
    try {
      new RegExp(regex, flags);
      return true;
    } catch {
      return false;
    }
  }, [regex, flags]);

  useEffect(() => {
    if (regex && !isRegexValid) {
      setError(t('devTools.regexTestError'));
    } else {
      setError('');
    }
  }, [regex, flags, isRegexValid, t]);

  const tokens = useMemo(() => {
    if (!regex) return [];
    return tokenizeRegex(regex, flags);
  }, [regex, flags]);

  const matches = useMemo(() => {
    if (!regex || !testString) return [];
    try {
      const regexObj = new RegExp(regex, flags + 'g');
      const results: Array<{ match: string; index: number; groups: string[]; length: number }> = [];
      let match;
      while ((match = regexObj.exec(testString)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          length: match[0].length,
        });
        if (!flags.includes('g')) break;
      }
      return results;
    } catch {
      return [];
    }
  }, [regex, flags, testString]);

  const highlightedText = useMemo(() => 
    generateHighlightedText(testString, matches, regex, flags),
  [testString, matches, regex, flags]);

  const railroadDiagramHtml = useMemo(() => 
    generateRailroadDiagram(regex),
  [regex]);

  const loadPreset = (pattern: string) => {
    setRegex(pattern);
    setError('');
  };

  const copyRegex = () => navigator.clipboard.writeText(regex);
  const copyTokens = () => navigator.clipboard.writeText(tokens.map(t => `${t.type}: ${t.raw}`).join('\n'));

  const clearAll = () => {
    setRegex('');
    setTestString('');
    setFlags('g');
    setError('');
  };

  const flagOptions = [
    { key: 'g', label: 'g (全局)', desc: '查找所有匹配' },
    { key: 'i', label: 'i (忽略大小写)', desc: '不区分大小写' },
    { key: 'm', label: 'm (多行)', desc: '^$ 匹配行首尾' },
    { key: 's', label: 's (单行)', desc: '. 匹配换行符' },
    { key: 'u', label: 'u (Unicode)', desc: 'Unicode 模式' },
    { key: 'y', label: 'y (粘连)', desc: '从 lastIndex 开始匹配' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.regexVisual')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.regexVisual')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.regexVisualDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.regexPattern')}</h3>
                <button onClick={copyRegex} disabled={!regex} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>{t('devTools.copy')}</button>
              </div>
              <textarea
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                className="w-full h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                placeholder={t('devTools.regexPlaceholder')}
                spellCheck={false}
              />
              {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.flags')}</h3>
              <div className="space-y-2">
                {flagOptions.map(opt => (
                  <label key={opt.key} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={flags.includes(opt.key)}
                      onChange={(e) => setFlags(e.target.checked ? flags + opt.key : flags.replace(opt.key, ''))}
                      className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.commonRegex')}</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {commonRegexes.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => loadPreset(item.pattern)}
                    className="w-full text-left p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors text-sm"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{item.desc}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">/{item.pattern}/{item.desc.includes('大小写') ? 'i' : ''}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={copyTokens} disabled={tokens.length === 0} className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>{t('devTools.copyTokens')}</button>
              <button onClick={clearAll} disabled={!regex && !testString} className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('devTools.clearAll')}</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.testString')}</h3>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                className="w-full h-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                placeholder={t('devTools.testStringPlaceholder')}
                spellCheck={false}
              />
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl min-h-[120px] max-h-64 overflow-auto">
                {matches.length > 0 ? (
                  <>
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{matches.length}</span> {t('devTools.matchesFound')}
                    </div>
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{highlightedText}</div>
                    <div className="mt-4 space-y-2">
                      {matches.map((m, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs">
                          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-2">
                            <span className="font-mono bg-white dark:bg-gray-900 px-2 py-0.5 rounded">{m.match}</span>
                            <span>索引: {m.index}</span>
                            <span>长度: {m.length}</span>
                            {m.groups.length > 0 && <span>分组: {m.groups.join(', ')}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : testString ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-gray-500 dark:text-gray-400">{t('devTools.noMatches')}</p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>{t('devTools.enterTestString')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.tokenizedRegex')}</h3>
                <button onClick={copyTokens} disabled={tokens.length === 0} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>{t('devTools.copy')}</button>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 min-h-[200px] max-h-96 overflow-auto">
                {tokens.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>{t('devTools.enterRegexToTokenize')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tokens.map((token, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveToken(activeToken === token ? null : token)}
                        onMouseEnter={() => setActiveToken(token)}
                        onMouseLeave={() => setActiveToken(null)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeToken === token ? 'bg-purple-50 dark:bg-purple-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      >
                        <span className={`font-mono text-sm px-2 py-1 rounded ${getTokenColor(token)} select-none`} title={getTokenLabel(token)}>
                          {token.raw}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{getTokenLabel(token)}</span>
                        {token.type === 'group' && !token.isNonCapturing && token.index > 0 && (
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">#${token.index}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {activeToken && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">{t('devTools.tokenDetail')}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-purple-700 dark:text-purple-300">{t('devTools.tokenType')}: </span><span className="text-gray-900 dark:text-white capitalize">{activeToken.type}</span></div>
                    <div><span className="text-purple-700 dark:text-purple-300">{t('devTools.tokenRaw')}: </span><span className="font-mono text-gray-900 dark:text-white">{activeToken.raw}</span></div>
                    <div className="col-span-2"><span className="text-purple-700 dark:text-purple-300">{t('devTools.tokenDescription')}: </span><span className="text-gray-900 dark:text-white">{getTokenLabel(activeToken)}</span></div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.railroadDiagram')}</h3>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 min-h-[200px] overflow-x-auto">
                <div className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: railroadDiagramHtml }} />
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">{t('devTools.railroadNote')}</p>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}