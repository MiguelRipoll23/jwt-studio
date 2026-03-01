import { useState, type FormEvent } from 'react';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Input } from '@openai/apps-sdk-ui/components/Input';
import { Alert } from '@openai/apps-sdk-ui/components/Alert';
import { IconPicker } from './IconPicker';
import type { Token } from '../types';

interface TokenFormProps {
  initial?: Token;
  onSubmit: (data: Omit<Token, 'id'>) => void;
  onCancel: () => void;
}

export function TokenForm({ initial, onSubmit, onCancel }: TokenFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'Key');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Token name is required.'); return; }
    onSubmit({
      name: name.trim(),
      icon,
      payload: initial?.payload ?? { sub: 'user-id' },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert color="danger" variant="soft" description={error} />}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--gray-700)]">Token Name</label>
        <Input
          placeholder="Admin token"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[var(--gray-700)]">Icon</label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button color="secondary" variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button color="primary" variant="solid" type="submit">
          {initial ? 'Save' : 'Create Token'}
        </Button>
      </div>
    </form>
  );
}
