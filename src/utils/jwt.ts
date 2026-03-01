import { SignJWT, importPKCS8 } from 'jose';
import type { Project, Token } from '../types';
import { isHmacAlgorithm } from '../types';

function parseDuration(duration: string): number | null {
  if (duration === 'never') return null;
  const match = duration.match(/^(\d+)([hdm])$/);
  if (!match) return null;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = { h: 3600, d: 86400, m: 2592000 };
  return val * (multipliers[unit] ?? 86400);
}

export async function generateJWT(project: Project, token: Token): Promise<string> {
  const { algorithm, secret, duration } = project;
  const payload = { ...token.payload };

  const builder = new SignJWT(payload).setProtectedHeader({ alg: algorithm, typ: 'JWT' }).setIssuedAt();

  const exp = parseDuration(duration);
  if (exp !== null) {
    builder.setExpirationTime(Math.floor(Date.now() / 1000) + exp);
  }

  if (isHmacAlgorithm(algorithm)) {
    const key = new TextEncoder().encode(typeof secret === 'string' ? secret : '');
    return builder.sign(key);
  } else {
    const pem = typeof secret === 'object' ? secret.privateKey : secret;
    const key = await importPKCS8(pem, algorithm);
    return builder.sign(key);
  }
}
