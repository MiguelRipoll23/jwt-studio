import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { StatusAlert } from './ui-ext/status-alert';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Dialog, DialogContent } from './ui/dialog';
import { applyDocumentTheme, THEME_KEY } from '../lib/theme';
import { Download, Upload, CheckCircle, Settings as SettingsIcon, ShieldCheck, Sparkles, Network, Trash2, Info, RefreshCw } from 'lucide-react';
import type { Project, ThemeMode } from '../types';
import { ALGORITHMS, DURATIONS } from '../types';
import type { AppSettingsStore } from '../appSettings';

type Section = 'general' | 'appearance' | 'export-import' | 'about';

const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  system: 'Follow system',
  light: 'Light',
  dark: 'Dark',
};

const NAV: { id: Section; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'general', label: 'General', Icon: SettingsIcon },
  { id: 'appearance', label: 'Appearance', Icon: SettingsIcon },
  { id: 'export-import', label: 'Export / Import', Icon: Network },
  { id: 'about', label: 'About', Icon: Info },
];

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

  if (!appSettings) {
    return null;
  }

  const { settings, updateSettings } = appSettings;

  function applyTheme(themeMode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    applyDocumentTheme(theme);
    localStorage.setItem(THEME_KEY, themeMode);
    window.electronAPI?.setTitleBarColor(theme);
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
  const [downloadProgress, setDownloadProgress] = useState<{ percent: number } | null>(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    window.electronAPI?.onUpdateAvailable((version) => {
      console.log('[updater] Update available event:', version);
      setUpdateStatus('available');
      setLatestRelease({ version, url: `https://github.com/MiguelRipoll23/jwt-studio/releases/tag/v${version}` });
    });
    window.electronAPI?.onDownloadProgress((info) => {
      console.log(`[updater] Download progress: ${info.percent.toFixed(1)}%`);
      setDownloadProgress({ percent: info.percent });
    });
    window.electronAPI?.onUpdateDownloaded(() => {
      console.log('[updater] Update downloaded');
      setDownloadProgress(null);
      setUpdateReady(true);
    });
  }, []);

  async function handleCheckForUpdates() {
    console.log('[updater] Check for updates clicked');
    setUpdateStatus('checking');
    setLatestRelease(null);
    try {
      const result = await window.electronAPI?.checkForUpdates();
      if (!result) { console.log('[updater] No result from check'); setUpdateStatus('error'); return; }
      setLatestRelease(result);
      const isNewer = compareVersions(result.version, __APP_VERSION__) > 0;
      console.log(`[updater] Current=${__APP_VERSION__}, Latest=${result.version}, Newer=${isNewer}`);
      setUpdateStatus(isNewer ? 'available' : 'up-to-date');
    } catch (e) {
      console.error('[updater] Check failed:', e);
      setUpdateStatus('error');
    }
  }

  async function handleExport() {
    setExportStatus('idle');
    const data = JSON.stringify({ version: __APP_VERSION__, projects }, null, 2);
    try {
      const saved = await window.electronAPI?.saveConfig(data);
      setExportStatus(saved ? 'success' : 'idle');
    } catch {
      setExportStatus('error');
    }
  }

  async function handleImportPick() {
    setImportStatus('idle');
    setImportError('');
    try {
      const raw = await window.electronAPI?.openConfig();
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
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton
        className="sm:max-w-2xl p-0 gap-0 flex flex-col overflow-hidden"
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="size-5" />
            <span className="font-semibold">Settings</span>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Settings Sidebar */}
          <nav className="w-44 shrink-0 border-r bg-muted py-2 flex flex-col gap-0.5 px-2">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={[
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors cursor-pointer',
                  section === id
                    ? 'bg-foreground/8 text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
                ].join(' ')}
              >
                <Icon className="size-4 shrink-0" />
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
                  <h3 className="text-sm font-semibold mb-3">Defaults for new projects</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm">Default algorithm</p>
                        <p className="text-xs text-muted-foreground">Used when creating a new project</p>
                      </div>
                      <div className="w-32 shrink-0">
                        <Select
                          value={settings.defaultAlgorithm}
                          onValueChange={value => updateSettings({ defaultAlgorithm: value as typeof settings.defaultAlgorithm })}
                        >
                          <SelectTrigger size="sm" className="w-full">
                            <SelectValue placeholder="Select algorithm..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ALGORITHMS.map(a => (
                              <SelectItem key={a} value={a}>{a}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm">Default token duration</p>
                        <p className="text-xs text-muted-foreground">Expiry applied to new project tokens</p>
                      </div>
                      <div className="w-32 shrink-0">
                        <Select
                          value={settings.defaultDuration || '1 day'}
                          onValueChange={value => { if (value) updateSettings({ defaultDuration: value }); }}
                        >
                          <SelectTrigger size="sm" className="w-full">
                            <SelectValue placeholder="Select duration..." />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATIONS.map(d => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Behaviour</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm">Confirm before deleting</p>
                        <p className="text-xs text-muted-foreground">Show a confirmation prompt when deleting projects or tokens</p>
                      </div>
                      <Switch
                        checked={settings.confirmDelete}
                        onCheckedChange={v => updateSettings({ confirmDelete: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm">Auto-copy token</p>
                        <p className="text-xs text-muted-foreground">Automatically copy the signed token to clipboard when generated</p>
                      </div>
                      <Switch
                        checked={settings.autoCopyToken}
                        onCheckedChange={v => updateSettings({ autoCopyToken: v })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Danger zone</h3>
                  {!confirmClear ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmClear(true)}
                    >
                      <Trash2 className="size-4" />
                      Clear all data
                    </Button>
                  ) : (
                    <StatusAlert
                      variant="danger"
                      title="This will delete all projects and tokens."
                      description="This cannot be undone."
                      actions={
                        <div className="flex gap-2">
                          <Button variant="destructive" size="xs" onClick={() => { onImport([]); setConfirmClear(false); }}>
                            Delete everything
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => setConfirmClear(false)}>
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
                  <h3 className="text-sm font-semibold mb-3">Theme</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm">Application theme</p>
                      <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                    </div>
                    <div className="w-40 shrink-0">
                      <Select
                        value={settings.themeMode}
                        onValueChange={value => handleThemeChange(value as ThemeMode)}
                      >
                        <SelectTrigger size="sm" className="w-full">
                          <SelectValue>{(value: ThemeMode) => THEME_MODE_LABELS[value]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">Follow system</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <p className="text-sm font-medium">Export config</p>
                      <p className="text-xs text-muted-foreground">
                        Save all projects and tokens to a JSON file.
                        You can use this file to back up or transfer your setup.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExport}
                      disabled={projects.length === 0}
                    >
                      <Download className="size-4" />
                      Export
                    </Button>
                  </div>
                  {exportStatus === 'success' && (
                    <StatusAlert
                      variant="success"
                      indicator={<CheckCircle className="size-4" />}
                      description="Config exported successfully."
                    />
                  )}
                  {exportStatus === 'error' && (
                    <StatusAlert variant="danger" description="Export failed. Try again." />
                  )}

                </div>

                {/* Import */}
                <div className="border-t pt-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Import config</p>
                      <p className="text-xs text-muted-foreground">
                        Load projects from a previously exported config file.
                        This will replace all current data.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleImportPick}
                    >
                      <Upload className="size-4" />
                      Import
                    </Button>
                  </div>
                  {importStatus === 'error' && (
                    <StatusAlert variant="danger" description={importError || 'Failed to import config.'} />
                  )}
                  {importStatus === 'success' && (
                    <StatusAlert
                      variant="success"
                      indicator={<CheckCircle className="size-4" />}
                      description="Config imported successfully."
                    />
                  )}
                  {importStatus === 'confirm' && importPreview && (
                    <StatusAlert
                      variant="info"
                      indicator={<ShieldCheck className="size-4" />}
                      title={`Import ${importPreview.length} project${importPreview.length !== 1 ? 's' : ''}?`}
                      description="All current projects and tokens will be replaced."
                      actions={
                        <div className="flex gap-2">
                          <Button size="xs" onClick={handleImportConfirm}>
                            <CheckCircle className="size-3.5" />
                            Confirm
                          </Button>
                          <Button variant="ghost" size="xs" onClick={() => { setImportStatus('idle'); setImportPreview(null); }}>
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
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                    <Sparkles className="size-5 text-background" />
                  </div>
                  <div>
                    <p className="font-semibold">JWT Studio</p>
                    <p className="text-xs text-muted-foreground">
                      Local JWT project manager for developers
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Version</span>
                    <Badge variant="secondary">v{__APP_VERSION__}</Badge>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-medium">{projects.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">
                      {projects.reduce((a, p) => a + p.tokens.length, 0)}
                    </span>
                  </div>
                </div>

                {/* Update checker */}
                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Updates</p>
                      <p className="text-xs text-muted-foreground">Check for a newer version on GitHub</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCheckForUpdates}
                      disabled={updateStatus === 'checking'}
                    >
                      <RefreshCw className="size-4" />
                      {updateStatus === 'checking' ? 'Checking…' : 'Check for updates'}
                    </Button>
                  </div>

                  {updateStatus === 'up-to-date' && (
                    <StatusAlert
                      variant="success"
                      indicator={<CheckCircle className="size-4" />}
                      description="You're on the latest version."
                    />
                  )}

                  {updateStatus === 'available' && latestRelease && (
                    <StatusAlert
                      variant="info"
                      indicator={<Download className="size-4" />}
                      title={`Version ${latestRelease.version} is available`}
                      description="A new release is ready to download and install."
                      actions={
                        <Button
                          size="xs"
                          onClick={() => window.electronAPI?.openExternal(latestRelease.url)}
                        >
                          <Download className="size-3.5" />
                          Download update
                        </Button>
                      }
                    />
                  )}

                  {updateStatus === 'error' && (
                    <StatusAlert
                      variant="danger"
                      description="Could not check for updates. Please try again later."
                    />
                  )}

                  {downloadProgress && (
                    <StatusAlert
                      variant="info"
                      indicator={<Download className="size-4" />}
                      title="Downloading update…"
                      description={`${Math.round(downloadProgress.percent)}% complete`}
                    />
                  )}

                  {updateReady && (
                    <StatusAlert
                      variant="success"
                      indicator={<CheckCircle className="size-4" />}
                      title="Update ready to install"
                      description="The app will restart and install the update."
                      actions={
                        <Button
                          size="xs"
                          onClick={() => window.electronAPI?.restartAndInstall()}
                        >
                          Restart now
                        </Button>
                      }
                    />
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
