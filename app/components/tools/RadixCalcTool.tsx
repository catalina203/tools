'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

const BASES = [
  { base: 2, label: 'BIN', icon: '01' },
  { base: 3, label: 'BASE3', icon: '0-2' },
  { base: 4, label: 'BASE4', icon: '0-3' },
  { base: 5, label: 'BASE5', icon: '0-4' },
  { base: 6, label: 'BASE6', icon: '0-5' },
  { base: 7, label: 'BASE7', icon: '0-6' },
  { base: 8, label: 'OCT', icon: '0-7' },
  { base: 9, label: 'BASE9', icon: '0-8' },
  { base: 10, label: 'DEC', icon: '0-9' },
  { base: 11, label: 'BASE11', icon: '0-A' },
  { base: 12, label: 'BASE12', icon: '0-B' },
  { base: 13, label: 'BASE13', icon: '0-C' },
  { base: 14, label: 'BASE14', icon: '0-D' },
  { base: 15, label: 'BASE15', icon: '0-E' },
  { base: 16, label: 'HEX', icon: '0-F' },
  { base: 17, label: 'BASE17', icon: '0-G' },
  { base: 18, label: 'BASE18', icon: '0-H' },
  { base: 19, label: 'BASE19', icon: '0-I' },
  { base: 20, label: 'BASE20', icon: '0-J' },
  { base: 21, label: 'BASE21', icon: '0-K' },
  { base: 22, label: 'BASE22', icon: '0-L' },
  { base: 23, label: 'BASE23', icon: '0-M' },
  { base: 24, label: 'BASE24', icon: '0-N' },
  { base: 25, label: 'BASE25', icon: '0-O' },
  { base: 26, label: 'BASE26', icon: '0-P' },
  { base: 27, label: 'BASE27', icon: '0-Q' },
  { base: 28, label: 'BASE28', icon: '0-R' },
  { base: 29, label: 'BASE29', icon: '0-S' },
  { base: 30, label: 'BASE30', icon: '0-T' },
  { base: 31, label: 'BASE31', icon: '0-U' },
  { base: 32, label: 'BASE32', icon: '0-V' },
  { base: 33, label: 'BASE33', icon: '0-W' },
  { base: 34, label: 'BASE34', icon: '0-X' },
  { base: 35, label: 'BASE35', icon: '0-Y' },
  { base: 36, label: 'BASE36', icon: '0-Z' },
];

const COMMON_BASES = BASES.filter(b => [2, 8, 10, 16].includes(b.base));

export default function RadixCalcTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [inputValue, setInputValue] = useState('255');
  const [inputBase, setInputBase] = useState(10);
  const [showAll, setShowAll] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const decimalValue = useMemo(() => {
    const str = inputValue.trim();
    if (!str) return { value: NaN, error: false };
    const val = parseInt(str, inputBase);
    return { value: val, error: isNaN(val) };
  }, [inputValue, inputBase]);

  const conversions = useMemo(() => {
    if (decimalValue.error || isNaN(decimalValue.value)) return [];
    const bases = showAll ? BASES : COMMON_BASES;
    return bases.map(({ base, label, icon }) => ({
      base,
      label,
      icon,
      value: decimalValue.value.toString(base).toUpperCase(),
    }));
  }, [decimalValue, showAll]);

  const addToHistory = useCallback(() => {
    if (!decimalValue.error && !isNaN(decimalValue.value)) {
      const entry = `DEC ${decimalValue.value}  =  HEX ${decimalValue.value.toString(16).toUpperCase()}  =  BIN ${decimalValue.value.toString(2).toUpperCase()}  =  OCT ${decimalValue.value.toString(8).toUpperCase()}`;
      setHistory(prev => [entry, ...prev].slice(0, 50));
    }
  }, [decimalValue]);

  const copyValue = (val: string) => {
    navigator.clipboard.writeText(val);
  };

  const inputDigits = BASES.find(b => b.base === inputBase)?.icon || '0-9';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('efficiencyTools.radixCalc')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('efficiencyTools.radixCalc')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('efficiencyTools.radixCalcDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.radixCalcInput')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('efficiencyTools.radixCalcBase')}</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[2, 8, 10, 16].map((b) => (
                      <button key={b} onClick={() => { setInputBase(b); setInputValue(''); }} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${inputBase === b ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50'}`}>
                        {BASES.find(bb => bb.base === b)?.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    placeholder={`${t('efficiencyTools.radixCalcEnter')} (${inputDigits})`}
                    className="w-full h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 text-gray-900 dark:text-white placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  {decimalValue.error && inputValue && (
                    <p className="text-red-500 text-xs mt-1">{t('efficiencyTools.radixCalcInvalid')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={addToHistory} disabled={decimalValue.error || !inputValue} className="flex-1 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed">{t('efficiencyTools.radixCalcConvert')}</button>
                  <button onClick={() => setShowAll(!showAll)} className={`px-4 py-3.5 rounded-xl font-medium text-sm transition-all ${showAll ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{showAll ? t('efficiencyTools.radixCalcCommon') : t('efficiencyTools.radixCalcAll')}</button>
                </div>
              </div>
            </div>

            {history.length > 0 && (
              <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.calculatorHistory')}</h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {history.map((item, i) => (
                    <div key={i} className="p-2 text-sm font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl">{item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('efficiencyTools.results')}</h3>
              {conversions.length > 0 ? (
                <div className="space-y-2">
                  {conversions.map(({ base, label, icon, value }, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl hover:border-violet-300 dark:hover:border-violet-500/50 transition-colors group cursor-pointer" onClick={() => copyValue(value)}>
                      <div className="w-14 h-10 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-violet-600 dark:text-violet-400 flex-shrink-0">{label}</div>
                      <span className="flex-1 font-mono text-lg text-gray-900 dark:text-white tracking-wide">{value}</span>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{t('efficiencyTools.copy')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <span className="text-5xl mb-4 block">🔢</span>
                  <p>{t('efficiencyTools.radixCalcEmpty')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
