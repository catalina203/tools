'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const LANG_MAP: Record<string, string> = {
  js: 'JavaScript', ts: 'TypeScript', html: 'HTML', css: 'CSS',
  json: 'JSON', xml: 'XML', md: 'Markdown', py: 'Python',
  java: 'Java', cpp: 'C++', c: 'C', cs: 'C#', go: 'Go',
  rs: 'Rust', php: 'PHP', rb: 'Ruby', swift: 'Swift',
  sql: 'SQL', sh: 'Shell', yml: 'YAML', yaml: 'YAML',
  txt: 'Text',
};

export default function EditorTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const tf = useTranslations('tools');

  const [code, setCode] = useState('// Write your code here\n');
  const [lang, setLang] = useState('JavaScript');
  const [fileName, setFileName] = useState('code.js');
  const [lineCount, setLineCount] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    setLineCount(val.split('\n').length);
  };

  const detectLang = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return LANG_MAP[ext] || 'Text';
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFileName(name);
    setLang(detectLang(name));
  };

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const clearCode = () => {
    setCode('');
    setLineCount(1);
  };

  const insertTab = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newVal);
      setLineCount(newVal.split('\n').length);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }
  }, [code]);

  const presets = [
    { name: 'JavaScript', file: 'script.js', content: '// JavaScript Example\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n' },
    { name: 'TypeScript', file: 'app.ts', content: '// TypeScript Example\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = { name: "Alice", age: 30 };\nconsole.log(user);\n' },
    { name: 'HTML', file: 'index.html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Hello</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n' },
    { name: 'CSS', file: 'style.css', content: '/* CSS Example */\nbody {\n  margin: 0;\n  padding: 20px;\n  font-family: system-ui, sans-serif;\n  background: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n  text-align: center;\n}\n' },
    { name: 'JSON', file: 'data.json', content: '{\n  "name": "Example",\n  "version": "1.0.0",\n  "dependencies": {},\n  "scripts": {\n    "start": "node index.js"\n  }\n}\n' },
    { name: 'Python', file: 'main.py', content: '# Python Example\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=" ")\n        a, b = b, a + b\n    print()\n\nfibonacci(10)\n' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{tf('fileTools.editor')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{tf('fileTools.editor')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tf('fileTools.editorDesc')}</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <input type="text" value={fileName} onChange={handleFileNameChange} className="w-40 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <span className="px-2.5 py-1.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">{lang}</span>
              <div className="flex-1" />
              <div className="flex gap-2">
                <button onClick={copyCode} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:border-indigo-300 transition-colors">{tf('fileTools.editorCopy')}</button>
                <button onClick={download} className="px-3 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-lg hover:from-indigo-400 hover:to-violet-400 transition-all">{tf('fileTools.editorDownload')}</button>
                <button onClick={clearCode} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{tf('fileTools.editorClear')}</button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.name} onClick={() => { setCode(p.content); setFileName(p.file); setLang(p.name); setLineCount(p.content.split('\n').length); }} className="px-3 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors">
                {p.name}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="flex">
              <div className="select-none px-3 py-4 text-right text-xs leading-5 font-mono text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800/50 border-r border-gray-200 dark:border-white/10 min-w-[3rem]">
                {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={insertTab}
                className="flex-1 p-4 text-sm font-mono leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none min-h-[400px]"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {lineCount} {tf('fileTools.editorLines')} | {code.length} {tf('fileTools.editorChars')}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
