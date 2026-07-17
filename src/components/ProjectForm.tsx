import { useState, type FormEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { StatusAlert } from './ui-ext/status-alert';
import { Eye, EyeOff } from 'lucide-react';
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

export function ProjectForm({ initial, onSubmit, onCancel, defaultAlgorithm = 'HS256', defaultDuration = '1d' }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'KeyRound');
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
        <StatusAlert variant="danger" description={error} />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">Project Name</label>
        <Input
          placeholder="My API"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-muted-foreground">Icon</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-muted-foreground">Algorithm</label>
          <Select value={algorithm} onValueChange={value => { setAlgorithm(value as Algorithm); setError(''); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select algorithm..." />
            </SelectTrigger>
            <SelectContent>
              {ALGORITHMS.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium text-muted-foreground">Token Duration</label>
          <Select value={duration} onValueChange={value => setDuration(value ?? duration)}>
            <SelectTrigger className="w-full">
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

      {hmac ? (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-muted-foreground">Secret</label>
          <div className="relative">
            <Input
              type={showSecret ? 'text' : 'password'}
              placeholder="your-secret-key"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowSecret(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Private Key (PEM)</label>
            <Textarea
              placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Public Key (PEM) — optional</label>
            <Textarea
              placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
              value={publicKey}
              onChange={e => setPublicKey(e.target.value)}
              rows={3}
            />
          </div>
        </>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit">
          {initial ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
