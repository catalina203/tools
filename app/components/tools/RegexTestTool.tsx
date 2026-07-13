'use client';

import { useState, useMemo } from 'react';
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

export default function RegexTestTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false, y: false });
  const [error, setError] = useState('');
  const [replaceString, setReplaceString] = useState('');

  const flagKeys = ['g', 'i', 'm', 's', 'u', 'y'] as const;
  const flagLabels = {
    g: { label: 'g (全局)', desc: '查找所有匹配' },
    i: { label: 'i (忽略大小写)', desc: '不区分大小写' },
    m: { label: 'm (多行)', desc: '^$ 匹配行首尾' },
    s: { label: 's (单行)', desc: '. 匹配换行符' },
    u: { label: 'u (Unicode)', desc: 'Unicode 模式' },
    y: { label: 'y (粘连)', desc: '从 lastIndex 开始匹配' },
  };

  const regexObj = useMemo(() => {
    if (!regex) return null;
    try {
      const flagStr = flagKeys.filter(k => flags[k]).join('');
      return new RegExp(regex, flagStr);
    } catch {
      return null;
    }
  }, [regex, flags]);

  const matches = useMemo(() => {
    if (!regexObj || !testString) return [];
    const results: Array<{ match: string; index: number; groups: string[]; length: number }> = [];
    const localRegex = new RegExp(regexObj.source, regexObj.flags + 'g');
    let match;
    while ((match = localRegex.exec(testString)) !== null) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        length: match[0].length,
      });
      if (!regexObj.flags.includes('g')) break;
    }
    return results;
  }, [regexObj, testString]);

  const highlightedText = useMemo(() => {
    if (!testString || matches.length === 0) return <span>{testString}</span>;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((m, i) => {
      if (m.index > lastIndex) {
        parts.push(<span key={`text-${i}`}>{testString.slice(lastIndex, m.index)}</span>);
      }
      parts.push(
        <mark key={`match-${i}`} className="bg-yellow-200 dark:bg-yellow-800 text-black dark:text-white rounded px-0.5" title={`索引: ${m.index}, 长度: ${m.length}${m.groups.length ? ', 分组: ' + m.groups.join(', ') : ''}`}>
          {m.match}
        </mark>
      );
      lastIndex = m.index + m.length;
    });
    
    if (lastIndex < testString.length) {
      parts.push(<span key="text-end">{testString.slice(lastIndex)}</span>);
    }
    
    return <span className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{parts}</span>;
  }, [testString, matches]);

  const replacedText = useMemo(() => {
    if (!regexObj || !testString || !replaceString) return '';
    try {
      return testString.replace(new RegExp(regexObj.source, regexObj.flags + 'g'), replaceString);
    } catch {
      return '';
    }
  }, [regexObj, testString, replaceString]);

  const handleRegexChange = (value: string) => {
    setRegex(value);
    setError('');
    try {
      new RegExp(value, flagKeys.filter(k => flags[k]).join(''));
    } catch (e) {
      if (value) setError(t('devTools.regexTestError'));
    }
  };

  const loadPreset = (pattern: string) => {
    setRegex(pattern);
    setError('');
  };

  const copyRegex = () => navigator.clipboard.writeText(regex);
  const copyTestString = () => navigator.clipboard.writeText(testString);
  const copyMatches = () => navigator.clipboard.writeText(matches.map(m => m.match).join('\n'));
  const copyReplaced = () => navigator.clipboard.writeText(replacedText);

  const clearAll = () => {
    setRegex('');
    setTestString('');
    setReplaceString('');
    setError('');
    Object.keys(flags).forEach(k => setFlags(prev => ({ ...prev, [k]: k === 'g' })));
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
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.regexTest')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.regexTest')}</h1><p className="text-gray-500 dark:text-gray-400">{t('devTools.regexTestDesc')}</p></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.regexPattern')}</h3>
                <button onClick={copyRegex} disabled={!regex} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>{t('devTools.copy')}</button>
              </div>
              <textarea
                value={regex}
                onChange={(e) => handleRegexChange(e.target.value)}
                className="w-full h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                placeholder={t('devTools.regexPlaceholder')}
                spellCheck={false}
              />
              {error && <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{error}</p>}
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.flags')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {flagKeys.map(key => (
                  <label key={key} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={flags[key as keyof typeof flags]}
                      onChange={(e) => setFlags(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{flagLabels[key].label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{flagLabels[key].desc}</span>
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

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.replace')}</h3>
              <input
                type="text"
                value={replaceString}
                onChange={(e) => setReplaceString(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                placeholder={t('devTools.replacePlaceholder')}
              />
              {replaceString && replacedText && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('devTools.replaceResult')}</span>
                    <button onClick={copyReplaced} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>{t('devTools.copy')}</button>
                  </div>
                  <div className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg max-h-40 overflow-auto">{replacedText}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button onClick={copyMatches} disabled={matches.length === 0} className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-10a2 2 0 01-2-2V5z" /></svg>{t('devTools.copyMatches')}</button>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.matchDetails')}</h3>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 min-h-[200px] max-h-96 overflow-auto">
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>{t('devTools.noMatchDetails')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {matches.map((m, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-3">
                          <div><span className="text-gray-500 dark:text-gray-400 text-xs">{t('devTools.fullMatch')}</span><div className="font-mono text-sm bg-white dark:bg-gray-900 px-2 py-1 rounded">{m.match}</div></div>
                          <div><span className="text-gray-500 dark:text-gray-400 text-xs">{t('devTools.index')}</span><div className="font-mono text-sm">{m.index}</div></div>
                          <div><span className="text-gray-500 dark:text-gray-400 text-xs">{t('devTools.length')}</span><div className="font-mono text-sm">{m.length}</div></div>
                          <div><span className="text-gray-500 dark:text-gray-400 text-xs">{t('devTools.groups')}</span><div className="font-mono text-sm">{m.groups.length > 0 ? m.groups.join(', ') : t('devTools.none')}</div></div>
                        </div>
                        {m.groups.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-white/10 pt-3">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">{t('devTools.capturingGroups')}</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {m.groups.map((g, gi) => (
                                <span key={gi} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded text-xs font-mono">#{gi + 1}: {g}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.quickRef')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  { char: '\\d', desc: t('devTools.refDigit') },
                  { char: '\\D', desc: t('devTools.refNonDigit') },
                  { char: '\\w', desc: t('devTools.refWord') },
                  { char: '\\W', desc: t('devTools.refNonWord') },
                  { char: '\\s', desc: t('devTools.refWhitespace') },
                  { char: '\\S', desc: t('devTools.refNonWhitespace') },
                  { char: '.', desc: t('devTools.refAnyChar') },
                  { char: '^', desc: t('devTools.refStart') },
                  { char: '$', desc: t('devTools.refEnd') },
                  { char: '*', desc: t('devTools.refZeroOrMore') },
                  { char: '+', desc: t('devTools.refOneOrMore') },
                  { char: '?', desc: t('devTools.refZeroOrOne') },
                  { char: '{n}', desc: t('devTools.refExactly') },
                  { char: '{n,}', desc: t('devTools.refAtLeast') },
                  { char: '{n,m}', desc: t('devTools.refRange') },
                  { char: '|', desc: t('devTools.refOr') },
                  { char: '()', desc: t('devTools.refGroup') },
                  { char: '(?:)', desc: t('devTools.refNonCapture') },
                  { char: '(?=)', desc: t('devTools.refLookahead') },
                  { char: '(?!)', desc: t('devTools.refNegLookahead') },
                  { char: '(?<=)', desc: t('devTools.refLookbehind') },
                  { char: '(?<!)', desc: t('devTools.refNegLookbehind') },
                  { char: '[]', desc: t('devTools.refCharClass') },
                  { char: '[^]', desc: t('devTools.refNegCharClass') },
                  { char: '\\b', desc: t('devTools.refWordBoundary') },
                  { char: '\\B', desc: t('devTools.refNonWordBoundary') },
                ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg p-3 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors">
                    <code className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded">{item.char}</code>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}