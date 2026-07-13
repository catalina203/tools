'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type Operator = '+' | '-' | '×' | '÷' | null;

export default function CalculatorTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatNumber = (n: number): string => {
    if (!isFinite(n)) return 'Error';
    const str = String(n);
    if (str.length > 15) return n.toExponential(6);
    return str;
  };

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(prev => prev === '0' ? digit : prev + digit);
    }
  }, [waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const toggleSign = useCallback(() => {
    if (display !== '0') {
      setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
    }
  }, [display]);

  const percent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(formatNumber(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOp: Operator) => {
    const currentValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(currentValue);
    } else if (operator) {
      const result = calculate(prevValue, currentValue, operator);
      setDisplay(formatNumber(result));
      setPrevValue(result);
    }

    setOperator(nextOp);
    setWaitingForOperand(true);

    if (nextOp) {
      const opSymbol = nextOp;
      setExpression(prev => prev ? `${prev} ${display} ${opSymbol}` : `${display} ${opSymbol}`);
    }
  }, [display, prevValue, operator]);

  const calculate = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : NaN;
      default: return b;
    }
  };

  const equals = useCallback(() => {
    const currentValue = parseFloat(display);

    if (prevValue !== null && operator) {
      const fullExpr = `${prevValue} ${operator} ${currentValue}`;
      const result = calculate(prevValue, currentValue, operator);
      const resultStr = formatNumber(result);
      setDisplay(resultStr);
      setExpression(`${fullExpr} =`);
      setHistory(prev => [`${fullExpr} = ${resultStr}`, ...prev].slice(0, 20));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  }, [display, prevValue, operator]);

  const backspace = useCallback(() => {
    if (waitingForOperand) return;
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  }, [waitingForOperand]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); return; }
      if (e.key === '.') { inputDecimal(); return; }
      if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); equals(); return; }
      if (e.key === 'Escape') { clearAll(); return; }
      if (e.key === 'Backspace') { backspace(); return; }
      if (e.key === '+' || e.key === '-') { performOperation(e.key as Operator); return; }
      if (e.key === '*') { performOperation('×'); return; }
      if (e.key === '/') { e.preventDefault(); performOperation('÷'); return; }
      if (e.key === '%') { percent(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDecimal, equals, clearAll, backspace, performOperation, percent]);

  const buttonClass = "h-16 text-xl font-semibold rounded-xl transition-all duration-200 active:scale-95 select-none";
  const numberClass = `${buttonClass} bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700`;
  const operatorClass = `${buttonClass} bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30`;
  const funcClass = `${buttonClass} bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600`;
  const equalsClass = `${buttonClass} bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/30`;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.calculator')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.calculator')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.calculatorDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 max-w-md mx-auto w-full">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="mb-4">
                <div className="text-right text-sm text-gray-500 dark:text-gray-400 h-6 overflow-hidden">{expression}</div>
                <div className="text-right text-4xl font-bold text-gray-900 dark:text-white h-14 overflow-hidden">
                  {display}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={clearAll} className={funcClass}>AC</button>
                <button onClick={clearEntry} className={funcClass}>CE</button>
                <button onClick={backspace} className={funcClass}>
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
                </button>
                <button onClick={() => performOperation('÷')} className={operatorClass}>÷</button>

                <button onClick={() => inputDigit('7')} className={numberClass}>7</button>
                <button onClick={() => inputDigit('8')} className={numberClass}>8</button>
                <button onClick={() => inputDigit('9')} className={numberClass}>9</button>
                <button onClick={() => performOperation('×')} className={operatorClass}>×</button>

                <button onClick={() => inputDigit('4')} className={numberClass}>4</button>
                <button onClick={() => inputDigit('5')} className={numberClass}>5</button>
                <button onClick={() => inputDigit('6')} className={numberClass}>6</button>
                <button onClick={() => performOperation('-')} className={operatorClass}>-</button>

                <button onClick={() => inputDigit('1')} className={numberClass}>1</button>
                <button onClick={() => inputDigit('2')} className={numberClass}>2</button>
                <button onClick={() => inputDigit('3')} className={numberClass}>3</button>
                <button onClick={() => performOperation('+')} className={operatorClass}>+</button>

                <button onClick={toggleSign} className={funcClass}>±</button>
                <button onClick={() => inputDigit('0')} className={numberClass}>0</button>
                <button onClick={inputDecimal} className={numberClass}>.</button>
                <button onClick={equals} className={equalsClass}>=</button>
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
                    <div key={i} className="text-sm text-gray-600 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-white/5 last:border-0">{item}</div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.tips')}</h3>
              <ul className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-start gap-2"><span className="text-violet-500">•</span>{t('efficiencyTools.calculatorTip1')}</li>
                <li className="flex items-start gap-2"><span className="text-violet-500">•</span>{t('efficiencyTools.calculatorTip2')}</li>
                <li className="flex items-start gap-2"><span className="text-violet-500">•</span>{t('efficiencyTools.calculatorTip3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
