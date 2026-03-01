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

export interface AppSettings {
  defaultAlgorithm: Algorithm;
  defaultDuration: string;
  confirmDelete: boolean;
  autoCopyToken: boolean;
}

export const SETTINGS_DEFAULTS: AppSettings = {
  defaultAlgorithm: 'HS256',
  defaultDuration: '1d',
  confirmDelete: true,
  autoCopyToken: false,
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
  { label: '4 hours', value: '4h' },
  { label: '1 day', value: '1d' },
  { label: '1 month', value: '1m' },
  { label: '3 months', value: '3m' },
];
