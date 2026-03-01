import { useState, useCallback, useEffect } from 'react';
import type { AppSettings } from './types';
import { SETTINGS_DEFAULTS } from './types';
import { loadConfig, saveSettings as persistSettings } from './fileStore';

export type { AppSettings };

export function useAppSettings() {
  const [settings, setSettingsState] = useState<AppSettings>({ ...SETTINGS_DEFAULTS });

  useEffect(() => {
    loadConfig().then(config => setSettingsState(config.settings));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch };
      persistSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}

export type AppSettingsStore = ReturnType<typeof useAppSettings>;
