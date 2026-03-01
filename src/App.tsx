import { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { TokenPanel } from './components/TokenPanel';
import { TokenDetail } from './components/TokenDetail';
import { ProjectForm } from './components/ProjectForm';
import { Settings } from './components/Settings';
import { UpdateToast } from './components/UpdateToast';
import { useProjectStore } from './store';
import { useAppSettings } from './appSettings';
import type { Project } from './types';

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function App() {
  const store = useProjectStore();
  const appSettings = useAppSettings();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ version: string; url: string } | null>(null);

  useEffect(() => {
    window.electronAPI.checkForUpdates().then((result) => {
      if (result && compareVersions(result.version, __APP_VERSION__) > 0) {
        setUpdateInfo(result);
      }
    }).catch(() => { /* ignore */ });
  }, []);

  function handleImport(imported: Project[]) {
    store.replaceProjects(imported);
    setShowSettings(false);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--gray-0)] text-[var(--gray-900)]">
      <Sidebar
        store={store}
        onNewProject={() => setShowNewProject(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="w-72 shrink-0 border-r border-[var(--alpha-08)] bg-[var(--gray-25)] overflow-hidden">
        <TokenPanel store={store} />
      </div>

      <div className="flex-1 overflow-hidden bg-[var(--gray-0)]">
        <TokenDetail store={store} appSettings={appSettings} />
      </div>

      {showNewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--gray-0)] rounded-xl shadow-xl border border-[var(--alpha-08)] w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold text-[var(--gray-900)] mb-4">New Project</h3>
              <ProjectForm
                onSubmit={data => {
                  store.createProject(data);
                  setShowNewProject(false);
                }}
                onCancel={() => setShowNewProject(false)}
                defaultAlgorithm={appSettings.settings.defaultAlgorithm}
                defaultDuration={appSettings.settings.defaultDuration}
              />
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <Settings
          projects={store.projects}
          onImport={handleImport}
          onClose={() => setShowSettings(false)}
          appSettings={appSettings}
        />
      )}

      {updateInfo && (
        <UpdateToast version={updateInfo.version} url={updateInfo.url} />
      )}
    </div>
  );
}

export default App;

