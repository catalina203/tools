'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type AngleMode = 'deg' | 'rad';

export default function ScientificCalcTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [memory, setMemory] = useState<number | null>(null);

  const toRadians = useCallback((deg: number) => deg * (Math.PI / 180), []);
  const toDegrees = useCallback((rad: number) => rad * (180 / Math.PI), []);

  const handleNumber = useCallback((n: string) => {
    setDisplay(prev => prev === '0' ? n : prev + n);
  }, []);

  const handleDecimal = useCallback(() => {
    if (!display.includes('.')) setDisplay(prev => prev + '.');
  }, [display]);

  const handleOperator = useCallback((op: string) => {
    setExpression(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  }, [display]);

  const handleFunction = useCallback((fn: string) => {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    let result: number;
    let label = '';

    switch (fn) {
      case 'sin': result = Math.sin(angleMode === 'deg' ? toRadians(val) : val); label = `sin(${display})`; break;
      case 'cos': result = Math.cos(angleMode === 'deg' ? toRadians(val) : val); label = `cos(${display})`; break;
      case 'tan': result = Math.tan(angleMode === 'deg' ? toRadians(val) : val); label = `tan(${display})`; break;
      case 'asin': result = Math.asin(val); label = `asin(${display})`; break;
      case 'acos': result = Math.acos(val); label = `acos(${display})`; break;
      case 'atan': result = Math.atan(val); label = `atan(${display})`; break;
      case 'log': result = Math.log10(val); label = `log(${display})`; break;
      case 'ln': result = Math.log(val); label = `ln(${display})`; break;
      case 'sqrt': result = Math.sqrt(val); label = `√(${display})`; break;
      case 'cbrt': result = Math.cbrt(val); label = `∛(${display})`; break;
      case 'square': result = val * val; label = `sq(${display})`; break;
      case 'cube': result = val * val * val; label = `cube(${display})`; break;
      case 'inv': result = val !== 0 ? 1 / val : NaN; label = `1/(${display})`; break;
      case 'fact': { result = factorial(val); label = `fact(${display})`; break; }
      case 'abs': result = Math.abs(val); label = `abs(${display})`; break;
      case 'floor': result = Math.floor(val); label = `floor(${display})`; break;
      case 'ceil': result = Math.ceil(val); label = `ceil(${display})`; break;
      case 'exp': result = Math.exp(val); label = `exp(${display})`; break;
      case 'pow2': result = Math.pow(2, val); label = `2^(${display})`; break;
      default: return;
    }

    const str = formatNumber(result);
    setDisplay(str);
    setExpression(`${label} =`);
    setHistory(prev => [`${label} = ${str}`, ...prev].slice(0, 50));
  }, [display, angleMode, toRadians]);

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n) || n > 170) return NaN;
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const formatNumber = (n: number): string => {
    if (!isFinite(n)) return 'Error';
    const str = String(n);
    if (str.length > 15) return n.toExponential(8);
    return str;
  };

  const calculate = useCallback(() => {
    try {
      const expr = expression + display;
      const sanitized = expr
        .replace(/×/g, '*').replace(/÷/g, '/')
        .replace(/π/g, String(Math.PI))
        .replace(/e(?![xp])/g, String(Math.E));
      const result = Function('"use strict"; return (' + sanitized + ')')();
      const str = formatNumber(result);
      setDisplay(str);
      setExpression(expr + ' =');
      setHistory(prev => [expr + ' = ' + str, ...prev].slice(0, 50));
    } catch {
      setDisplay('Error');
    }
  }, [expression, display]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setExpression('');
  }, []);

  const backspace = useCallback(() => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, []);

  const inputConst = useCallback((c: string) => {
    if (display === '0') setDisplay(c === 'pi' ? String(Math.PI) : String(Math.E));
    else setDisplay(prev => prev + (c === 'pi' ? String(Math.PI) : String(Math.E)));
  }, [display]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { handleNumber(e.key); return; }
      if (e.key === '.') { handleDecimal(); return; }
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); calculate(); return; }
      if (e.key === 'Escape') { clearAll(); return; }
      if (e.key === 'Backspace') { backspace(); return; }
      if (e.key === '+' || e.key === '-') { handleOperator(e.key); return; }
      if (e.key === '*') { handleOperator('×'); return; }
      if (e.key === '/') { e.preventDefault(); handleOperator('÷'); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNumber, handleDecimal, calculate, clearAll, backspace, handleOperator]);

  const btnClass = "h-12 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 select-none";
  const sciClass = `${btnClass} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
  const numClass = `${btnClass} bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800`;
  const opClass = `${btnClass} bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30`;
  const eqClass = `${btnClass} bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.scientificCalc')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.scientificCalc')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.scientificCalcDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 max-w-xl mx-auto w-full">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${angleMode === 'deg' ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>{angleMode.toUpperCase()}</button>
                <div className="flex gap-1">
                  <button onClick={() => setMemory(parseFloat(display))} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">MS</button>
                  <button onClick={() => memory !== null && setDisplay(formatNumber(memory))} disabled={memory === null} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">MR</button>
                  <button onClick={() => setMemory(null)} disabled={memory === null} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">MC</button>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-right text-sm text-gray-500 dark:text-gray-400 h-6 overflow-hidden text-ellipsis whitespace-nowrap">{expression}</div>
                <div className="text-right text-4xl font-bold text-gray-900 dark:text-white h-14 overflow-hidden">{display}</div>
              </div>
              <div className="space-y-1.5">
                <div className="grid grid-cols-5 gap-1.5">
                  <button onClick={() => handleFunction('sin')} className={sciClass}>sin</button>
                  <button onClick={() => handleFunction('cos')} className={sciClass}>cos</button>
                  <button onClick={() => handleFunction('tan')} className={sciClass}>tan</button>
                  <button onClick={() => handleFunction('log')} className={sciClass}>log</button>
                  <button onClick={() => handleFunction('ln')} className={sciClass}>ln</button>
                  <button onClick={() => handleFunction('asin')} className={sciClass}>asin</button>
                  <button onClick={() => handleFunction('acos')} className={sciClass}>acos</button>
                  <button onClick={() => handleFunction('atan')} className={sciClass}>atan</button>
                  <button onClick={() => inputConst('pi')} className={sciClass}>π</button>
                  <button onClick={() => inputConst('e')} className={sciClass}>e</button>
                  <button onClick={() => handleFunction('sqrt')} className={sciClass}>√</button>
                  <button onClick={() => handleFunction('cbrt')} className={sciClass}>∛</button>
                  <button onClick={() => handleFunction('square')} className={sciClass}>x²</button>
                  <button onClick={() => handleFunction('cube')} className={sciClass}>x³</button>
                  <button onClick={() => handleFunction('inv')} className={sciClass}>1/x</button>
                  <button onClick={() => handleFunction('exp')} className={sciClass}>eˣ</button>
                  <button onClick={() => handleFunction('pow2')} className={sciClass}>2ˣ</button>
                  <button onClick={() => handleFunction('abs')} className={sciClass}>|x|</button>
                  <button onClick={() => handleFunction('floor')} className={sciClass}>floor</button>
                  <button onClick={() => handleFunction('ceil')} className={sciClass}>ceil</button>
                </div>
                <div className="border-t border-gray-200 dark:border-white/10 pt-1.5">
                  <div className="grid grid-cols-4 gap-1.5">
                    <button onClick={clearAll} className={`${sciClass} !bg-red-100 dark:!bg-red-500/20 !text-red-600 dark:!text-red-400`}>AC</button>
                    <button onClick={backspace} className={sciClass}>⌫</button>
                    <button onClick={() => handleFunction('fact')} className={sciClass}>n!</button>
                    <button onClick={() => handleOperator('÷')} className={opClass}>÷</button>
                    <button onClick={() => handleNumber('7')} className={numClass}>7</button>
                    <button onClick={() => handleNumber('8')} className={numClass}>8</button>
                    <button onClick={() => handleNumber('9')} className={numClass}>9</button>
                    <button onClick={() => handleOperator('×')} className={opClass}>×</button>
                    <button onClick={() => handleNumber('4')} className={numClass}>4</button>
                    <button onClick={() => handleNumber('5')} className={numClass}>5</button>
                    <button onClick={() => handleNumber('6')} className={numClass}>6</button>
                    <button onClick={() => handleOperator('-')} className={opClass}>-</button>
                    <button onClick={() => handleNumber('1')} className={numClass}>1</button>
                    <button onClick={() => handleNumber('2')} className={numClass}>2</button>
                    <button onClick={() => handleNumber('3')} className={numClass}>3</button>
                    <button onClick={() => handleOperator('+')} className={opClass}>+</button>
                    <button onClick={() => handleNumber('0')} className={`${numClass} col-span-2`}>0</button>
                    <button onClick={handleDecimal} className={numClass}>.</button>
                    <button onClick={calculate} className={eqClass}>=</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.calculatorHistory')}</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{t('efficiencyTools.calculatorNoHistory')}</p>
                ) : (
                  history.map((item, i) => (
                    <div key={i} className="text-sm text-gray-600 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-white/5 last:border-0 font-mono">{item}</div>
                  ))
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
