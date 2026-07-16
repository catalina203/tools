'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const links = [
    { href: '/', label: t('home') },
    { href: '/tools', label: t('tools') },
    { href: '/about', label: t('about') },
  ];

  return (
    <>
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-base sm:text-xl">⚡</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            {t('appName')}
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium'
              }
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-24 right-4 left-4 sm:right-8 sm:left-auto sm:w-64 z-50 mt-2 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-gray-200 dark:border-white/10 my-2" />
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('language')}</span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </>
      )}
    </>
  );
}
