import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { StatusAlert } from './ui-ext/status-alert';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

import { CheckCircle, Copy, AlertTriangle, KeyRound, Trash2, Pencil } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <KeyRound className="size-5" />
        <p className="text-sm">Select a token to view and edit</p>
      </div>
    );
  }

  const TokenIcon = getIcon(selectedToken.icon) ?? KeyRound;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Token Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <TokenIcon className="size-5" />
          <h3 className="font-semibold mb-0.5">{selectedToken.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowTokenEdit(true)}
            title="Edit token"
          >
            <Pencil className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            onClick={() => store.deleteToken(selectedProjectId, selectedTokenId)}
            title="Delete token"
          >
            <Trash2 className="size-5" />
          </Button>
        </div>
      </div>

      {/* Edit Token Modal */}
      <Dialog open={showTokenEdit} onOpenChange={setShowTokenEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Token</DialogTitle>
          </DialogHeader>
          <TokenForm
            initial={selectedToken}
            onSubmit={data => {
              store.updateToken(selectedProjectId, selectedTokenId, { name: data.name, icon: data.icon });
              setShowTokenEdit(false);
              regenerateJWT();
            }}
            onCancel={() => setShowTokenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto flex flex-col gap-0 divide-y">
        {/* Payload Editor */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Payload</label>
            {payloadError ? (
              <Badge variant="destructive">
                <AlertTriangle className="size-4 mr-1" />
                Invalid JSON
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="size-4 mr-1" />
                Valid
              </Badge>
            )}
          </div>
          <Textarea
            value={payloadText}
            onChange={e => handlePayloadChange(e.target.value)}
            rows={8}
            aria-invalid={!!payloadError}
            className="font-mono text-sm"
          />
          {payloadError && (
            <StatusAlert variant="danger" description={payloadError} />
          )}
        </div>

        {/* JWT Output */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Signed token</label>
            <div className="flex items-center gap-2">

              {jwt && (
  <div className="relative">
    <Button
      variant={copied ? 'secondary' : 'ghost'}
      size="xs"
      onClick={handleCopy}
    >
      <Copy className="size-5" />
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </Button>
  </div>
)}
            </div>
          </div>

          {jwtError && (
            <StatusAlert
              variant="danger"
              title="Signing failed"
              description={jwtError}
            />
          )}

          {isGenerating && (
            <div className="text-xs text-muted-foreground py-2">Generating...</div>
          )}

          {jwt && !isGenerating && (
            <div
              className="relative font-mono text-xs break-all text-foreground/80 select-all cursor-text"
              onClick={handleCopy}
              title="Click to copy"
            >
              <span className="text-[#e67c73]">{jwt.split('.')[0]}</span>
              <span className="text-muted-foreground">.</span>
              <span className="text-[#4caf8a]">{jwt.split('.')[1]}</span>
              <span className="text-muted-foreground">.</span>
              <span className="text-[#6fa8dc]">{jwt.split('.')[2]}</span>
            </div>
          )}

          {!jwt && !isGenerating && !jwtError && (
            <div className="text-xs text-muted-foreground py-2">JWT will appear here</div>
          )}
        </div>
      </div>
    </div>
  );
}
