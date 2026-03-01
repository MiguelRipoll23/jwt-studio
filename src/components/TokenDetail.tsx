import { useState, useEffect, useCallback } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Textarea } from '@openai/apps-sdk-ui/components/Textarea';
import { Alert } from '@openai/apps-sdk-ui/components/Alert';
import { Badge } from '@openai/apps-sdk-ui/components/Badge';

import {

  CheckCircle,

  Copy,
  TriangleExclamationErrorWarning,
  Key,
  Trash,
} from '@openai/apps-sdk-ui/components/Icon';
import { getIcon } from './IconPicker';
import type { ProjectStore } from '../store';
import type { AppSettingsStore } from '../appSettings';
import { generateJWT } from '../utils/jwt';
import { TokenForm } from './TokenForm';

interface TokenDetailProps {
  store: ProjectStore;
  appSettings: AppSettingsStore;
}

export function TokenDetail({ store, appSettings }: TokenDetailProps) {
  const { selectedProject, selectedToken, selectedProjectId, selectedTokenId } = store;
  const { settings } = appSettings;

  const [payloadText, setPayloadText] = useState('');
  const [payloadError, setPayloadError] = useState('');
  const [jwt, setJwt] = useState('');
  const [jwtError, setJwtError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTokenEdit, setShowTokenEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset when token changes
  useEffect(() => {
    if (selectedToken) {
      const text = JSON.stringify(selectedToken.payload, null, 2);
      setPayloadText(text);
      setPayloadError('');
      setJwt('');
      setJwtError('');
    }
  }, [selectedTokenId, selectedToken]);

  const regenerateJWT = useCallback(async (payloadOverride?: Record<string, unknown>) => {
    if (!selectedProject || !selectedToken) return;
    setIsGenerating(true);
    setJwtError('');
    try {
      const payload = payloadOverride ?? selectedToken.payload;
      const token = payloadOverride ? { ...selectedToken, payload } : selectedToken;
      const result = await generateJWT(selectedProject, token);
      setJwt(result);
      if (settings.autoCopyToken) {
        await navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err: unknown) {
      setJwtError((err as Error).message ?? 'Failed to generate JWT');
      setJwt('');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProject, selectedToken, settings.autoCopyToken]);

  // Auto-generate when token loads
  useEffect(() => {
    if (selectedToken && selectedProject) {
      regenerateJWT();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokenId, selectedProjectId]);

  function handlePayloadChange(value: string) {
    setPayloadText(value);
    try {
      const parsed = JSON.parse(value);
      setPayloadError('');
      if (selectedProjectId && selectedTokenId) {
        store.updateToken(selectedProjectId, selectedTokenId, { payload: parsed });
        regenerateJWT(parsed);
      }
    } catch {
      setPayloadError('Invalid JSON');
      setJwt('');
    }
  }

  function handleCopy() {
    if (!jwt) return;
    navigator.clipboard.writeText(jwt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!selectedProject || !selectedToken || !selectedProjectId || !selectedTokenId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--gray-400)] gap-3">
        <Key className="w-10 h-10" />
        <p className="text-sm text-[var(--gray-500)]">Select a token to view and edit</p>
      </div>
    );
  }

  const TokenIcon = getIcon(selectedToken.icon) ?? Key;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Token Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--alpha-08)] shrink-0">
        <div className="flex items-center gap-2">
          <TokenIcon className="w-5 h-5 text-[var(--gray-600)]" />
          <h3 className="font-semibold text-[var(--gray-900)]">{selectedToken.name}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            color="secondary"
            variant="ghost"
            size="xs"
            onClick={() => setShowTokenEdit(true)}
          >
            Edit
          </Button>
          <Button
            color="danger"
            variant="ghost"
            size="xs"
            uniform
            onClick={() => store.deleteToken(selectedProjectId, selectedTokenId)}
            title="Delete token"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit Token Modal */}
      {showTokenEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--gray-0)] rounded-xl shadow-xl border border-[var(--alpha-08)] w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-[var(--gray-900)] mb-4">Edit Token</h3>
            <TokenForm
              initial={selectedToken}
              onSubmit={data => {
                store.updateToken(selectedProjectId, selectedTokenId, { name: data.name, icon: data.icon });
                setShowTokenEdit(false);
                regenerateJWT();
              }}
              onCancel={() => setShowTokenEdit(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col gap-0 divide-y divide-[var(--alpha-08)]">
        {/* Payload Editor */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--gray-700)]">Payload (JSON)</label>
            {payloadError ? (
              <Badge color="danger" size="sm">
                <TriangleExclamationErrorWarning className="w-3 h-3 mr-1" />
                Invalid JSON
              </Badge>
            ) : (
              <Badge color="success" size="sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </Badge>
            )}
          </div>
          <Textarea
            value={payloadText}
            onChange={e => handlePayloadChange(e.target.value)}
            rows={8}
            autoResize
            maxRows={16}
            invalid={!!payloadError}
            className="font-mono text-sm"
          />
          {payloadError && (
            <Alert color="danger" variant="soft" description={payloadError} />
          )}
        </div>

        {/* JWT Output */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--gray-700)]">Signed token</label>
            <div className="flex items-center gap-2">
              
              {jwt && (
  <div className="relative">
    <Button
      color="secondary"
      variant={copied ? 'soft' : 'ghost'}
      size="xs"
      onClick={handleCopy}
    >
      <Copy className="w-3.5 h-3.5" />
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  </div>
)}
            </div>
          </div>

          {jwtError && (
            <Alert
              color="danger"
              variant="soft"
              title="Signing failed"
              description={jwtError}
            />
          )}

          {isGenerating && (
            <div className="text-xs text-[var(--gray-500)] py-2">Generating...</div>
          )}

          {jwt && !isGenerating && (
            <div
              className="relative font-mono text-xs break-all text-[var(--gray-800)] select-all cursor-text"
              onClick={handleCopy}
              title="Click to copy"
            >
              <span className="text-[#e67c73]">{jwt.split('.')[0]}</span>
              <span className="text-[var(--gray-500)]">.</span>
              <span className="text-[#4caf8a]">{jwt.split('.')[1]}</span>
              <span className="text-[var(--gray-500)]">.</span>
              <span className="text-[#6fa8dc]">{jwt.split('.')[2]}</span>
            </div>
          )}

          {!jwt && !isGenerating && !jwtError && (
            <div className="text-xs text-[var(--gray-400)] py-2">JWT will appear here</div>
          )}
        </div>
      </div>
    </div>
  );
}
