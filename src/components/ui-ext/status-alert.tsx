import type { ReactNode } from 'react';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '../ui/alert';
import { cn } from '../../lib/utils';

type StatusVariant = 'success' | 'info' | 'danger';

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 [&_[data-slot=alert-description]]:text-emerald-700/90 dark:[&_[data-slot=alert-description]]:text-emerald-400/90',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400 [&_[data-slot=alert-description]]:text-sky-700/90 dark:[&_[data-slot=alert-description]]:text-sky-400/90',
  danger: '',
};

interface StatusAlertProps {
  variant: StatusVariant;
  title?: string;
  description: ReactNode;
  indicator?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Thin wrapper over shadcn's Alert providing the success/info/danger tinted
 * variants and inline actions that @openai/apps-sdk-ui's Alert offered natively.
 */
export function StatusAlert({ variant, title, description, indicator, actions, className }: StatusAlertProps) {
  return (
    <Alert
      variant={variant === 'danger' ? 'destructive' : 'default'}
      className={cn(VARIANT_CLASSES[variant], className)}
    >
      {indicator}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
      {actions && <AlertAction className="static mt-2 flex">{actions}</AlertAction>}
    </Alert>
  );
}
