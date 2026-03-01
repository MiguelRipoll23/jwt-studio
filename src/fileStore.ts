import type { Project, AppSettings } from './types';
import { SETTINGS_DEFAULTS } from './types';

interface Config {
  projects: Project[];
  settings: AppSettings;
}

let _config: Config = { projects: [], settings: { ...SETTINGS_DEFAULTS } };
let _loadPromise: Promise<Config> | null = null;

export function loadConfig(): Promise<Config> {
  if (!_loadPromise) {
    _loadPromise = (async () => {
      try {
        const raw = await window.electronAPI.readStore();
        if (raw) {
          const parsed = JSON.parse(raw);
          _config = {
            projects: Array.isArray(parsed.projects) ? parsed.projects : [],
            settings: { ...SETTINGS_DEFAULTS, ...(parsed.settings ?? {}) },
          };
        }
      } catch {}
      return _config;
    })();
  }
  return _loadPromise;
}

async function persist(): Promise<void> {
  await window.electronAPI.writeStore(JSON.stringify(_config, null, 2));
}

export async function saveProjects(projects: Project[]): Promise<void> {
  _config = { ..._config, projects };
  await persist();
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  _config = { ..._config, settings };
  await persist();
}
