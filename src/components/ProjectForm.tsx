import { useState, type FormEvent } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Input } from '@openai/apps-sdk-ui/components/Input';
import { Select } from '@openai/apps-sdk-ui/components/Select';
import { Textarea } from '@openai/apps-sdk-ui/components/Textarea';
import { Alert } from '@openai/apps-sdk-ui/components/Alert';
import { Eye, EyeClosed } from '@openai/apps-sdk-ui/components/Icon';
import { IconPicker } from './IconPicker';
import type { Project, Algorithm } from '../types';
import { ALGORITHMS, DURATIONS, isHmacAlgorithm } from '../types';

interface ProjectFormProps {
  initial?: Project;
  onSubmit: (data: Omit<Project, 'id' | 'tokens'>) => void;
  onCancel: () => void;
  defaultAlgorithm?: Algorithm;
  defaultDuration?: string;
}

const ALGORITHM_OPTIONS = ALGORITHMS.map(a => ({ value: a, label: a }));
const DURATION_OPTIONS = DURATIONS.map(d => ({ value: d.value, label: d.label }));

export function ProjectForm({ initial, onSubmit, onCancel, defaultAlgorithm = 'HS256', defaultDuration = '1d' }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'ApiKey');
  const [algorithm, setAlgorithm] = useState<Algorithm>(initial?.algorithm ?? defaultAlgorithm);
  const [secret, setSecret] = useState(
    typeof initial?.secret === 'string' ? initial.secret : ''
  );
  const [privateKey, setPrivateKey] = useState(
    typeof initial?.secret === 'object' ? initial.secret.privateKey : ''
  );
  const [publicKey, setPublicKey] = useState(
    typeof initial?.secret === 'object' ? initial.secret.publicKey : ''
  );
  const [duration, setDuration] = useState(initial?.duration ?? defaultDuration);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  const hmac = isHmacAlgorithm(algorithm);

  function handleAlgorithmChange(option: { value: string }) {
    const alg = option.value as Algorithm;
    setAlgorithm(alg);
    setError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    if (hmac && !secret.trim()) { setError('Secret is required for HMAC algorithms.'); return; }
    if (!hmac && !privateKey.trim()) { setError('Private key is required for asymmetric algorithms.'); return; }

    onSubmit({
      name: name.trim(),
      icon,
      algorithm,
      secret: hmac ? secret : { privateKey, publicKey },
      duration,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert color="danger" variant="soft" description={error} />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--gray-700)]">Project Name</label>
        <Input
          placeholder="My API"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--gray-700)]">Icon</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-[var(--gray-700)]">Algorithm</label>
          <Select
            options={ALGORITHM_OPTIONS}
            value={algorithm}
            onChange={handleAlgorithmChange}
            variant="outline"
            placeholder="Select algorithm..."
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-[var(--gray-700)]">Token Duration</label>
          <Select
            options={DURATION_OPTIONS}
            value={duration}
            onChange={opt => setDuration(opt.value)}
            variant="outline"
            placeholder="Select duration..."
          />
        </div>
      </div>

      {hmac ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-[var(--gray-700)]">Secret</label>
          <Input
            type={showSecret ? 'text' : 'password'}
            placeholder="your-secret-key"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            endAdornment={
              <button type="button" onClick={() => setShowSecret(v => !v)} className="flex items-center text-[var(--gray-500)] hover:text-[var(--gray-700)]">
                {showSecret ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--gray-700)]">Private Key (PEM)</label>
            <Textarea
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              rows={4}
              autoResize
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[var(--gray-700)]">Public Key (PEM) — optional</label>
            <Textarea
              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
              value={publicKey}
              onChange={e => setPublicKey(e.target.value)}
              rows={3}
              autoResize
            />
          </div>
        </>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button color="secondary" variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button color="primary" variant="solid" type="submit">
          {initial ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
