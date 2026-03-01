import { useState } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import {
  Plus,
  Moon,
  Sun,
  ApiKey,
  ApiKeys,
  SettingsCog,
  SidebarCollapseLeft,
} from '@openai/apps-sdk-ui/components/Icon';
import { getIcon } from './IconPicker';
import type { ProjectStore } from '../store';
import type { Project, ThemeMode } from '../types';
import type { AppSettingsStore } from '../appSettings';
import { applyDocumentTheme, useDocumentTheme } from '@openai/apps-sdk-ui/theme';
import { THEME_KEY } from '../main';

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
  const Icon = getIcon(project.icon) ?? ApiKey;
  return (
    <button
      onClick={onClick}
      title={collapsed ? project.name : undefined}
      className={[
        'flex items-center gap-2.5 w-full rounded-lg text-left transition-colors text-sm',
        collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2',
        selected
          ? 'bg-[var(--alpha-08)] text-[var(--gray-900)] font-medium'
          : 'text-[var(--gray-700)] hover:bg-[var(--alpha-05)] hover:text-[var(--gray-900)]',
      ].join(' ')}
    >
      <Icon className="w-5 h-5 shrink-0 text-[var(--gray-600)]" />
      {!collapsed && <span className="truncate">{project.name}</span>}
    </button>
  );
}

export function Sidebar({ store, appSettings, onNewProject, onOpenSettings }: SidebarProps) {
  const theme = useDocumentTheme();
  const isDark = theme === 'dark';
  const { settings, updateSettings } = appSettings;

  function applyTheme(themeMode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const newTheme = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    applyDocumentTheme(newTheme);
    localStorage.setItem(THEME_KEY, themeMode);
    if (window.electronAPI?.setTitleBarColor) {
      window.electronAPI.setTitleBarColor(newTheme);
    }
  }

  function toggleTheme() {
    // Cycle: system -> light -> dark -> system
    const current = settings.themeMode;
    let next: ThemeMode;
    if (current === 'system') next = 'light';
    else if (current === 'light') next = 'dark';
    else next = 'system';
    updateSettings({ themeMode: next });
    applyTheme(next);
  }

  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`flex flex-col h-full ${collapsed ? 'w-14' : 'w-60'} shrink-0 border-r border-[var(--alpha-08)] bg-[var(--gray-50)] transition-all duration-200 overflow-hidden`}>
      {/* Logo + Collapse Button */}
      <div className={`flex items-center border-b border-[var(--alpha-08)] px-3 py-3 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
        {!collapsed && <ApiKeys className="w-5 h-5 text-[var(--gray-800)]" />}
        <Button
          color="secondary"
          variant="ghost"
          size="xs"
          uniform
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarCollapseLeft className="w-5 h-5 transition-transform duration-200" style={{ transform: collapsed ? 'rotate(180deg)' : undefined }} />
        </Button>
      </div>
      {/* Header */}
      {!collapsed && (
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xs font-medium text-[var(--gray-500)] uppercase tracking-wide">Projects</span>
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            onClick={onNewProject}
            title="New Project"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="flex justify-center px-2 py-3">
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            uniform
            onClick={onNewProject}
            title="New Project"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {store.projects.length === 0 ? null : (
          <div className="flex flex-col gap-1.5">
            {store.projects.map(project => (
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
      <div className={`flex items-center border-t border-[var(--alpha-08)] px-2 py-2 ${collapsed ? 'flex-col gap-1' : 'justify-between px-4'}`}>
        {!collapsed && <span className="text-xs text-[var(--gray-400)]">v{__APP_VERSION__}</span>}
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            uniform
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            uniform
            onClick={onOpenSettings}
            title="Settings"
          >
            <SettingsCog className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

