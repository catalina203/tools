'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data';

interface CommonConv {
  from: string;
  to: string;
  value: number;
}

const CATEGORIES: UnitCategory[] = [
  'length', 'weight', 'temperature', 'area', 'volume', 'speed', 'time', 'data',
];

const BASE_FACTORS: Record<string, Record<string, number>> = {
  length: {
    mm: 0.001, cm: 0.01, m: 1, km: 1000,
    inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344,
  },
  weight: {
    mg: 0.000001, g: 0.001, kg: 1, ton: 1000,
    oz: 0.0283495, lb: 0.453592,
  },
  area: {
    mm2: 0.000001, cm2: 0.0001, m2: 1, km2: 1000000,
    hectare: 10000, acre: 4046.86, ft2: 0.092903,
  },
  volume: {
    mL: 0.001, L: 1, m3: 1000,
    gal: 3.78541, qt: 0.946353, cup: 0.236588, flOz: 0.0295735,
  },
  speed: {
    m_s: 1, km_h: 0.277778, mph: 0.44704, knot: 0.514444, ft_s: 0.3048,
  },
  time: {
    ms: 0.001, s: 1, min: 60, hour: 3600, day: 86400,
    week: 604800, month: 2592000, year: 31536000,
  },
  data: {
    bit: 0.125, byte: 1, kb: 1000, mb: 1000000, gb: 1000000000, tb: 1000000000000,
  },
};

const UNIT_KEYS: Record<string, string[]> = {
  length: ['mm', 'cm', 'm', 'km', 'inch', 'foot', 'yard', 'mile'],
  weight: ['mg', 'g', 'kg', 'ton', 'oz', 'lb'],
  temperature: ['celsius', 'fahrenheit', 'kelvin'],
  area: ['mm2', 'cm2', 'm2', 'km2', 'hectare', 'acre', 'ft2'],
  volume: ['mL', 'L', 'm3', 'gal', 'qt', 'cup', 'flOz'],
  speed: ['m_s', 'km_h', 'mph', 'knot', 'ft_s'],
  time: ['ms', 's', 'min', 'hour', 'day', 'week', 'month', 'year'],
  data: ['bit', 'byte', 'kb', 'mb', 'gb', 'tb'],
};

const DEFAULT_UNITS: Record<string, { from: string; to: string }> = {
  length: { from: 'm', to: 'km' },
  weight: { from: 'kg', to: 'lb' },
  temperature: { from: 'celsius', to: 'fahrenheit' },
  area: { from: 'm2', to: 'km2' },
  volume: { from: 'L', to: 'gal' },
  speed: { from: 'm_s', to: 'km_h' },
  time: { from: 'hour', to: 'min' },
  data: { from: 'mb', to: 'kb' },
};

const COMMON_CONVERSIONS: Record<string, CommonConv[]> = {
  length: [
    { from: 'inch', to: 'cm', value: 1 },
    { from: 'foot', to: 'm', value: 1 },
    { from: 'mile', to: 'km', value: 1 },
    { from: 'yard', to: 'm', value: 1 },
  ],
  weight: [
    { from: 'kg', to: 'lb', value: 1 },
    { from: 'lb', to: 'kg', value: 1 },
    { from: 'oz', to: 'g', value: 1 },
    { from: 'ton', to: 'kg', value: 1 },
  ],
  temperature: [
    { from: 'celsius', to: 'fahrenheit', value: 0 },
    { from: 'celsius', to: 'kelvin', value: 0 },
    { from: 'fahrenheit', to: 'celsius', value: 32 },
    { from: 'kelvin', to: 'celsius', value: 273.15 },
  ],
  area: [
    { from: 'm2', to: 'ft2', value: 1 },
    { from: 'hectare', to: 'acre', value: 1 },
    { from: 'km2', to: 'hectare', value: 1 },
    { from: 'acre', to: 'm2', value: 1 },
  ],
  volume: [
    { from: 'L', to: 'gal', value: 1 },
    { from: 'gal', to: 'L', value: 1 },
    { from: 'cup', to: 'mL', value: 1 },
    { from: 'flOz', to: 'mL', value: 8 },
  ],
  speed: [
    { from: 'm_s', to: 'km_h', value: 1 },
    { from: 'mph', to: 'km_h', value: 1 },
    { from: 'knot', to: 'km_h', value: 1 },
    { from: 'km_h', to: 'mph', value: 100 },
  ],
  time: [
    { from: 'hour', to: 'min', value: 1 },
    { from: 'day', to: 'hour', value: 1 },
    { from: 'week', to: 'day', value: 1 },
    { from: 'year', to: 'day', value: 1 },
  ],
  data: [
    { from: 'byte', to: 'bit', value: 1 },
    { from: 'mb', to: 'kb', value: 1 },
    { from: 'gb', to: 'mb', value: 1 },
    { from: 'tb', to: 'gb', value: 1 },
  ],
};

function toBase(value: number, unit: string, category: string): number {
  if (category === 'temperature') {
    switch (unit) {
      case 'celsius': return value;
      case 'fahrenheit': return (value - 32) * 5 / 9;
      case 'kelvin': return value - 273.15;
      default: return value;
    }
  }
  const factors = BASE_FACTORS[category];
  return factors ? value * (factors[unit] ?? 1) : value;
}

function fromBase(value: number, unit: string, category: string): number {
  if (category === 'temperature') {
    switch (unit) {
      case 'celsius': return value;
      case 'fahrenheit': return value * 9 / 5 + 32;
      case 'kelvin': return value + 273.15;
      default: return value;
    }
  }
  const factors = BASE_FACTORS[category];
  return factors ? value / (factors[unit] ?? 1) : value;
}

function doConvert(value: number, from: string, to: string, category: string): number {
  if (from === to) return value;
  const base = toBase(value, from, category);
  return fromBase(base, to, category);
}

function formatResult(value: number): string {
  if (!isFinite(value)) return '0';
  if (Math.abs(value) >= 1e12 || (Math.abs(value) < 1e-8 && value !== 0)) {
    return value.toExponential(6);
  }
  let str = value.toPrecision(10);
  str = str.replace(/\.?0+$/, '');
  return str;
}

export default function UnitConvertTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');

  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [fromText, setFromText] = useState('1');
  const [toText, setToText] = useState('');
  const [editingSide, setEditingSide] = useState<'from' | 'to'>('from');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const defaults = DEFAULT_UNITS[category];
    setFromUnit(defaults.from);
    setToUnit(defaults.to);
    setFromText('1');
    setToText('');
    setEditingSide('from');
  }, [category]);

  useEffect(() => {
    if (editingSide === 'from') {
      const num = parseFloat(fromText);
      if (!isNaN(num)) {
        setToText(formatResult(doConvert(num, fromUnit, toUnit, category)));
      } else {
        setToText('');
      }
    } else {
      const num = parseFloat(toText);
      if (!isNaN(num)) {
        setFromText(formatResult(doConvert(num, toUnit, fromUnit, category)));
      } else {
        setFromText('');
      }
    }
  }, [fromText, toText, fromUnit, toUnit, category, editingSide]);

  const handleFromChange = (v: string) => {
    setEditingSide('from');
    setFromText(v);
  };

  const handleToChange = (v: string) => {
    setEditingSide('to');
    setToText(v);
  };

  const handleSwap = () => {
    const oldFromUnit = fromUnit;
    const oldFromText = fromText;
    setFromUnit(toUnit);
    setToUnit(oldFromUnit);
    setFromText(toText);
    setToText(oldFromText);
    setEditingSide(editingSide === 'from' ? 'to' : 'from');
  };

  const handleCopy = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const commonConvs = COMMON_CONVERSIONS[category] || [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('devTools.unitConvert')}</span>
        </div>
        <div className="flex items-center space-x-3"><LanguageSwitcher /><ThemeToggle /></div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('devTools.unitConvert')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('devTools.unitConvertDesc')}</p>
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  category === cat
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                }`}
              >
                {t(`devTools.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-1 w-full space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.from')}</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {UNIT_KEYS[category]?.map((key) => (
                  <option key={key} value={key}>{t(`devTools.${key}`)}</option>
                ))}
              </select>
              <input
                type="text"
                value={fromText}
                onChange={(e) => handleFromChange(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            <button
              onClick={handleSwap}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-md"
              title={t('devTools.swap')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            <div className="flex-1 w-full space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('devTools.to')}</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {UNIT_KEYS[category]?.map((key) => (
                  <option key={key} value={key}>{t(`devTools.${key}`)}</option>
                ))}
              </select>
              <input
                type="text"
                value={toText}
                onChange={(e) => handleToChange(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('devTools.commonConversions')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {commonConvs.map((conv, index) => {
              const result = doConvert(conv.value, conv.from, conv.to, category);
              const formatted = formatResult(result);
              const text = `${conv.value} ${t(`devTools.${conv.from}`)} = ${formatted} ${t(`devTools.${conv.to}`)}`;
              return (
                <button
                  key={index}
                  onClick={() => handleCopy(index, text)}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-left hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 group"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {conv.value} {t(`devTools.${conv.from}`)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    = {formatted} {t(`devTools.${conv.to}`)}
                  </div>
                  <div className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === index ? t('devTools.copied') : t('devTools.copy')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
