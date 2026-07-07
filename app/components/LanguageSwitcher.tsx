'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/src/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const toggleLocale = () => {
    const next = locale === 'zh' ? 'en' : 'zh';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
      aria-label={t('language')}
    >
      {locale === 'zh' ? 'EN' : '中'}
    </button>
  );
}
