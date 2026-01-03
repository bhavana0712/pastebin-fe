export interface Paste {
  id: string;
  content: string;
  createdAt: string;
  ttlSeconds?: number;
  maxViews?: number;
  viewCount: number;
  expireAt?: string | null;
  title?: string;
  language?: string;
  password?: string;
}

export interface CreatePasteRequest {
  content: string;
  ttlSeconds?: number;
  maxViews?: number;
  title?: string;
  language?: string;
  password?: string;
}

export interface PasteResponse {
  id: string;
  url: string;
  expireAt: string | null;
}

export interface ViewPasteResponse {
  content: string;
  remainingViews: number | null;
  expiresAt: string | null;
  createdAt: string;
  title?: string;
  language?: string;
  isPasswordProtected: boolean;
}

export interface ApiError {
  error: string;
  requiresPassword?: boolean;
}
