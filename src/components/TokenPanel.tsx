import { useState } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Badge } from '@openai/apps-sdk-ui/components/Badge';
import { Alert } from '@openai/apps-sdk-ui/components/Alert';
import {
  Plus,
  Trash,
  Settings,
  Key,

  Clock,
  ApiKey,
  Folder,
} from '@openai/apps-sdk-ui/components/Icon';
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
  const Icon = getIcon(token.icon) ?? ApiKey;
  return (
    <div
      className={[
        'group flex items-center gap-2.5 w-full px-3 py-2 rounded-lg cursor-pointer transition-colors',
        selected
          ? 'bg-[var(--alpha-08)] text-[var(--gray-900)]'
          : 'hover:bg-[var(--alpha-05)] text-[var(--gray-700)]',
      ].join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <Icon className="w-5 h-5 shrink-0 text-[var(--gray-600)]" />
      <span className="flex-1 truncate text-sm font-medium">{token.name}</span>

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
      <div className="flex flex-col items-center justify-center h-full text-[var(--gray-500)] gap-2">
        <Folder className="w-8 h-8" />
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
      <div className="px-4 py-3 border-b border-[var(--alpha-08)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="font-semibold text-[var(--gray-900)] truncate">{selectedProject.name}</h2>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              color="secondary"
              variant="ghost"
              size="xs"
              uniform
              onClick={() => setShowProjectEdit(true)}
              title="Edit project"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              color="danger"
              variant="ghost"
              size="xs"
              uniform
              onClick={() => setDeleteConfirm(true)}
              title="Delete project"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge color="info" size="sm">
            {selectedProject.algorithm}
          </Badge>
          <Badge color="secondary" size="sm">{algorithmType}</Badge>
          <Badge color="secondary" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            {selectedProject.duration === 'never' ? 'No expiry' : selectedProject.duration}
          </Badge>
        </div>
      </div>

      {/* Delete project confirmation */}
      {deleteConfirm && (
        <div className="px-3 py-2">
          <Alert
            color="danger"
            variant="soft"
            title="Delete project?"
            description="This will delete all tokens in this project."
            actions={
              <div className="flex gap-2">
                <Button color="danger" variant="solid" size="xs" onClick={() => {
                  store.deleteProject(selectedProjectId);
                  setDeleteConfirm(false);
                }}>Delete</Button>
                <Button color="secondary" variant="ghost" size="xs" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
              </div>
            }
          />
        </div>
      )}

      {/* Edit Project Modal */}
      {showProjectEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--gray-0)] rounded-xl shadow-xl border border-[var(--alpha-08)] w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[var(--gray-900)] mb-4">Edit Project</h3>
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
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-medium text-[var(--gray-500)] uppercase tracking-wide">Tokens</span>
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            onClick={() => setShowTokenForm(true)}
            title="New Token"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {selectedProject.tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--gray-400)] gap-2">
            <Key className="w-6 h-6" />
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
      {showTokenForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--gray-0)] rounded-xl shadow-xl border border-[var(--alpha-08)] w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-[var(--gray-900)] mb-4">New Token</h3>
            <TokenForm
              onSubmit={data => {
                store.createToken(selectedProjectId, data);
                setShowTokenForm(false);
              }}
              onCancel={() => setShowTokenForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
