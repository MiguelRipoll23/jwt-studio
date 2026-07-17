import { useState } from 'react';
import { Button } from './ui/button';
import { Plus, Moon, Sun, KeyRound, Settings, PanelLeftClose } from 'lucide-react';
import { getIcon } from './IconPicker';
import type { ProjectStore } from '../store';
import type { Project, ThemeMode } from '../types';
import type { AppSettingsStore } from '../appSettings';
import { applyDocumentTheme, THEME_KEY } from '../lib/theme';

interface SidebarProps {
  store: ProjectStore;
  appSettings: AppSettingsStore;
  onNewProject: () => void;
  onOpenSettings: () => void;
}

function ProjectItem({
  project,
  selected,
  onClick,
  collapsed,
}: {
  project: Project;
  selected: boolean;
  onClick: () => void;
  collapsed: boolean;
}) {
  const Icon = getIcon(project.icon) ?? KeyRound;
  return (
    <button
      onClick={onClick}
      title={collapsed ? project.name : undefined}
      className={[
        'flex items-center gap-2.5 w-full rounded-lg text-left transition-colors text-sm cursor-pointer',
        collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
        selected
          ? 'bg-foreground/8 text-foreground font-medium'
          : 'text-foreground hover:bg-foreground/5',
      ].join(' ')}
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{project.name}</span>}
    </button>
  );
}

export function Sidebar({ store, appSettings, onNewProject, onOpenSettings }: SidebarProps) {
  const { settings, updateSettings } = appSettings;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const effectiveTheme = settings.themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : settings.themeMode;
  const isDark = effectiveTheme === 'dark';

  function applyTheme(themeMode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const newTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    applyDocumentTheme(newTheme);
    localStorage.setItem(THEME_KEY, themeMode);
    window.electronAPI?.setTitleBarColor(newTheme);
  }

  function toggleTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentEffective = settings.themeMode === 'system'
      ? (prefersDark ? 'dark' : 'light')
      : settings.themeMode;
    const next: ThemeMode = currentEffective === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: next });
    applyTheme(next);
  }

  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`flex flex-col h-full ${collapsed ? 'w-14' : 'w-60'} shrink-0 border-r bg-muted transition-all duration-200 overflow-hidden`}>
      {/* Logo + Collapse Button */}
      <div className={`flex items-center border-b px-3 py-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && <KeyRound className="size-5" />}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeftClose className="size-5 transition-transform duration-200" style={{ transform: collapsed ? 'rotate(180deg)' : undefined }} />
        </Button>
      </div>
      {/* Header */}
      {!collapsed && (
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-semibold capitalize">Projects</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={onNewProject}
            title="New Project"
          >
            <Plus className="size-5" />
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center px-2 py-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onNewProject}
            title="New Project"
          >
            <Plus className="size-5" />
          </Button>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {store.projects.length === 0 ? null : (
          <div className="flex flex-col gap-1.5">
            {[...store.projects].sort((a, b) => a.name.localeCompare(b.name)).map(project => (
              <ProjectItem
                key={project.id}
                project={project}
                selected={store.selectedProjectId === project.id}
                onClick={() => store.selectProject(project.id)}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer: version + settings + theme */}
      <div className={`flex items-center border-t px-2 py-2 ${collapsed ? 'flex-col gap-1' : 'justify-between px-4'}`}>
        {!collapsed && <span className="text-xs">v{__APP_VERSION__}</span>}
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
