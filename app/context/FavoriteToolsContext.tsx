'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type FavoriteToolsContextType = {
  favorites: string[];
  addFavorite: (toolKey: string) => void;
  removeFavorite: (toolKey: string) => void;
  isFavorite: (toolKey: string) => boolean;
  toggleFavorite: (toolKey: string) => void;
};

const FavoriteToolsContext = createContext<FavoriteToolsContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  toggleFavorite: () => {},
});

export function FavoriteToolsProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const saved = localStorage.getItem('favoriteTools');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        } catch {
          // 忽略解析错误
        }
      }
      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      localStorage.setItem('favoriteTools', JSON.stringify(favorites));
    }
  }, [favorites]);

  const addFavorite = useCallback((toolKey: string) => {
    setFavorites(prev => {
      if (prev.includes(toolKey)) {
        return prev;
      }
      return [...prev, toolKey];
    });
  }, []);

  const removeFavorite = useCallback((toolKey: string) => {
    setFavorites(prev => prev.filter(key => key !== toolKey));
  }, []);

  const isFavorite = useCallback((toolKey: string) => {
    return favorites.includes(toolKey);
  }, [favorites]);

  const toggleFavorite = useCallback((toolKey: string) => {
    setFavorites(prev => {
      if (prev.includes(toolKey)) {
        return prev.filter(key => key !== toolKey);
      }
      return [...prev, toolKey];
    });
  }, []);

  return (
    <FavoriteToolsContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoriteToolsContext.Provider>
  );
}

export const useFavoriteTools = () => useContext(FavoriteToolsContext);
