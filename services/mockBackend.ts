/// <reference types="vite/client" />
import { CreatePasteRequest, PasteResponse, ViewPasteResponse } from '../types';

const normalizeBase = (b: string) => {
  if (!b) return '';
  return b.endsWith('/') ? b.slice(0, -1) : b;
};
const API_BASE = normalizeBase(import.meta.env.VITE_API_BASE_URL ?? '');
const IS_PROD = import.meta.env.PROD;
const HOST = typeof window !== 'undefined' ? window.location.hostname : '';

const getTestHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const testTime = localStorage.getItem('x-test-now-ms');
  if (testTime) headers['x-test-now-ms'] = testTime;
  return headers;
};

const toApiUrl = (path: string) => `${API_BASE}${path}`;

const missingBaseHint = () => {
  const hostedOnVercel = HOST.endsWith('vercel.app');
  const hostedOnNetlify = HOST.endsWith('netlify.app');
  const hostedOnGithubPages = HOST.endsWith('github.io');
  const hostedOnRender = HOST.endsWith('onrender.com');
  if (!API_BASE && IS_PROD && (hostedOnVercel || hostedOnNetlify || hostedOnGithubPages)) {
    return 'Set VITE_API_BASE_URL to your API host (e.g., https://<service>.onrender.com).';
  }
  if (!API_BASE && IS_PROD && hostedOnRender) {
    return '';
  }
  return API_BASE ? '' : 'If running UI separate from API, set VITE_API_BASE_URL.';
};

export const createPaste = async (data: CreatePasteRequest): Promise<PasteResponse> => {
  const payload = {
    content: data.content,
    ttl_seconds: data.ttlSeconds,
    max_views: data.maxViews,
    title: data.title,
    language: data.language,
    password: data.password,
  };

  let res: Response;
  try {
    res = await fetch(toApiUrl('/api/pastes'), {
      method: 'POST',
      headers: { ...getTestHeaders(), Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e: any) {
    const hint = missingBaseHint();
    throw new Error(`Unable to reach API. Ensure the backend is running${API_BASE ? ` at ${API_BASE}` : ''}.${hint ? ' ' + hint : ''}`);
  }

  if (!res.ok) {
    let message = 'Failed to create paste';
    try {
      const json = await res.json();
      if (json?.error) message = json.error;
    } catch {}
    const hint = missingBaseHint();
    throw new Error(hint ? `${message}. ${hint}` : message);
  }

  const json = await res.json();
  // Always construct link using the frontend origin to avoid
  // opening the backend host when UI and API are separated.
  const frontendUrl = `${window.location.origin}/p/${json.id}`;
  return {
    id: json.id,
    url: frontendUrl,
    expireAt: json.expireAt ?? json.expire_at ?? null,
  };
};

export const getPaste = async (id: string, password?: string): Promise<ViewPasteResponse> => {
  const params = password ? `?password=${encodeURIComponent(password)}` : '';
  let res: Response;
  try {
    res = await fetch(toApiUrl(`/api/pastes/${id}${params}`), {
      method: 'GET',
      headers: { ...getTestHeaders(), Accept: 'application/json' },
    });
  } catch (e: any) {
    const hint = missingBaseHint();
    throw new Error(`Unable to reach API. Ensure the backend is running${API_BASE ? ` at ${API_BASE}` : ''}.${hint ? ' ' + hint : ''}`);
  }

  if (res.status === 403) {
    const json = await res.json();
    if (json?.requires_password) {
      const err: any = new Error('Password required');
      err.requiresPassword = true;
      throw err;
    }
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Paste not found or expired');
    }
    let message = 'Failed to fetch paste';
    try {
      const j = await res.json();
      if (j?.error) message = j.error;
    } catch {}
    const hint = missingBaseHint();
    throw new Error(hint ? `${message}. ${hint}` : message);
  }

  const json = await res.json();
  return {
    content: json.content,
    remainingViews: json.remaining_views,
    expiresAt: json.expires_at,
    createdAt: json.created_at,
    title: json.title,
    language: json.language,
    isPasswordProtected: json.is_password_protected,
  };
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(toApiUrl('/api/healthz'), { headers: { Accept: 'application/json' } });
    return res.ok;
  } catch {
    return false;
  }
};
