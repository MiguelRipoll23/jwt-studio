import * as Icons from '@openai/apps-sdk-ui/components/Icon';
import { Button } from '@openai/apps-sdk-ui/components/Button';
import { Input } from '@openai/apps-sdk-ui/components/Input';
import { MagnifyingGlassSearch } from '@openai/apps-sdk-ui/components/Icon';
import { useState, useMemo } from 'react';

// Curated list of icons available from the SDK
export const ICON_NAMES = [
  'ApiKey', 'Archive', 'Agent', 'Analytics', 'AtSign',
  'Bell', 'Bolt', 'Book', 'BookOpen', 'Brain', 'Branch', 'Bug',
  'Calendar', 'Camera', 'Certificate', 'Chart', 'Chat', 'Check', 'CheckCircle', 'Clock', 'Code', 'Copy',
  'Delete', 'Document', 'Download',
  'Edit', 'EditPencil', 'Email', 'Eye',
  'File', 'FileCode', 'FileDocument', 'Filter', 'Flask', 'Folder', 'Function',
  'Globe', 'GraduationCap', 'Grid',
  'Heart', 'Help', 'History', 'Home',
  'Identity', 'Info',
  'Key', 'Keyboard',
  'Language', 'Link', 'Lock',
  'Mail', 'Members', 'Menu', 'Mic',
  'Nodes', 'Notebook',
  'OpenaiLogoBold',
  'Pencil', 'Phone', 'Plus', 'Plugin',
  'Robot', 'RobotHead',
  'Search', 'Settings', 'Share', 'ShieldKey', 'ShieldLock', 'Star', 'Storage',
  'Tag', 'Tasks', 'Terminal', 'Trash',
  'User', 'Users',
  'Warning',
  'Workspace',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export function getIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> | null {
  return (Icons as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[name] ?? null;
}

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    ICON_NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="Search icons..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        startAdornment={<MagnifyingGlassSearch className="w-5 h-5 text-[var(--gray-500)]" />}
        size="sm"
      />
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
        {filtered.map(name => {
          const Icon = getIcon(name);
          if (!Icon) return null;
          return (
            <Button
              key={name}
              color="secondary"
              variant={value === name ? 'solid' : 'ghost'}
              size="sm"
              uniform
              className="px-4 py-4"
              title={name}
              onClick={() => onChange(name)}
            >
              <Icon className="w-5 h-5" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
