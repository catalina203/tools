'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import LanguageSwitcher from '@/app/components/LanguageSwitcher';
import ThemeToggle from '@/app/components/ThemeToggle';

type DataPoint = { label: string; value: number };
type ChartType = 'bar' | 'line' | 'pie';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316', '#14b8a6', '#84cc16', '#e11d48', '#3b82f6'];

function BarChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const w = Math.max(600, data.length * 60);
  const h = 300;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-3xl mx-auto">
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="currentColor" className="text-gray-300 dark:text-gray-600" />
      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="currentColor" className="text-gray-300 dark:text-gray-600" />
      {[0, 0.25, 0.5, 0.75, 1].map((r) => (
        <g key={r}>
          <text x={pad.left - 8} y={pad.top + chartH - r * chartH} textAnchor="end" className="fill-gray-400 text-[11px]">
            {(maxVal * r).toFixed(0)}
          </text>
          <line x1={pad.left} y1={pad.top + chartH - r * chartH} x2={pad.left + chartW} y2={pad.top + chartH - r * chartH} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeDasharray="4 4" />
        </g>
      ))}
      {data.map((d, i) => {
        const barW = Math.max(20, chartW / data.length * 0.6);
        const gap = chartW / data.length;
        const x = pad.left + i * gap + (gap - barW) / 2;
        const barH = (Math.abs(d.value) / maxVal) * chartH;
        const y = d.value >= 0 ? pad.top + chartH - barH : pad.top + chartH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} fill={COLORS[i % COLORS.length]} rx={4} className="transition-all duration-300">
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
            <text x={x + barW / 2} y={pad.top + chartH + 16} textAnchor="end" transform={`rotate(-45, ${x + barW / 2}, ${pad.top + chartH + 16})`} className="fill-gray-500 dark:fill-gray-400 text-[10px]">
              {d.label.length > 8 ? d.label.slice(0, 8) + '...' : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const w = Math.max(600, data.length * 60);
  const h = 300;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: pad.top + chartH - (d.value / maxVal) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-3xl mx-auto">
      <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="currentColor" className="text-gray-300 dark:text-gray-600" />
      <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="currentColor" className="text-gray-300 dark:text-gray-600" />
      {[0, 0.25, 0.5, 0.75, 1].map((r) => (
        <g key={r}>
          <text x={pad.left - 8} y={pad.top + chartH - r * chartH} textAnchor="end" className="fill-gray-400 text-[11px]">
            {(maxVal * r).toFixed(0)}
          </text>
          <line x1={pad.left} y1={pad.top + chartH - r * chartH} x2={pad.left + chartW} y2={pad.top + chartH - r * chartH} stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeDasharray="4 4" />
        </g>
      ))}
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#6366f1" stroke="white" strokeWidth={2}>
            <title>{`${p.label}: ${p.value}`}</title>
          </circle>
          <text x={p.x} y={pad.top + chartH + 16} textAnchor="end" transform={`rotate(-45, ${p.x}, ${pad.top + chartH + 16})`} className="fill-gray-500 dark:fill-gray-400 text-[10px]">
            {p.label.length > 8 ? p.label.slice(0, 8) + '...' : p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function PieChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) return null;
  const total = data.reduce((s, d) => s + Math.abs(d.value), 0);
  if (total === 0) return null;
  const cx = 150;
  const cy = 150;
  const r = 120;
  let startAngle = 0;

  const slices = data.map((d, i) => {
    const angle = (Math.abs(d.value) / total) * 360;
    const start = startAngle;
    startAngle += angle;
    return { ...d, start, angle, color: COLORS[i % COLORS.length] };
  });

  function polar(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <svg viewBox="0 0 400 350" className="w-full max-w-md mx-auto">
      {slices.map((s, i) => {
        if (s.angle >= 360) {
          return <circle key={i} cx={cx} cy={cy} r={r} fill={s.color} />;
        }
        const p1 = polar(cx, cy, r, s.start);
        const p2 = polar(cx, cy, r, s.start + s.angle);
        const large = s.angle > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
        const midAngle = s.start + s.angle / 2;
        const labelPos = polar(cx, cy, r * 0.65, midAngle);
        return (
          <g key={i}>
            <path d={d} fill={s.color} className="hover:opacity-80 transition-opacity">
              <title>{`${s.label}: ${s.value} (${(s.angle / 360 * 100).toFixed(1)}%)`}</title>
            </path>
            {s.angle > 15 && (
              <text x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="central" className="fill-white text-[11px] font-medium">
                {`${(s.angle / 360 * 100).toFixed(0)}%`}
              </text>
            )}
          </g>
        );
      })}
      {slices.map((s, i) => (
        <g key={`legend-${i}`}>
          <rect x={10} y={300 + i * 20} width={12} height={12} rx={2} fill={s.color} />
          <text x={28} y={310 + i * 20} className="fill-gray-600 dark:fill-gray-400 text-[11px]">{s.label}</text>
        </g>
      ))}
    </svg>
  );
}

export default function ChartTool({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('tools');
  const tc = useTranslations('common');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [data, setData] = useState<DataPoint[]>([
    { label: 'A', value: 30 },
    { label: 'B', value: 50 },
    { label: 'C', value: 20 },
    { label: 'D', value: 40 },
  ]);

  const updateData = (idx: number, field: 'label' | 'value', val: string) => {
    setData(prev => prev.map((d, i) =>
      i === idx ? { ...d, [field]: field === 'value' ? Number(val) || 0 : val } : d
    ));
  };

  const addRow = () => setData(prev => [...prev, { label: '', value: 0 }]);
  const removeRow = (idx: number) => setData(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a1a] transition-colors">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-4">
          <Link href="/tools" className="flex items-center text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {tc('tools')}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{t('dataTools.chart')}</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('dataTools.chart')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('dataTools.chartDesc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
              <div className="flex gap-2 mb-6">
                {(['bar', 'line', 'pie'] as ChartType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      chartType === type
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'bar' ? t('dataTools.chartBar') : type === 'line' ? t('dataTools.chartLine') : t('dataTools.chartPie')}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium px-2">
                  <span className="w-24">{t('dataTools.chartLabel')}</span>
                  <span className="w-20">{t('dataTools.chartValue')}</span>
                </div>
                {data.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={d.label}
                      onChange={(e) => updateData(i, 'label', e.target.value)}
                      className="w-24 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Label"
                    />
                    <input
                      type="number"
                      value={d.value}
                      onChange={(e) => updateData(i, 'value', e.target.value)}
                      className="w-20 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-500 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <button onClick={addRow} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  + {t('dataTools.chartAdd')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 flex items-center justify-center min-h-[350px]">
            {chartType === 'bar' && <BarChart data={data} />}
            {chartType === 'line' && <LineChart data={data} />}
            {chartType === 'pie' && <PieChart data={data} />}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
