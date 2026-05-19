import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const FAVS_KEY = "ghardhoondo_favourites";

interface FavouritesContextType {
  favouriteIds: string[];
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => Promise<void>;
  clearFavourites: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAVS_KEY).then((raw) => {
      if (raw) setFavouriteIds(JSON.parse(raw));
    });
  }, []);

  const isFavourite = useCallback((id: string) => favouriteIds.includes(id), [favouriteIds]);

  const toggleFavourite = useCallback(async (id: string) => {
    setFavouriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      AsyncStorage.setItem(FAVS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearFavourites = useCallback(async () => {
    setFavouriteIds([]);
    await AsyncStorage.removeItem(FAVS_KEY);
  }, []);

  return (
    <FavouritesContext.Provider value={{ favouriteIds, isFavourite, toggleFavourite, clearFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error("useFavourites must be used within FavouritesProvider");
  return ctx;
}
