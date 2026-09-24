'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const WatchSettingContext = createContext();

export function WatchSettingContextProvider({ children }) {
  const [watchSetting, setWatchSetting] = useState({
    isExpanded: false,
    light: false,
    autoPlay: false,
    autoNext: true,
    autoSkipIntro: true,
  });

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hikari_player_settings") || localStorage.getItem("tenro_player_settings") || localStorage.getItem("player_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setWatchSetting((prev) => ({
          ...prev,
          autoPlay: parsed.autoPlay ?? prev.autoPlay,
          autoNext: parsed.autoNext ?? prev.autoNext,
          autoSkipIntro: parsed.autoSkipIntro ?? prev.autoSkipIntro,
        }));
      }
    } catch {}
  }, []);

  // Setter that also syncs persistent flags to localStorage
  const updateWatchSetting = (updater) => {
    setWatchSetting((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem(
          "hikari_player_settings",
          JSON.stringify({
            autoPlay: next.autoPlay,
            autoNext: next.autoNext,
            autoSkipIntro: next.autoSkipIntro,
          })
        );
      } catch {}
      return next;
    });
  };

  return (
    <WatchSettingContext.Provider value={{ watchSetting, setWatchSetting: updateWatchSetting }}>
      <div className="flex gap-3 aspect-video flex-col-reverse max-h-[52rem]">
        {children}
      </div>
    </WatchSettingContext.Provider>
  );
}

export const useWatchSettingContext = () => useContext(WatchSettingContext);