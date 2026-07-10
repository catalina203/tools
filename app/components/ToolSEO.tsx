import { getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';

type ToolSEOProps = {
  slug: string;
  locale: string;
  relatedTools?: string[];
};

export default async function ToolSEO({ slug, locale, relatedTools = [] }: ToolSEOProps) {
  const t = await getTranslations({ locale, namespace: 'tools' });

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
  };
  const cc = colorClasses[color] || colorClasses.violet;

  return (
    <div className="mt-16 space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t(`imageTools.${featurePrefix}Title` as any)}</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{t(`imageTools.${featurePrefix}Desc` as any)}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <span className="text-2xl mb-3 block">{icons[i - 1]}</span>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t(`imageTools.${featurePrefix}${i}Title` as any)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(`imageTools.${featurePrefix}${i}Desc` as any)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.howToUse')}</h2>
        <ol className="space-y-3 text-gray-600 dark:text-gray-400">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-start">
              <span className={`flex-shrink-0 w-7 h-7 ${cc.bg} ${cc.text} rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5`}>{i}</span>
              <span>{t(`imageTools.${stepPrefix}${i}` as any)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.faq')}</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(`imageTools.${faqPrefix}${i}Q` as any)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t(`imageTools.${faqPrefix}${i}A` as any)}</p>
            </div>
          ))}
        </div>
      </section>

      {relatedTools.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('imageTools.relatedTools')}</h2>
          <div className="flex flex-wrap gap-3">
            {relatedTools.map((tool) => (
              <Link key={tool} href={`/tools/${tool}`} className={`px-4 py-2 bg-gray-50 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-300 ${cc.ring} transition-colors`}>
                {t(`imageTools.${tool}` as any)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}