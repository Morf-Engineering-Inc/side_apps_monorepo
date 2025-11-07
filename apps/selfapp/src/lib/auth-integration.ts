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

// PKCE Helper Functions
async function generateCodeVerifier(): Promise<string> {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return base64UrlEncode(array);
}

function base64UrlEncode(buffer: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...buffer));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return base64UrlEncode(new Uint8Array(hash));
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

export async function buildCognitoAuthorizeUrl(opts?: {
	scope?: string;
	responseType?: string;
}): Promise<string | null> {
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

	// Generate PKCE parameters
	const codeVerifier = await generateCodeVerifier();
	const codeChallenge = await generateCodeChallenge(codeVerifier);

	// Store state and code verifier for validation on callback
	try {
		if (typeof window !== "undefined" && window.sessionStorage) {
			window.sessionStorage.setItem("cognito_auth_state", state);
			window.sessionStorage.setItem("cognito_code_verifier", codeVerifier);
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
	// Add PKCE parameters
	url.searchParams.set("code_challenge", codeChallenge);
	url.searchParams.set("code_challenge_method", "S256");
	console.log("Cognito authorize URL:", url.toString());
	return url.toString();
}

export async function loginWithCognito() {
	const url = await buildCognitoAuthorizeUrl();
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

/**
 * Exchange authorization code for tokens using PKCE
 */
async function exchangeCodeForTokens(
	code: string,
	codeVerifier: string,
): Promise<{ id_token?: string; access_token?: string } | null> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;
		const domain = cfg.cognitoDomain || cfg.cognito_domain || cfg.domain;
		const envRedirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
		const redirectUri =
			envRedirectUri ||
			cfg.redirectSignIn ||
			cfg.redirectUri ||
			cfg.redirect_uri ||
			`${window.location.origin}/callback`;

		if (!domain || !clientId) {
			console.error("Cognito not configured for token exchange");
			return null;
		}

		const tokenEndpoint = `https://${domain}/oauth2/token`;

		const body = new URLSearchParams({
			grant_type: "authorization_code",
			client_id: clientId,
			code: code,
			redirect_uri: redirectUri,
			code_verifier: codeVerifier,
		});

		console.log("Exchanging authorization code for tokens...");
		const response = await fetch(tokenEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body.toString(),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Token exchange failed:", response.status, errorText);
			return null;
		}

		const tokens = await response.json();
		console.log("Successfully exchanged code for tokens");
		return tokens;
	} catch (error) {
		console.error("Error exchanging code for tokens:", error);
		return null;
	}
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
				let codeVerifier: string | null = null;
				try {
					const savedState =
						window.sessionStorage?.getItem("cognito_auth_state");
					codeVerifier = window.sessionStorage?.getItem("cognito_code_verifier");

					if (savedState && savedState !== state) {
						console.error("State mismatch in OAuth callback");
						return resolve(false);
					}
					window.sessionStorage?.removeItem("cognito_auth_state");
					window.sessionStorage?.removeItem("cognito_code_verifier");
				} catch (e) {
					// ignore storage errors
				}

				if (!codeVerifier) {
					console.error("No code verifier found for PKCE exchange");
					return resolve(false);
				}

				// Exchange authorization code for tokens using PKCE
				console.log("Received authorization code from Cognito");
				exchangeCodeForTokens(code, codeVerifier)
					.then((tokens) => {
						if (!tokens || (!tokens.id_token && !tokens.access_token)) {
							console.error("Token exchange failed");
							return resolve(false);
						}

						// Use id_token (contains user info) or access_token as fallback
						const token = tokens.id_token || tokens.access_token;
						return authIntegration.setAuthTokenAsync(token as string);
					})
					.then(() => {
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
					})
					.catch((error) => {
						console.error("Error during token exchange:", error);
						resolve(false);
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
