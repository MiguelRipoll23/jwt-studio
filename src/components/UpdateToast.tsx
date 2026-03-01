import { useState } from 'react';
import { DownloadSimple, CloseBold } from '@openai/apps-sdk-ui/components/Icon';

interface UpdateToastProps {
  version: string;
  url: string;
}

export function UpdateToast({ version, url }: UpdateToastProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-[var(--alpha-08)] bg-[var(--gray-0)] max-w-sm">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--gray-900)]">Update available — v{version}</p>
        <p className="text-xs text-[var(--gray-500)] mt-0.5">A new version of JWT Studio is ready.</p>
      </div>
      <button
        onClick={() => window.electronAPI.openExternal(url)}
        className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--gray-900)] text-[var(--gray-0)] hover:opacity-80 transition-opacity"
      >
        <DownloadSimple className="w-3.5 h-3.5" />
        Download
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded-lg text-[var(--gray-500)] hover:bg-[var(--alpha-05)] hover:text-[var(--gray-900)] transition-colors"
        aria-label="Dismiss"
      >
        <CloseBold className="w-4 h-4" />
      </button>
    </div>
  );
}
