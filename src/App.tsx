import { useState } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { TokenPanel } from './components/TokenPanel';
import { TokenDetail } from './components/TokenDetail';
import { ProjectForm } from './components/ProjectForm';
import { Settings } from './components/Settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { useProjectStore } from './store';
import { useAppSettings } from './appSettings';
import type { Project } from './types';

function App() {
  const store = useProjectStore();
  const appSettings = useAppSettings();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  function handleImport(imported: Project[]) {
    store.replaceProjects(imported);
    setShowSettings(false);
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        store={store}
        appSettings={appSettings}
        onNewProject={() => setShowNewProject(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="w-72 shrink-0 border-r bg-muted overflow-hidden">
        <TokenPanel store={store} />
      </div>

      <div className="flex-1 overflow-hidden bg-background">
        <TokenDetail store={store} appSettings={appSettings} />
      </div>

      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={data => {
              store.createProject(data);
              setShowNewProject(false);
            }}
            onCancel={() => setShowNewProject(false)}
            defaultAlgorithm={appSettings.settings.defaultAlgorithm}
            defaultDuration={appSettings.settings.defaultDuration}
          />
        </DialogContent>
      </Dialog>

      {showSettings && (
        <Settings
          projects={store.projects}
          onImport={handleImport}
          onClose={() => setShowSettings(false)}
          appSettings={appSettings}
        />
      )}

    </div>
  );
}

export default App;
