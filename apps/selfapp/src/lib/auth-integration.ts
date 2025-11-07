/**
 * Standalone Authentication Stub
 *
 * This is a simplified auth integration for running outside of CREAO.ai platform.
 * It provides mock authentication for local development with full compatibility.
 */

interface AuthState {
	token: string | null;
	status: "authenticated" | "unauthenticated" | "invalid_token" | "loading";
	parentOrigin: string | null;
}

class AuthIntegration {
	private state: AuthState = {
		token: null,
		status: "unauthenticated",
		parentOrigin: null,
	};

	private listeners: Set<(state: AuthState) => void> = new Set();

	constructor() {
		// Configure Cognito from environment variables if available
		if (typeof window !== "undefined") {
			const cognitoUserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
			const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
			const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

			if (cognitoUserPoolId && cognitoClientId && cognitoDomain) {
				// Extract domain from URL if it's a full URL
				let domain = cognitoDomain;
				if (domain.startsWith("http")) {
					try {
						domain = new URL(domain).hostname;
					} catch (e) {
						// If URL parsing fails, use as-is
					}
				}

				(window as any).__SELFAPP_COGNITO__ = {
					userPoolId: cognitoUserPoolId,
					cognitoClientId: cognitoClientId,
					cognitoDomain: domain,
					redirectUri: `${window.location.origin}/`,
				};
				console.log("Cognito configured from environment variables");
			}
		}

		// In standalone mode, check for existing authentication
		// Prefer a token persisted to localStorage (local dev DB surrogate) when available
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				const stored = window.localStorage.getItem("SELFAPP_AUTH_TOKEN");
				if (stored) {
					this.state.token = stored;
					this.state.status = "authenticated";
				} else {
					// Check if there's a user in localStorage (from local auth)
					const user = window.localStorage.getItem("user");
					if (user) {
						this.state.token =
							import.meta.env.VITE_DEV_AUTH_TOKEN || "local-dev-token";
						this.state.status = "authenticated";
					}
				}
			}
		} catch (e) {
			// localStorage might not be available in some environments
		}

		console.log("Running in standalone mode - authentication required");
		console.log(
			"Auth status:",
			this.state.status === "authenticated"
				? "authenticated (existing session)"
				: "unauthenticated (login required)",
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

	public getAuthStatus(): AuthState["status"] {
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
		return this.state.status === "authenticated";
	}

	public hasInvalidToken(): boolean {
		return this.state.status === "invalid_token";
	}

	public hasNoToken(): boolean {
		return this.state.token === null;
	}

	public isLoading(): boolean {
		return this.state.status === "loading";
	}

	public clearAuth(): void {
		this.state = {
			token: null,
			status: "unauthenticated",
			parentOrigin: null,
		};
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				window.localStorage.removeItem("SELFAPP_AUTH_TOKEN");
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
		this.state.status = token ? "authenticated" : "unauthenticated";
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				if (token) {
					window.localStorage.setItem("SELFAPP_AUTH_TOKEN", token);
				} else {
					window.localStorage.removeItem("SELFAPP_AUTH_TOKEN");
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
				headers.set("Authorization", `Bearer ${token}`);
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
export function getAuthStatus(): AuthState["status"] {
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
	callback: (state: AuthState) => void,
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
					c.cognitoClientId),
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
	const responseType = opts?.responseType || cfg.responseType || "code"; // OAuth 2.0 Authorization Code flow (more secure than implicit flow)

	// Use environment variable for redirect URI if available, otherwise use config
	// This allows for easy local development configuration
	const envRedirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
	const redirectUri =
		envRedirectUri ||
		cfg.redirectSignIn ||
		cfg.redirectUri ||
		cfg.redirect_uri ||
		`${window.location.origin}/callback`;

	console.log("Building Cognito URL with:", {
		clientId,
		domain,
		redirectUri,
		responseType,
	});
	if (!domain || !clientId) return null;
	const scope = opts?.scope || cfg.scopes?.join(" ") || "openid profile email";
	const state = Math.random().toString(36).slice(2);

	// Store state for validation on callback
	try {
		if (typeof window !== "undefined" && window.sessionStorage) {
			window.sessionStorage.setItem("cognito_auth_state", state);
		}
	} catch (e) {
		// ignore
	}

	const url = new URL(`https://${domain}/login`);
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("response_type", responseType);
	url.searchParams.set("scope", scope);
	url.searchParams.set("redirect_uri", redirectUri);
	url.searchParams.set("state", state);
	console.log("Cognito authorize URL:", url.toString());
	return url.toString();
}

export function loginWithCognito() {
	const url = buildCognitoAuthorizeUrl();
	if (url) {
		window.location.href = url;
	} else {
		throw new Error("Cognito not configured (missing domain/clientId)");
	}
}

function parseHashTokens(hash: string) {
	// hash like #id_token=...&access_token=...&expires_in=3600
	const q = new URLSearchParams(hash.replace(/^#/, ""));
	const id_token = q.get("id_token");
	const access_token = q.get("access_token");
	const expires_in = q.get("expires_in");
	return { id_token, access_token, expires_in };
}

function parseCodeFromUrl() {
	// Parse authorization code from URL query params
	const params = new URLSearchParams(window.location.search);
	const code = params.get("code");
	const state = params.get("state");
	const error = params.get("error");
	return { code, state, error };
}

export function handleCognitoCallback(): Promise<boolean> {
	return new Promise((resolve) => {
		try {
			if (typeof window === "undefined") return resolve(false);

			// First, check for authorization code (code flow)
			const { code, state, error } = parseCodeFromUrl();

			if (error) {
				console.error("Cognito callback error:", error);
				return resolve(false);
			}

			if (code) {
				// Validate state if available
				try {
					const savedState =
						window.sessionStorage?.getItem("cognito_auth_state");
					if (savedState && savedState !== state) {
						console.error("State mismatch in OAuth callback");
						return resolve(false);
					}
					window.sessionStorage?.removeItem("cognito_auth_state");
				} catch (e) {
					// ignore storage errors
				}

				// SECURITY NOTE: In production, authorization codes should be exchanged for tokens
				// via a secure backend endpoint (not in the frontend). This requires:
				// 1. A backend API endpoint that receives the code
				// 2. The backend exchanges the code with Cognito token endpoint
				// 3. The backend validates and returns the JWT tokens
				//
				// For this standalone frontend app without a backend, we're treating the code
				// as a simple auth indicator. This is acceptable for development/testing but
				// should be replaced with proper token exchange in production.

				// TODO: Add environment check to ensure this only runs in development
				// if (process.env.NODE_ENV === 'production') {
				//   throw new Error('Direct code usage not allowed in production');
				// }

				console.log("Received authorization code from Cognito");
				authIntegration.setAuthTokenAsync(code as string).then(() => {
					// Clean up URL while preserving non-OAuth query parameters
					try {
						const url = new URL(window.location.href);
						// Remove OAuth-specific parameters
						url.searchParams.delete("code");
						url.searchParams.delete("state");
						url.searchParams.delete("error");
						url.searchParams.delete("error_description");

						// Reconstruct URL with remaining query params
						const newUrl = url.pathname + (url.search || "");
						history.replaceState(null, "", newUrl);
					} catch (e) {}
					resolve(true);
				});
				return;
			}

			// Fallback: check for implicit flow tokens in hash
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
							"",
							window.location.pathname + window.location.search,
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
