'use client';

import { useTranslations } from 'next-intl';
import SearchResults from './SearchResults';

type SearchBarProps = {
  query: string;
  setQuery: (value: string) => void;
};

export default function SearchBar({ query, setQuery }: SearchBarProps) {
  const tc = useTranslations('common');

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
        <div className="relative flex items-center bg-gray-100 dark:bg-[#1a1a2e] rounded-2xl border border-gray-200 dark:border-white/10 p-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tc('searchPlaceholder')}
            className="flex-1 px-8 py-5 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
          />
          <button 
            onClick={() => {}}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/30"
          >
            {tc('search')}
          </button>
        </div>
      </div>
      <SearchResults query={query} />
    </div>
  );
}