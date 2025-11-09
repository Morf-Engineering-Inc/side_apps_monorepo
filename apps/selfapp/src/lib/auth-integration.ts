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
	refreshToken?: string | null;
}

// PKCE Helper Functions
async function generateCodeVerifier(): Promise<string> {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return base64UrlEncode(array);
}

function base64UrlEncode(buffer: Uint8Array): string {
	let binary = "";
	for (let i = 0; i < buffer.length; i++) {
		binary += String.fromCharCode(buffer[i]);
	}
	const base64 = btoa(binary);
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
		refreshToken: null,
	};

	private listeners: Set<(state: AuthState) => void> = new Set();
	private refreshPromise: Promise<string | null> | null = null;

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
				const storedRefresh = window.localStorage.getItem(
					"SELFAPP_REFRESH_TOKEN",
				);
				if (stored) {
					this.state.token = stored;
					this.state.refreshToken = storedRefresh;
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
			refreshToken: null,
		};
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				window.localStorage.removeItem("SELFAPP_AUTH_TOKEN");
				window.localStorage.removeItem("SELFAPP_REFRESH_TOKEN");
			}
		} catch (e) {
			// ignore
		}
		this.notifyListeners();
	}

	/**
	 * Refresh access token using refresh token
	 */
	public async refreshAccessToken(): Promise<string | null> {
		// If already refreshing, return the existing promise
		if (this.refreshPromise) {
			return this.refreshPromise;
		}

		// Create refresh promise
		this.refreshPromise = (async () => {
			try {
				const refreshToken = this.state.refreshToken;
				if (!refreshToken) {
					console.error("No refresh token available");
					this.clearAuth();
					return null;
				}

				const cfg =
					(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
				const userPoolId =
					cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
				const clientId =
					cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

				if (!userPoolId || !clientId) {
					console.error("Cognito not configured for token refresh");
					return null;
				}

				// Extract region from user pool ID
				const parts = userPoolId.split("_");
				if (parts.length !== 2) {
					console.error("Invalid user pool ID format:", userPoolId);
					return null;
				}
				const region = parts[0];

				const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

				const requestBody = {
					AuthFlow: "REFRESH_TOKEN_AUTH",
					ClientId: clientId,
					AuthParameters: {
						REFRESH_TOKEN: refreshToken,
					},
				};

				console.log("Refreshing access token...");

				const response = await fetch(endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/x-amz-json-1.1",
						"X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
					},
					body: JSON.stringify(requestBody),
				});

				if (!response.ok) {
					const errorText = await response.text();
					console.error("Token refresh failed:", response.status, errorText);
					this.clearAuth();
					return null;
				}

				const result = await response.json();
				console.log("Successfully refreshed access token");

				if (result.AuthenticationResult) {
					const newToken = result.AuthenticationResult.IdToken;
					await this.setAuthTokenAsync(newToken);
					return newToken;
				}

				return null;
			} catch (error) {
				console.error("Error refreshing token:", error);
				this.clearAuth();
				return null;
			} finally {
				this.refreshPromise = null;
			}
		})();

		return this.refreshPromise;
	}

	/**
	 * Get auth token, refreshing if necessary
	 */
	public async getAuthTokenWithRefresh(): Promise<string | null> {
		const token = this.getAuthToken();
		if (!token) {
			return null;
		}

		// Check if token is expired or about to expire (within 5 minutes)
		// by trying to decode it
		try {
			const parts = token.split(".");
			if (parts.length === 3) {
				const payload = JSON.parse(atob(parts[1]));
				const exp = payload.exp;
				if (exp) {
					const now = Math.floor(Date.now() / 1000);
					const expiresIn = exp - now;
					// Refresh if token expires within 5 minutes
					if (expiresIn < 300) {
						console.log(
							"Token expiring soon, refreshing...",
							`expires in ${expiresIn}s`,
						);
						return await this.refreshAccessToken();
					}
				}
			}
		} catch (e) {
			// If we can't decode the token, just return it as-is
			console.log("Could not decode token, using as-is");
		}

		return token;
	}

	/**
	 * Persist an auth token (async-friendly API). Uses localStorage as a simple local DB.
	 */
	public async setAuthTokenAsync(
		token: string | null,
		refreshToken?: string | null,
	): Promise<void> {
		this.state.token = token;
		if (refreshToken !== undefined) {
			this.state.refreshToken = refreshToken;
		}
		this.state.status = token ? "authenticated" : "unauthenticated";
		try {
			if (typeof window !== "undefined" && window.localStorage) {
				if (token) {
					window.localStorage.setItem("SELFAPP_AUTH_TOKEN", token);
				} else {
					window.localStorage.removeItem("SELFAPP_AUTH_TOKEN");
				}
				if (refreshToken !== undefined) {
					if (refreshToken) {
						window.localStorage.setItem("SELFAPP_REFRESH_TOKEN", refreshToken);
					} else {
						window.localStorage.removeItem("SELFAPP_REFRESH_TOKEN");
					}
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
 * Authenticate with Cognito using username and password (no hosted UI)
 * Uses Amazon Cognito Identity SDK for JavaScript
 */
async function authenticateWithPassword(
	username: string,
	password: string,
): Promise<{
	idToken?: string;
	accessToken?: string;
	refreshToken?: string;
	error?: string;
} | null> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured for password authentication");
			return { error: "Authentication service not configured" };
		}

		// Validate and extract region from user pool ID (format: us-east-1_xxxxxxxxx)
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return { error: "Authentication service configuration error" };
		}
		const region = parts[0];

		// Region is extracted from AWS-provided user pool ID, no additional validation needed

		// Use Cognito's InitiateAuth API with USER_PASSWORD_AUTH flow
		// Note: This requires the Cognito User Pool Client to have USER_PASSWORD_AUTH
		// enabled in explicit_auth_flows (configured in Terraform)
		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			AuthFlow: "USER_PASSWORD_AUTH",
			ClientId: clientId,
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
		};

		console.log("Authenticating with Cognito using username/password...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error(
					"Password authentication failed:",
					response.status,
					errorText,
				);

				// Parse Cognito error response
				let errorMessage = "Invalid email or password";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (
						errorCode === "UserNotFoundException" ||
						errorCode === "NotAuthorizedException"
					) {
						errorMessage = "Invalid email or password";
					} else if (errorCode === "UserNotConfirmedException") {
						errorMessage = "Please verify your email before signing in";
					} else if (errorCode === "TooManyRequestsException") {
						errorMessage = "Too many attempts. Please try again later";
					} else if (errorCode === "PasswordResetRequiredException") {
						errorMessage = "Password reset required";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { error: errorMessage };
			}

			const result = await response.json();
			console.log("Successfully authenticated with password");

			if (result.AuthenticationResult) {
				return {
					idToken: result.AuthenticationResult.IdToken,
					accessToken: result.AuthenticationResult.AccessToken,
					refreshToken: result.AuthenticationResult.RefreshToken,
				};
			}

			// Handle challenge (e.g., NEW_PASSWORD_REQUIRED)
			if (result.ChallengeName) {
				console.error(
					"Authentication challenge required:",
					result.ChallengeName,
				);
				return { error: "Additional authentication steps required" };
			}

			return { error: "Authentication failed" };
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Authentication request timed out");
				return { error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error authenticating with password:", error);
		return { error: "An unexpected error occurred. Please try again" };
	}
}

/**
 * Sign up a new user with Cognito using username and password
 */
async function signUpWithPassword(
	email: string,
	password: string,
	name: string,
): Promise<{
	success: boolean;
	error?: string;
	needsVerification?: boolean;
	username?: string;
}> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured for signup");
			return { success: false, error: "Authentication service not configured" };
		}

		// Validate and extract region from user pool ID
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return {
				success: false,
				error: "Authentication service configuration error",
			};
		}
		const region = parts[0];

		// Region is extracted from AWS-provided user pool ID, no additional validation needed
		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			ClientId: clientId,
			Username: email, // Using email as username (requires Cognito User Pool configured with username_attributes = ["email"] in Terraform)
			Password: password,
			UserAttributes: [
				{
					Name: "email",
					Value: email,
				},
				{
					Name: "name",
					Value: name,
				},
			],
		};

		console.log("Signing up new user with Cognito...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Signup failed:", response.status, errorText);

				// Parse Cognito error response
				let errorMessage = "Signup failed. Please try again";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (errorCode === "UsernameExistsException") {
						errorMessage = "An account with this email already exists";
					} else if (errorCode === "InvalidPasswordException") {
						errorMessage =
							"Password does not meet requirements. Please ensure it has sufficient complexity";
					} else if (errorCode === "InvalidParameterException") {
						errorMessage = "Invalid email or password format";
					} else if (errorCode === "TooManyRequestsException") {
						errorMessage = "Too many attempts. Please try again later";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { success: false, error: errorMessage };
			}

			const result = await response.json();
			console.log("Signup successful, confirmation may be required");

			// Check if user needs to confirm their email
			const needsVerification = !result.UserConfirmed;

			// Note: User may need to confirm their email before they can sign in
			return {
				success: true,
				needsVerification,
				username: email,
			};
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Signup request timed out");
				return { success: false, error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error signing up:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again",
		};
	}
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
): Promise<{
	id_token?: string;
	access_token?: string;
	refresh_token?: string;
} | null> {
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
					codeVerifier = window.sessionStorage?.getItem(
						"cognito_code_verifier",
					);

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
							throw new Error("Token exchange failed");
						}

						// Use id_token (contains user info) or access_token as fallback
						const token = tokens.id_token || tokens.access_token;
						return authIntegration.setAuthTokenAsync(
							token as string,
							tokens.refresh_token,
						);
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
 * Get auth token with automatic refresh if needed
 */
export async function getAuthTokenWithRefresh(): Promise<string | null> {
	return authIntegration.getAuthTokenWithRefresh();
}

/**
 * Async setter for token (keeps previous API)
 */
export async function setAuthTokenAsync(
	token: string | null,
	refreshToken?: string | null,
): Promise<void> {
	return authIntegration.setAuthTokenAsync(token, refreshToken);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string | null> {
	return authIntegration.refreshAccessToken();
}

/**
 * Async-friendly getter for token (compat with callers expecting async API).
 */
// NOTE: getAuthTokenAsync/setAuthTokenAsync are exported above; no duplicate definitions.

/**
 * Confirm user signup with verification code
 */
async function confirmSignUp(
	username: string,
	code: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured");
			return { success: false, error: "Authentication service not configured" };
		}

		// Validate and extract region from user pool ID
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return {
				success: false,
				error: "Authentication service configuration error",
			};
		}
		const region = parts[0];

		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			ClientId: clientId,
			Username: username,
			ConfirmationCode: code,
		};

		console.log("Confirming signup with verification code...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Confirmation failed:", response.status, errorText);

				let errorMessage = "Verification failed. Please try again";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (errorCode === "CodeMismatchException") {
						errorMessage =
							"Invalid verification code. Please check and try again";
					} else if (errorCode === "ExpiredCodeException") {
						errorMessage =
							"Verification code has expired. Please request a new one";
					} else if (errorCode === "NotAuthorizedException") {
						errorMessage = "User is already confirmed";
					} else if (errorCode === "TooManyRequestsException") {
						errorMessage = "Too many attempts. Please try again later";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { success: false, error: errorMessage };
			}

			console.log("Signup confirmed successfully");
			return { success: true };
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Confirmation request timed out");
				return { success: false, error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error confirming signup:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again",
		};
	}
}

/**
 * Resend verification code
 */
async function resendConfirmationCode(
	username: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured");
			return { success: false, error: "Authentication service not configured" };
		}

		// Validate and extract region from user pool ID
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return {
				success: false,
				error: "Authentication service configuration error",
			};
		}
		const region = parts[0];

		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			ClientId: clientId,
			Username: username,
		};

		console.log("Resending confirmation code...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target":
						"AWSCognitoIdentityProviderService.ResendConfirmationCode",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Resend failed:", response.status, errorText);

				let errorMessage = "Failed to resend code. Please try again";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (
						errorCode === "LimitExceededException" ||
						errorCode === "TooManyRequestsException"
					) {
						errorMessage =
							"Too many attempts. Please wait a few minutes before trying again";
					} else if (errorCode === "InvalidParameterException") {
						errorMessage = "User is already confirmed";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { success: false, error: errorMessage };
			}

			console.log("Confirmation code resent successfully");
			return { success: true };
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Resend request timed out");
				return { success: false, error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error resending confirmation code:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again",
		};
	}
}

/**
 * Initiate forgot password flow - sends reset code to user's email
 */
async function forgotPassword(
	username: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured");
			return { success: false, error: "Authentication service not configured" };
		}

		// Validate and extract region from user pool ID
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return {
				success: false,
				error: "Authentication service configuration error",
			};
		}
		const region = parts[0];

		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			ClientId: clientId,
			Username: username,
		};

		console.log("Initiating forgot password flow...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target": "AWSCognitoIdentityProviderService.ForgotPassword",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Forgot password failed:", response.status, errorText);

				let errorMessage = "Failed to send reset code. Please try again";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (errorCode === "UserNotFoundException") {
						// For security, don't reveal if user exists
						errorMessage =
							"If an account exists, a reset code has been sent to your email";
					} else if (errorCode === "InvalidParameterException") {
						errorMessage = "Invalid email address";
					} else if (
						errorCode === "LimitExceededException" ||
						errorCode === "TooManyRequestsException"
					) {
						errorMessage =
							"Too many attempts. Please wait a few minutes before trying again";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { success: false, error: errorMessage };
			}

			console.log("Password reset code sent successfully");
			return { success: true };
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Forgot password request timed out");
				return { success: false, error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error initiating forgot password:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again",
		};
	}
}

/**
 * Confirm forgot password with verification code and new password
 */
async function confirmForgotPassword(
	username: string,
	code: string,
	newPassword: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured");
			return { success: false, error: "Authentication service not configured" };
		}

		// Validate and extract region from user pool ID
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return {
				success: false,
				error: "Authentication service configuration error",
			};
		}
		const region = parts[0];

		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			ClientId: clientId,
			Username: username,
			ConfirmationCode: code,
			Password: newPassword,
		};

		console.log("Confirming password reset...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target":
						"AWSCognitoIdentityProviderService.ConfirmForgotPassword",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Password reset failed:", response.status, errorText);

				let errorMessage = "Failed to reset password. Please try again";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (errorCode === "CodeMismatchException") {
						errorMessage =
							"Invalid verification code. Please check and try again";
					} else if (errorCode === "ExpiredCodeException") {
						errorMessage =
							"Verification code has expired. Please request a new one";
					} else if (errorCode === "InvalidPasswordException") {
						errorMessage =
							"Password does not meet requirements. Please ensure it has sufficient complexity";
					} else if (errorCode === "TooManyRequestsException") {
						errorMessage = "Too many attempts. Please try again later";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { success: false, error: errorMessage };
			}

			console.log("Password reset successfully");
			return { success: true };
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Password reset request timed out");
				return { success: false, error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error confirming password reset:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again",
		};
	}
}

/**
 * Change password for authenticated user
 */
async function changePassword(
	oldPassword: string,
	newPassword: string,
): Promise<{ success: boolean; error?: string }> {
	try {
		const cfg =
			(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
		const userPoolId =
			cfg.userPoolId || cfg.cognitoUserPoolId || cfg.cognito_user_pool_id;
		const clientId =
			cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;

		if (!userPoolId || !clientId) {
			console.error("Cognito not configured");
			return { success: false, error: "Authentication service not configured" };
		}

		// Get the current access token
		const token = authIntegration.getAuthToken();
		if (!token) {
			return { success: false, error: "Not authenticated" };
		}

		// Validate and extract region from user pool ID
		const parts = userPoolId.split("_");
		if (parts.length !== 2) {
			console.error("Invalid user pool ID format:", userPoolId);
			return {
				success: false,
				error: "Authentication service configuration error",
			};
		}
		const region = parts[0];

		const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;

		const requestBody = {
			PreviousPassword: oldPassword,
			ProposedPassword: newPassword,
			AccessToken: token,
		};

		console.log("Changing password...");

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-amz-json-1.1",
					"X-Amz-Target": "AWSCognitoIdentityProviderService.ChangePassword",
				},
				body: JSON.stringify(requestBody),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Change password failed:", response.status, errorText);

				let errorMessage = "Failed to change password. Please try again";
				try {
					const errorData = JSON.parse(errorText);
					const errorCode = errorData.__type || errorData.code;

					if (errorCode === "NotAuthorizedException") {
						errorMessage = "Current password is incorrect";
					} else if (errorCode === "InvalidPasswordException") {
						errorMessage =
							"New password must be at least 8 characters with uppercase, lowercase, numbers, and symbols";
					} else if (errorCode === "LimitExceededException") {
						errorMessage = "Too many attempts. Please try again later";
					} else if (errorData.message) {
						errorMessage = errorData.message;
					}
				} catch (e) {
					// Use default error message
				}

				return { success: false, error: errorMessage };
			}

			console.log("Password changed successfully");
			return { success: true };
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				console.error("Change password request timed out");
				return { success: false, error: "Request timed out. Please try again" };
			}
			throw error;
		}
	} catch (error) {
		console.error("Error changing password:", error);
		return {
			success: false,
			error: "An unexpected error occurred. Please try again",
		};
	}
}

/**
 * Authenticate with Cognito using username and password (for custom login form)
 */
export {
	authenticateWithPassword,
	signUpWithPassword,
	confirmSignUp,
	resendConfirmationCode,
	forgotPassword,
	confirmForgotPassword,
	changePassword,
};

// Export default for convenience
export default authIntegration;
