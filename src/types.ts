export type Algorithm =
  | 'HS256' | 'HS384' | 'HS512'
  | 'RS256' | 'RS384' | 'RS512'
  | 'ES256' | 'ES384' | 'ES512'
  | 'PS256' | 'PS384' | 'PS512';

export type HmacAlgorithm = 'HS256' | 'HS384' | 'HS512';
export type AsymmetricAlgorithm = 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'PS256' | 'PS384' | 'PS512';

export function isHmacAlgorithm(alg: Algorithm): alg is HmacAlgorithm {
  return alg.startsWith('HS');
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  defaultAlgorithm: Algorithm;
  defaultDuration: string;
  confirmDelete: boolean;
  autoCopyToken: boolean;
  themeMode: ThemeMode;
}

export const SETTINGS_DEFAULTS: AppSettings = {
  defaultAlgorithm: 'HS256',
  defaultDuration: '1 day',
  confirmDelete: true,
  autoCopyToken: false,
  themeMode: 'system',
};

export interface AsymmetricSecret {
  privateKey: string;
  publicKey: string;
}

export interface Token {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  algorithm: Algorithm;
  secret: string | AsymmetricSecret;
  duration: string;
  tokens: Token[];
}

export const ALGORITHMS: Algorithm[] = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'ES256', 'ES384', 'ES512',
  'PS256', 'PS384', 'PS512',
];

export const DURATIONS = [
  { label: '4 hours', value: '4 hours' },
  { label: '1 day', value: '1 day' },
  { label: '1 month', value: '1 month' },
  { label: '3 months', value: '3 months' },
];
