/**
 * Standalone Authentication Stub
 *
 * This is a simplified auth integration for running outside of CREAO.ai platform.
 * It provides mock authentication for local development with full compatibility.
 */

interface AuthState {
  token: string | null;
  status: 'authenticated' | 'unauthenticated' | 'invalid_token' | 'loading';
  parentOrigin: string | null;
}

class AuthIntegration {
  private state: AuthState = {
    token: import.meta.env.VITE_DEV_AUTH_TOKEN || 'local-dev-token',
    status: 'authenticated',
    parentOrigin: null,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    // Configure Cognito from environment variables if available
    if (typeof window !== 'undefined') {
      const cognitoUserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
      const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
      
      if (cognitoUserPoolId && cognitoClientId && cognitoDomain) {
        (window as any).__SELFAPP_COGNITO__ = {
          userPoolId: cognitoUserPoolId,
          cognitoClientId: cognitoClientId,
          cognitoDomain: cognitoDomain,
          redirectUri: window.location.origin + '/',
        };
        console.log('Cognito configured from environment variables');
      }
    }

    // In standalone mode, immediately mark as authenticated
    // Prefer a token persisted to localStorage (local dev DB surrogate) when available
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem('SELFAPP_AUTH_TOKEN');
        if (stored) {
          this.state.token = stored;
          this.state.status = 'authenticated';
        } else {
          this.state.token =
            import.meta.env.VITE_DEV_AUTH_TOKEN || 'local-dev-token';
        }
      }
    } catch (e) {
      // localStorage might not be available in some environments
      this.state.token =
        import.meta.env.VITE_DEV_AUTH_TOKEN || 'local-dev-token';
    }

    console.log('Running in standalone mode - auth bypassed');
    console.log(
      'Using dev token:',
      this.state.token === 'local-dev-token'
        ? 'default'
        : 'from environment or localStorage'
    );
  }

  private async initialize(): Promise<void> {
    // No-op for standalone mode
    return Promise.resolve();
  }

  public async waitForInitialization(): Promise<void> {
    return Promise.resolve();
  }

  public getAuthToken(): string | null {
    return this.state.token;
  }

  public getAuthStatus(): AuthState['status'] {
    return this.state.status;
  }

  public getAuthState(): AuthState {
    return { ...this.state };
  }

  public addAuthListener(callback: (state: AuthState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getAuthState());

    return () => {
      this.listeners.delete(callback);
    };
  }

  // Additional helper methods for compatibility
  public isAuthenticatedSync(): boolean {
    return this.state.status === 'authenticated';
  }

  public hasInvalidToken(): boolean {
    return this.state.status === 'invalid_token';
  }

  public hasNoToken(): boolean {
    return this.state.token === null;
  }

  public isLoading(): boolean {
    return this.state.status === 'loading';
  }

  public clearAuth(): void {
    this.state = {
      token: null,
      status: 'unauthenticated',
      parentOrigin: null,
    };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('SELFAPP_AUTH_TOKEN');
      }
    } catch (e) {
      // ignore
    }
    this.notifyListeners();
  }

  /**
   * Persist an auth token (async-friendly API). Uses localStorage as a simple local DB.
   */
  public async setAuthTokenAsync(token: string | null): Promise<void> {
    this.state.token = token;
    this.state.status = token ? 'authenticated' : 'unauthenticated';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (token) {
          window.localStorage.setItem('SELFAPP_AUTH_TOKEN', token);
        } else {
          window.localStorage.removeItem('SELFAPP_AUTH_TOKEN');
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    this.notifyListeners();
  }

  public createAuthenticatedFetch(): typeof fetch {
    const token = this.getAuthToken();
    return (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return fetch(input, { ...init, headers });
    };
  }

  private notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach((listener) => listener(state));
  }
}

// Create singleton instance
const authIntegration = new AuthIntegration();

/**
 * Initialize auth integration (no-op in standalone mode)
 */
export function initializeAuthIntegration(): Promise<void> {
  return authIntegration.waitForInitialization();
}

/**
 * Get the current authentication token
 */
export function getAuthToken(): string | null {
  return authIntegration.getAuthToken();
}

/**
 * Get the current authentication status
 */
export function getAuthStatus(): AuthState['status'] {
  return authIntegration.getAuthStatus();
}

/**
 * Get the full authentication state
 */
export function getAuthState(): AuthState {
  return authIntegration.getAuthState();
}

/**
 * Subscribe to authentication state changes
 */
export function addAuthListener(
  callback: (state: AuthState) => void
): () => void {
  return authIntegration.addAuthListener(callback);
}

// Alias for compatibility
export const addAuthStateListener = addAuthListener;

/**
 * Check if authenticated synchronously
 */
export function isAuthenticatedSync(): boolean {
  return authIntegration.isAuthenticatedSync();
}

/**
 * Check if token is invalid
 */
export function hasInvalidToken(): boolean {
  return authIntegration.hasInvalidToken();
}

/**
 * Check if no token is present
 */
export function hasNoToken(): boolean {
  return authIntegration.hasNoToken();
}

/**
 * Check if auth is loading
 */
export function isLoading(): boolean {
  return authIntegration.isLoading();
}

/**
 * Clear authentication
 */
export function clearAuth(): void {
  authIntegration.clearAuth();
}

/**
 * Create an authenticated fetch function
 */
export function createAuthenticatedFetch(): typeof fetch {
  return authIntegration.createAuthenticatedFetch();
}

/**
 * Cognito integration helpers
 * - configureCognito({ domain, clientId, redirectUri }) to enable hosted UI flows
 * - loginWithCognito() redirects to the hosted UI
 * - handleCognitoCallback() parses tokens from URL (if present) and persists them
 */
export function configureCognito(config: {
  domain?: string;
  clientId?: string;
  redirectUri?: string;
}) {
  try {
    (window as any).__SELFAPP_COGNITO__ = {
      ...(window as any).__SELFAPP_COGNITO__,
      ...config,
    };
  } catch (e) {
    // ignore
  }
}

export function isCognitoConfigured(): boolean {
  try {
    const c = (window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG;
    return Boolean(
      c &&
        (c.domain ||
          c.cognitoDomain ||
          c.cognito_domain ||
          c.cognitoClientId ||
          c.cognito_client_id ||
          c.cognitoClientId)
    );
  } catch (e) {
    return false;
  }
}

export function buildCognitoAuthorizeUrl(opts?: {
  scope?: string;
  responseType?: string;
}) {
  const cfg =
    (window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
  const clientId = cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;
  const domain = cfg.cognitoDomain || cfg.cognito_domain || cfg.domain;
  const redirectUri =
    cfg.redirectUri ||
    cfg.redirect_uri ||
    window.location.origin + window.location.pathname;
  if (!domain || !clientId) return null;
  const scope = opts?.scope || 'openid profile email';
  const responseType = opts?.responseType || 'token'; // implicit flow
  const state = Math.random().toString(36).slice(2);
  const url = new URL(`https://${domain}/login`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', responseType);
  url.searchParams.set('scope', scope);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return url.toString();
}

export function loginWithCognito() {
  const url = buildCognitoAuthorizeUrl();
  if (url) {
    window.location.href = url;
  } else {
    throw new Error('Cognito not configured (missing domain/clientId)');
  }
}

function parseHashTokens(hash: string) {
  // hash like #id_token=...&access_token=...&expires_in=3600
  const q = new URLSearchParams(hash.replace(/^#/, ''));
  const id_token = q.get('id_token');
  const access_token = q.get('access_token');
  const expires_in = q.get('expires_in');
  return { id_token, access_token, expires_in };
}

export function handleCognitoCallback(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') return resolve(false);
      const hash = window.location.hash || window.location.search;
      if (!hash) return resolve(false);
      const tokens = parseHashTokens(hash);
      if (tokens.id_token || tokens.access_token) {
        // prefer id_token
        const token = tokens.id_token || tokens.access_token;
        authIntegration.setAuthTokenAsync(token as string).then(() => {
          // remove hash from URL to clean up
          try {
            history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          } catch (e) {}
          resolve(true);
        });
        return;
      }
    } catch (e) {
      // ignore
    }
    resolve(false);
  });
}

/**
 * Async getter for token (keeps previous API)
 */
export async function getAuthTokenAsync(): Promise<string | null> {
  return Promise.resolve(authIntegration.getAuthToken());
}

/**
 * Async setter for token (keeps previous API)
 */
export async function setAuthTokenAsync(token: string | null): Promise<void> {
  return authIntegration.setAuthTokenAsync(token);
}
/**
 * Async-friendly getter for token (compat with callers expecting async API).
 */
// NOTE: getAuthTokenAsync/setAuthTokenAsync are exported above; no duplicate definitions.

// Export default for convenience
export default authIntegration;
