/**
 * Custom error classes for authentication-related errors
 */

export class AuthenticationError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
	) {
		super(message);
		this.name = "AuthenticationError";
	}
}

export class TokenExpiredError extends AuthenticationError {
	constructor() {
		super(
			"⚠ Session expired. Please refresh the page and log in again.",
			"TOKEN_EXPIRED",
		);
		this.name = "TokenExpiredError";
	}
}

export class NoTokenError extends AuthenticationError {
	constructor() {
		super("⚠ Authentication required. Please log in.", "NO_TOKEN");
		this.name = "NoTokenError";
	}
}

/**
 * Check if an error is an authentication error and return appropriate user-facing message
 */
export function getAuthErrorMessage(error: unknown): string | null {
	if (error instanceof TokenExpiredError || error instanceof NoTokenError) {
		return error.message;
	}

	if (error instanceof Error) {
		const message = error.message;
		if (message.includes("Invalid or expired token")) {
			return "⚠ Session expired. Please refresh the page and log in again.";
		}
		if (message.includes("authentication token")) {
			return "⚠ Authentication required. Please log in.";
		}
	}

	return null;
}

/**
 * Check if an error is related to authentication
 */
export function isAuthError(error: unknown): boolean {
	return getAuthErrorMessage(error) !== null;
}
