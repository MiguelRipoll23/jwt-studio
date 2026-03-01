import { useState } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Alert } from '@openai/apps-sdk-ui/components/Alert';
import { Badge } from '@openai/apps-sdk-ui/components/Badge';
import { Select } from '@openai/apps-sdk-ui/components/Select';
import { Switch } from '@openai/apps-sdk-ui/components/Switch';
import { applyDocumentTheme } from '@openai/apps-sdk-ui/theme';
import {
  DownloadSimple,
  UploadDocuments,
  CheckCircle,
  SettingsCog,
  CloseBold,


  ShieldLock,

  Sparkles,
  Nodes,
  Trash,
  Info,
  ArrowRotateCw,
} from '@openai/apps-sdk-ui/components/Icon';
import type { Project, ThemeMode } from '../types';
import { ALGORITHMS, DURATIONS } from '../types';
import type { AppSettingsStore } from '../appSettings';
import { THEME_KEY } from '../main';

type Section = 'general' | 'appearance' | 'export-import' | 'about';

const NAV: { id: Section; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'general', label: 'General', Icon: SettingsCog },
  { id: 'appearance', label: 'Appearance', Icon: SettingsCog },
  { id: 'export-import', label: 'Export / Import', Icon: Nodes },
  { id: 'about', label: 'About', Icon: Info },
];

const ALGORITHM_OPTIONS = ALGORITHMS.map(a => ({ value: a, label: a }));
const DURATION_OPTIONS = DURATIONS.map(d => ({ value: d.value, label: d.label }));

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

interface SettingsProps {
  projects: Project[];
  onImport: (projects: Project[]) => void;
  onClose: () => void;
  appSettings: AppSettingsStore;
}

export function Settings({ projects, onImport, onClose, appSettings }: SettingsProps) {
  const [section, setSection] = useState<Section>('general');
  const { settings, updateSettings } = appSettings;

  function applyTheme(themeMode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    applyDocumentTheme(theme);
    localStorage.setItem(THEME_KEY, themeMode);
    if (window.electronAPI?.setTitleBarColor) {
      window.electronAPI.setTitleBarColor(theme);
    }
  }

  function handleThemeChange(themeMode: ThemeMode) {
    updateSettings({ themeMode });
    applyTheme(themeMode);
  }

  // Export state
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Import state
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error' | 'confirm'>('idle');
  const [importPreview, setImportPreview] = useState<Project[] | null>(null);
  const [importError, setImportError] = useState('');
  // Clear data state
  const [confirmClear, setConfirmClear] = useState(false);
  // Update check state
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'up-to-date' | 'available' | 'error'>('idle');
  const [latestRelease, setLatestRelease] = useState<{ version: string; url: string } | null>(null);

  async function handleCheckForUpdates() {
    setUpdateStatus('checking');
    setLatestRelease(null);
    try {
      const result = await window.electronAPI.checkForUpdates();
      if (!result) { setUpdateStatus('error'); return; }
      setLatestRelease(result);
      const isNewer = compareVersions(result.version, __APP_VERSION__) > 0;
      setUpdateStatus(isNewer ? 'available' : 'up-to-date');
    } catch {
      setUpdateStatus('error');
    }
  }

  async function handleExport() {
    setExportStatus('idle');
    const data = JSON.stringify({ version: __APP_VERSION__, projects }, null, 2);
    try {
      const saved = await window.electronAPI.saveConfig(data);
      setExportStatus(saved ? 'success' : 'idle');
    } catch {
      setExportStatus('error');
    }
  }

  async function handleImportPick() {
    setImportStatus('idle');
    setImportError('');
    try {
      const raw = await window.electronAPI.openConfig();
      if (!raw) return;
      const parsed = JSON.parse(raw) as { version?: string; projects: Project[] };
      if (!Array.isArray(parsed.projects)) throw new Error('Invalid config: missing projects array');
      setImportPreview(parsed.projects);
      setImportStatus('confirm');
    } catch (e: unknown) {
      setImportError((e as Error).message ?? 'Failed to parse config file');
      setImportStatus('error');
    }
  }

  function handleImportConfirm() {
    if (!importPreview) return;
    onImport(importPreview);
    setImportStatus('success');
    setImportPreview(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 z-40" />
      <div className="relative z-50 bg-[var(--gray-0)] rounded-xl shadow-xl border border-[var(--alpha-08)] w-full max-w-2xl mx-4 flex flex-col overflow-hidden" style={{ height: '520px' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--alpha-08)] shrink-0">
          <div className="flex items-center gap-2.5">
            <SettingsCog className="w-5 h-5 text-[var(--gray-600)]" />
            <span className="font-semibold text-[var(--gray-900)]">Settings</span>
          </div>
          <Button color="secondary" variant="ghost" size="xs" uniform onClick={onClose}>
            <CloseBold className="w-5 h-5" />
          </Button>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Settings Sidebar */}
          <nav className="w-44 shrink-0 border-r border-[var(--alpha-08)] bg-[var(--gray-50)] py-2 flex flex-col gap-0.5 px-2">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={[
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors',
                  section === id
                    ? 'bg-[var(--alpha-08)] text-[var(--gray-900)] font-medium'
                    : 'text-[var(--gray-600)] hover:bg-[var(--alpha-05)] hover:text-[var(--gray-900)]',
                ].join(' ')}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ── GENERAL ── */}
            {section === 'general' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-3">Defaults for new projects</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--gray-800)]">Default algorithm</p>
                        <p className="text-xs text-[var(--gray-500)]">Used when creating a new project</p>
                      </div>
                      <div className="w-40 shrink-0">
                        <Select
                          options={ALGORITHM_OPTIONS}
                          value={settings.defaultAlgorithm}
                          onChange={opt => updateSettings({ defaultAlgorithm: opt.value as typeof settings.defaultAlgorithm })}
                          size="sm"
                          variant="outline"
                          placeholder="Select algorithm..."
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--gray-800)]">Default token duration</p>
                        <p className="text-xs text-[var(--gray-500)]">Expiry applied to new project tokens</p>
                      </div>
                      <div className="w-40 shrink-0">
                        <Select
                          options={DURATION_OPTIONS}
                          value={settings.defaultDuration}
                          onChange={opt => updateSettings({ defaultDuration: opt.value })}
                          size="sm"
                          variant="outline"
                          placeholder="Select duration..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--alpha-05)] pt-4">
                  <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-3">Behaviour</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--gray-800)]">Confirm before deleting</p>
                        <p className="text-xs text-[var(--gray-500)]">Show a confirmation prompt when deleting projects or tokens</p>
                      </div>
                      <Switch
                        checked={settings.confirmDelete}
                        onCheckedChange={v => updateSettings({ confirmDelete: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--gray-800)]">Auto-copy token</p>
                        <p className="text-xs text-[var(--gray-500)]">Automatically copy the signed token to clipboard when generated</p>
                      </div>
                      <Switch
                        checked={settings.autoCopyToken}
                        onCheckedChange={v => updateSettings({ autoCopyToken: v })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[var(--alpha-05)] pt-4">
                  <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-3">Danger zone</h3>
                  {!confirmClear ? (
                    <Button
                      color="danger"
                      variant="soft"
                      size="sm"
                      onClick={() => setConfirmClear(true)}
                    >
                      <Trash className="w-4 h-4" />
                      Clear all data
                    </Button>
                  ) : (
                    <Alert
                      color="danger"
                      variant="soft"
                      title="This will delete all projects and tokens."
                      description="This cannot be undone."
                      actions={
                        <div className="flex gap-2">
                          <Button color="danger" variant="solid" size="xs" onClick={() => { onImport([]); setConfirmClear(false); }}>
                            Delete everything
                          </Button>
                          <Button color="secondary" variant="ghost" size="xs" onClick={() => setConfirmClear(false)}>
                            Cancel
                          </Button>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {section === 'appearance' && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--gray-900)] mb-3">Theme</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-[var(--gray-800)]">Application theme</p>
                      <p className="text-xs text-[var(--gray-500)]">Choose your preferred theme</p>
                    </div>
                    <div className="w-40 shrink-0">
                      <Select
                        options={[
                          { value: 'system', label: 'Follow system' },
                          { value: 'light', label: 'Light' },
                          { value: 'dark', label: 'Dark' },
                        ]}
                        value={settings.themeMode}
                        onChange={opt => handleThemeChange(opt.value as ThemeMode)}
                        size="sm"
                        variant="outline"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── EXPORT / IMPORT ── */}
            {section === 'export-import' && (
              <div className="flex flex-col gap-5">
                {/* Export */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--gray-800)]">Export config</p>
                      <p className="text-xs text-[var(--gray-500)]">
                        Save all projects and tokens to a JSON file.
                        You can use this file to back up or transfer your setup.
                      </p>
                    </div>
                    <Button
                      color="primary"
                      variant="soft"
                      size="sm"
                      onClick={handleExport}
                      disabled={projects.length === 0}
                    >
                      <DownloadSimple className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                  {exportStatus === 'success' && (
                    <Alert
                      color="success"
                      variant="soft"
                      indicator={<CheckCircle className="w-4 h-4" />}
                      description="Config exported successfully."
                    />
                  )}
                  {exportStatus === 'error' && (
                    <Alert color="danger" variant="soft" description="Export failed. Try again." />
                  )}

                </div>

                {/* Import */}
                <div className="border-t border-[var(--alpha-05)] pt-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--gray-800)]">Import config</p>
                      <p className="text-xs text-[var(--gray-500)]">
                        Load projects from a previously exported config file.
                        This will replace all current data.
                      </p>
                    </div>
                    <Button
                      color="secondary"
                      variant="soft"
                      size="sm"
                      onClick={handleImportPick}
                    >
                      <UploadDocuments className="w-4 h-4" />
                      Import
                    </Button>
                  </div>
                  {importStatus === 'error' && (
                    <Alert color="danger" variant="soft" description={importError || 'Failed to import config.'} />
                  )}
                  {importStatus === 'success' && (
                    <Alert
                      color="success"
                      variant="soft"
                      indicator={<CheckCircle className="w-4 h-4" />}
                      description="Config imported successfully."
                    />
                  )}
                  {importStatus === 'confirm' && importPreview && (
                    <Alert
                      color="info"
                      variant="soft"
                      indicator={<ShieldLock className="w-4 h-4" />}
                      title={`Import ${importPreview.length} project${importPreview.length !== 1 ? 's' : ''}?`}
                      description="All current projects and tokens will be replaced."
                      actions={
                        <div className="flex gap-2">
                          <Button color="primary" variant="solid" size="xs" onClick={handleImportConfirm}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Confirm
                          </Button>
                          <Button color="secondary" variant="ghost" size="xs" onClick={() => { setImportStatus('idle'); setImportPreview(null); }}>
                            Cancel
                          </Button>
                        </div>
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── ABOUT ── */}
            {section === 'about' && (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--gray-900)] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[var(--gray-0)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--gray-900)]">JWT Studio</p>
                    <p className="text-xs text-[var(--gray-500)]">
                      Local JWT project manager for developers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-[var(--alpha-05)]">
                    <span className="text-[var(--gray-600)]">Version</span>
                    <Badge color="secondary" variant="soft" size="sm">v{__APP_VERSION__}</Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--alpha-05)]">
                    <span className="text-[var(--gray-600)]">Projects</span>
                    <span className="font-medium text-[var(--gray-900)]">{projects.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--alpha-05)]">
                    <span className="text-[var(--gray-600)]">Tokens</span>
                    <span className="font-medium text-[var(--gray-900)]">
                      {projects.reduce((a, p) => a + p.tokens.length, 0)}
                    </span>
                  </div>
                </div>

                {/* Update checker */}
                <div className="border-t border-[var(--alpha-05)] pt-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--gray-800)]">Updates</p>
                      <p className="text-xs text-[var(--gray-500)]">Check for a newer version on GitHub</p>
                    </div>
                    <Button
                      color="secondary"
                      variant="soft"
                      size="sm"
                      onClick={handleCheckForUpdates}
                      disabled={updateStatus === 'checking'}
                    >
                      <ArrowRotateCw className="w-4 h-4" />
                      {updateStatus === 'checking' ? 'Checking…' : 'Check for updates'}
                    </Button>
                  </div>

                  {updateStatus === 'up-to-date' && (
                    <Alert
                      color="success"
                      variant="soft"
                      indicator={<CheckCircle className="w-4 h-4" />}
                      description="You're on the latest version."
                    />
                  )}

                  {updateStatus === 'available' && latestRelease && (
                    <Alert
                      color="info"
                      variant="soft"
                      indicator={<DownloadSimple className="w-4 h-4" />}
                      title={`Version ${latestRelease.version} is available`}
                      description="A new release is ready to download and install."
                      actions={
                        <Button
                          color="primary"
                          variant="solid"
                          size="xs"
                          onClick={() => window.electronAPI.openExternal(latestRelease.url)}
                        >
                          <DownloadSimple className="w-3.5 h-3.5" />
                          Download update
                        </Button>
                      }
                    />
                  )}

                  {updateStatus === 'error' && (
                    <Alert
                      color="danger"
                      variant="soft"
                      description="Could not check for updates. Please try again later."
                    />
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

