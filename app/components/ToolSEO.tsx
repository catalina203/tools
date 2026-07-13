import { getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';

type ToolSEOProps = {
  slug: string;
  locale: string;
  relatedTools?: string[];
};

export default async function ToolSEO({ slug, locale, relatedTools = [] }: ToolSEOProps) {
  const t = await getTranslations({ locale, namespace: 'tools' });

  const textTools = ['wordCount', 'textClean', 'caseConvert', 'textReverse', 'markdownToHtml', 'lineSort', 'traditionalSimplified', 'escape', 'lineNumber', 'trimText', 'mergeLines', 'splitText', 'lorem', 'diff'];
  const devTools = ['jsonFormat', 'xmlFormat', 'sqlFormat', 'colorConvert', 'yamlToJson', 'csvToJson', 'urlEncode', 'base64Text', 'md5', 'sha', 'uuid', 'password', 'emailValidate', 'regexTest', 'regexVisual', 'jsonVisual', 'colorPicker', 'gradient', 'shadow', 'flexbox', 'gridLayout', 'gridGenerator', 'cssVariable', 'responsiveTest', 'contrastCheck', 'radix', 'timestamp', 'unitConvert', 'dateCalc', 'mimeQuery'];
  const efficiencyTools = ['qrcode', 'barcode', 'calculator', 'scientificCalc', 'notepad', 'stickyNote', 'countdown', 'stopwatch', 'pomodoro', 'worldClock', 'timezone', 'passwordStrength', 'randomNum', 'radixCalc'];
  const fileTools = ['imageConvert', 'zip', 'unzip', 'preview', 'fileHash', 'editor'];
  const dataTools = ['csvEditor', 'jsonEditor', 'chart', 'statistics'];

  const getToolCategory = (tool: string): string => {
    if (textTools.includes(tool)) return 'textTools';
    if (devTools.includes(tool)) return 'devTools';
    if (efficiencyTools.includes(tool)) return 'efficiencyTools';
    if (fileTools.includes(tool)) return 'fileTools';
    if (dataTools.includes(tool)) return 'dataTools';
    return 'imageTools';
  };

  const currentCategory = getToolCategory(slug);
  const categoryKey = currentCategory;

  const featureIcons: Record<string, string[]> = {
    crop: ['✂️', '🔒', '📥'],
    compress: ['📦', '🎚️', '⚡'],
    resize: ['🔍', '📐', '⚡'],
    rotate: ['🔄', '🔀', '👁️'],
    brightness: ['☀️', '🎚️', '⚡'],
    contrast: ['🌓', '🎚️', '⚡'],
    saturation: ['🌈', '🎚️', '⚡'],
    hue: ['🎨', '🎚️', '⚡'],
    grayscale: ['🖤', '🎚️', '⚡'],
    wordCount: ['📊', '📝', '📋'],
    textClean: ['🧹', '✂️', '✨'],
    caseConvert: ['Aa', '🔄', '📋'],
    textReverse: ['⇄', '🔁', '📋'],
    markdownToHtml: ['📝', '🔄', '🌐'],
    lineSort: ['📑', '⬆️', '🔄'],
    traditionalSimplified: ['🇨🇳', '🇹🇼', '🔄'],
    escape: ['🔒', '🔓', '📋'],
    lineNumber: ['📝', '#️⃣', '📋'],
    trimText: ['✂️', '📏', '📋'],
    mergeLines: ['🔗', '📝', '📋'],
    splitText: ['✂️', '📑', '📋'],
    lorem: ['📄', '🎲', '📋'],
    diff: ['⚖️', '🔍', '📋'],
    jsonFormat: ['📋', '🔧', '📄'],
    xmlFormat: ['📄', '🔧', '📋'],
    sqlFormat: ['🗄️', '🔧', '📋'],
    colorConvert: ['🎨', '🔄', '🎯'],
    yamlToJson: ['📄', '🔄', '📋'],
    csvToJson: ['📊', '🔄', '📋'],
    urlEncode: ['🔗', '🔒', '📋'],
    base64Text: ['🔐', '🔄', '📋'],
    md5: ['🔐', '#️⃣', '📋'],
    sha: ['🔐', '#️⃣', '📋'],
    uuid: ['🆔', '🎲', '📋'],
    password: ['🔑', '🎲', '🛡️'],
    emailValidate: ['📧', '✅', '📋'],
  regexTest: ['🔍', '🧪', '📋'],
  regexVisual: ['📊', '🔍', '🌐'],
  jsonVisual: ['🌳', '🔍', '📋'],
  colorPicker: ['🎨', '🌈', '📋'],
  gradient: ['🌈', '🎨', '📋'],
  shadow: ['🌫️', '◧', '📋'],
  flexbox: ['⊞', '📐', '📋'],
  gridLayout: ['⊞', '📐', '📋'],
  gridGenerator: ['⊞', '📐', '📋'],
  cssVariable: [':', '🎨', '📋'],
  responsiveTest: ['📱', '💻', '🖥️'],
  contrastCheck: ['◐', '♿', '📋'],
  radix: ['⇄', '#️⃣', '📋'],
  timestamp: ['⌚', '🔄', '📋'],
  unitConvert: ['⇄', '📏', '📋'],
  dateCalc: ['📅', '➕', '📋'],
  mimeQuery: ['📋', '🔍', '📄'],
  calculator: ['🔢', '🧮', '📋'],
  qrcode: ['📱', '🎨', '📥'],
  barcode: ['📊', '🎨', '📥'],
  passwordStrength: ['🔐', '📊', '💡'],
  notepad: ['📝', '💾', '📊'],
  pomodoro: ['🍅', '⏱️', '📊'],
  scientificCalc: ['🔢', '📐', '📋'],
  stickyNote: ['📝', '🎨', '💾'],
  countdown: ['⏰', '📅', '🎯'],
  stopwatch: ['⏱️', '🏁', '📋'],
  worldClock: ['🌍', '🕐', '🏙️'],
  timezone: ['🔄', '🌏', '🕐'],
};

  const icons = featureIcons[slug] || ['✨', '⚡', '🔄'];
  const featurePrefix = `${slug}Feature`;
  const stepPrefix = `${slug}Step`;
  const faqPrefix = `${slug}Faq`;

  const colorMap: Record<string, string> = {
    crop: 'violet',
    compress: 'teal',
    resize: 'violet',
    rotate: 'cyan',
    brightness: 'amber',
    contrast: 'gray',
    saturation: 'emerald',
    hue: 'fuchsia',
    grayscale: 'zinc',
    wordCount: 'pink',
    textClean: 'emerald',
    caseConvert: 'teal',
    textReverse: 'violet',
    markdownToHtml: 'blue',
    lineSort: 'purple',
    traditionalSimplified: 'indigo',
    escape: 'orange',
    lineNumber: 'cyan',
    trimText: 'red',
    mergeLines: 'green',
    splitText: 'purple',
    lorem: 'gray',
    diff: 'emerald',
    jsonFormat: 'indigo',
    xmlFormat: 'indigo',
    sqlFormat: 'orange',
    colorConvert: 'fuchsia',
    yamlToJson: 'purple',
    csvToJson: 'green',
    urlEncode: 'blue',
    base64Text: 'green',
    md5: 'yellow',
    sha: 'orange',
    uuid: 'purple',
    password: 'rose',
    emailValidate: 'indigo',
  regexTest: 'purple',
  regexVisual: 'indigo',
  jsonVisual: 'amber',
  colorPicker: 'pink',
  gradient: 'violet',
  shadow: 'gray',
  flexbox: 'cyan',
  gridLayout: 'indigo',
  gridGenerator: 'cyan',
  cssVariable: 'purple',
  responsiveTest: 'emerald',
  contrastCheck: 'amber',
  radix: 'amber',
  timestamp: 'emerald',
  unitConvert: 'blue',
  dateCalc: 'purple',
  mimeQuery: 'violet',
  calculator: 'blue',
  qrcode: 'violet',
  barcode: 'emerald',
  passwordStrength: 'indigo',
  notepad: 'amber',
  pomodoro: 'rose',
  scientificCalc: 'indigo',
  stickyNote: 'yellow',
  countdown: 'red',
  stopwatch: 'cyan',
  worldClock: 'violet',
  timezone: 'teal',
};
  const color = colorMap[slug] || 'violet';

  const colorClasses: Record<string, { bg: string; text: string; ring: string }> = {
    violet: { bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400', ring: 'hover:border-violet-300 dark:hover:border-violet-500/50' },
    teal: { bg: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', ring: 'hover:border-teal-300 dark:hover:border-teal-500/50' },
    cyan: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', ring: 'hover:border-cyan-300 dark:hover:border-cyan-500/50' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', ring: 'hover:border-amber-300 dark:hover:border-amber-500/50' },
    gray: { bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-400', ring: 'hover:border-gray-300 dark:hover:border-gray-500/50' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', ring: 'hover:border-emerald-300 dark:hover:border-emerald-500/50' },
    fuchsia: { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20', text: 'text-fuchsia-600 dark:text-fuchsia-400', ring: 'hover:border-fuchsia-300 dark:hover:border-fuchsia-500/50' },
    zinc: { bg: 'bg-zinc-100 dark:bg-zinc-500/20', text: 'text-zinc-600 dark:text-zinc-400', ring: 'hover:border-zinc-300 dark:hover:border-zinc-500/50' },
    pink: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-600 dark:text-pink-400', ring: 'hover:border-pink-300 dark:hover:border-pink-500/50' },
    yellow: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400', ring: 'hover:border-yellow-300 dark:hover:border-yellow-500/50' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', ring: 'hover:border-orange-300 dark:hover:border-orange-500/50' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', ring: 'hover:border-rose-300 dark:hover:border-rose-500/50' },
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', ring: 'hover:border-indigo-300 dark:hover:border-indigo-500/50' },
  };
  const cc = colorClasses[color] || colorClasses.violet;

  return (
    <div className="mt-16 space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(`${categoryKey}.${featurePrefix}Title` as any)}</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{t(`${categoryKey}.${featurePrefix}Desc` as any)}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <span className="text-2xl mb-3 block">{icons[i - 1]}</span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`${categoryKey}.${featurePrefix}${i}Title` as any)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(`${categoryKey}.${featurePrefix}${i}Desc` as any)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(`${categoryKey}.howToUse`)}</h2>
        <ol className="space-y-3 text-gray-600 dark:text-gray-400">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-start">
              <span className={`flex-shrink-0 w-7 h-7 ${cc.bg} ${cc.text} rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5`}>{i}</span>
              <span>{t(`${categoryKey}.${stepPrefix}${i}` as any)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(`${categoryKey}.faq`)}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(`${categoryKey}.${faqPrefix}${i}Q` as any)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(`${categoryKey}.${faqPrefix}${i}A` as any)}</p>
            </div>
          ))}
        </div>
      </section>

      {relatedTools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(`${categoryKey}.relatedTools`)}</h2>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((tool) => {
              const toolCategory = getToolCategory(tool);
              return (
                <Link key={tool} href={`/tools/${tool}`} className={`px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 ${cc.ring} transition-colors`}>
                  {t(`${toolCategory}.${tool}` as any)}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}