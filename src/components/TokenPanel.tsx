import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StatusAlert } from './ui-ext/status-alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Trash2, Pencil, KeyRound, Folder } from 'lucide-react';
import { getIcon } from './IconPicker';
import type { ProjectStore } from '../store';
import type { Token } from '../types';
import { TokenForm } from './TokenForm';
import { ProjectForm } from './ProjectForm';

interface TokenPanelProps {
  store: ProjectStore;
}

function TokenItem({
  token,
  selected,
  onClick,

}: {
  token: Token;
  selected: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const Icon = getIcon(token.icon) ?? KeyRound;
  return (
    <div
      className={[
        'group flex items-center gap-2.5 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors',
        selected
          ? 'bg-accent text-foreground font-medium'
          : 'hover:bg-accent/50 text-foreground',
      ].join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-5 shrink-0" />
        <span className="truncate text-sm font-medium">{token.name}</span>
      </div>

    </div>
  );
}

export function TokenPanel({ store }: TokenPanelProps) {
  const { selectedProject, selectedProjectId, selectedTokenId } = store;
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [showProjectEdit, setShowProjectEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!selectedProject || !selectedProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Folder className="size-5" />
        <p className="text-sm">Select a project</p>
      </div>
    );
  }

  const algorithmType = selectedProject.algorithm.startsWith('HS') ? 'HMAC'
    : selectedProject.algorithm.startsWith('RS') ? 'RSA'
    : selectedProject.algorithm.startsWith('ES') ? 'ECDSA'
    : 'RSA-PSS';

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="font-semibold truncate">{selectedProject.name}</h2>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowProjectEdit(true)}
              title="Edit project"
            >
              <Pencil className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirm(true)}
              title="Delete project"
            >
              <Trash2 className="size-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            {selectedProject.algorithm}
          </Badge>
          <Badge variant="secondary">{algorithmType}</Badge>
          <Badge variant="secondary">
            {selectedProject.duration === 'never' ? 'No expiry' :
  selectedProject.duration
    .replace(/(\d+)d\b/, '$1 day')
    .replace(/(\d+)h\b/, '$1 hour')
    .replace(/(\d+)m\b/, '$1 month')
}
          </Badge>
        </div>
      </div>

      {/* Delete project confirmation */}
      {deleteConfirm && (
        <div className="px-3 py-2">
          <StatusAlert
            variant="danger"
            title="Delete project?"
            description="This will delete all tokens in this project."
            actions={
              <div className="flex gap-2">
                <Button variant="destructive" size="xs" onClick={() => {
                  store.deleteProject(selectedProjectId);
                  setDeleteConfirm(false);
                }}>Delete</Button>
                <Button variant="ghost" size="xs" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              </div>
            }
          />
        </div>
      )}

      {/* Edit Project Modal */}
      <Dialog open={showProjectEdit} onOpenChange={setShowProjectEdit}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            initial={selectedProject}
            onSubmit={data => {
              store.updateProject(selectedProjectId, data);
              setShowProjectEdit(false);
              setTimeout(() => {
                if (store.selectedTokenId) {
                  store.selectToken(store.selectedTokenId);
                }
              }, 0);
            }}
            onCancel={() => setShowProjectEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Tokens List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold capitalize">Tokens</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowTokenForm(true)}
            title="New Token"
          >
            <Plus className="size-5" />
          </Button>
        </div>
        {selectedProject.tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <KeyRound className="size-5" />
            <p className="text-xs">No tokens yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {selectedProject.tokens.map(token => (
              <TokenItem
                key={token.id}
                token={token}
                selected={selectedTokenId === token.id}
                onClick={() => store.selectToken(token.id)}
                onDelete={() => store.deleteToken(selectedProjectId, token.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Token Form Modal */}
      <Dialog open={showTokenForm} onOpenChange={setShowTokenForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Token</DialogTitle>
          </DialogHeader>
          <TokenForm
            onSubmit={data => {
              store.createToken(selectedProjectId, data);
              setShowTokenForm(false);
            }}
            onCancel={() => setShowTokenForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
