/**
 * Standalone Authentication Stub
 *
 * This is a simplified auth integration for running outside of CREAO.ai platform.
 * It provides mock authentication for local development.
 */

interface AuthState {
	token: string | null;
	status: "authenticated" | "unauthenticated";
	parentOrigin: string | null;
}

class AuthIntegration {
	private state: AuthState = {
		token: "local-dev-token",
		status: "authenticated",
		parentOrigin: null,
	};

	private listeners: Set<(state: AuthState) => void> = new Set();

	constructor() {
		// In standalone mode, immediately mark as authenticated
		console.log("Running in standalone mode - auth bypassed");
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

// Export default for convenience
export default authIntegration;
