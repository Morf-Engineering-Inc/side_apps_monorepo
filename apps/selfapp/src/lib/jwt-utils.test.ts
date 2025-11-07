import { describe, expect, it } from "vitest";
import {
	decodeJWT,
	getUserEmailFromToken,
	getUserIdFromToken,
	getUserInfoFromToken,
	getUsernameFromToken,
	isTokenExpired,
} from "./jwt-utils";

describe("JWT Utils", () => {
	// Create a mock JWT token for testing
	// This uses standard base64 encoding (not base64url)
	const createMockToken = (payload: object): string => {
		const header = { alg: "HS256", typ: "JWT" };
		const encodedHeader = btoa(JSON.stringify(header));
		const encodedPayload = btoa(JSON.stringify(payload));
		const signature = "mock-signature";
		return `${encodedHeader}.${encodedPayload}.${signature}`;
	};

	// Create a mock JWT token with base64url encoding (URL-safe)
	// This simulates real JWT tokens from Cognito that use base64url
	const createBase64UrlToken = (payload: object): string => {
		const header = { alg: "HS256", typ: "JWT" };
		const headerStr = JSON.stringify(header);
		const payloadStr = JSON.stringify(payload);

		// Convert to base64url (URL-safe encoding used by JWT)
		const base64urlEncode = (str: string): string => {
			// First encode to standard base64
			const base64 = btoa(str);
			// Then convert to base64url by replacing characters and removing padding
			return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
		};

		const encodedHeader = base64urlEncode(headerStr);
		const encodedPayload = base64urlEncode(payloadStr);
		const signature = "mock-signature";
		return `${encodedHeader}.${encodedPayload}.${signature}`;
	};

	describe("decodeJWT", () => {
		it("should decode a valid JWT token", () => {
			const payload = {
				sub: "user123",
				email: "test@example.com",
				name: "Test User",
			};
			const token = createMockToken(payload);
			const decoded = decodeJWT(token);

			expect(decoded).toEqual(payload);
		});

		it("should decode a JWT token with base64url encoding (URL-safe)", () => {
			const payload = {
				sub: "user123",
				email: "test@example.com",
				name: "Test User",
			};
			const token = createBase64UrlToken(payload);
			const decoded = decodeJWT(token);

			expect(decoded).toEqual(payload);
		});

		it("should decode a JWT token with missing padding", () => {
			// Create a token where the payload has missing padding
			const payload = { sub: "123", email: "a@b.c" };
			const token = createBase64UrlToken(payload);
			const decoded = decodeJWT(token);

			expect(decoded).toEqual(payload);
		});

		it("should return null for invalid JWT format", () => {
			expect(decodeJWT("invalid-token")).toBeNull();
			expect(decodeJWT("only.two")).toBeNull();
			expect(decodeJWT("")).toBeNull();
		});

		it("should return null for token with invalid base64", () => {
			const invalidToken = "header.!!invalid-base64!!.signature";
			expect(decodeJWT(invalidToken)).toBeNull();
		});

		it("should handle tokens with special characters", () => {
			const payload = {
				sub: "user-id-123",
				email: "test+tag@example.com",
				name: "Test User & Co.",
			};
			const token = createBase64UrlToken(payload);
			const decoded = decodeJWT(token);

			expect(decoded).toEqual(payload);
		});
	});

	describe("getUserIdFromToken", () => {
		it("should extract user ID from sub field", () => {
			const token = createMockToken({ sub: "user123" });
			expect(getUserIdFromToken(token)).toBe("user123");
		});

		it("should fallback to user_id field", () => {
			const token = createMockToken({ user_id: "user456" });
			expect(getUserIdFromToken(token)).toBe("user456");
		});

		it("should fallback to userId field", () => {
			const token = createMockToken({ userId: "user789" });
			expect(getUserIdFromToken(token)).toBe("user789");
		});

		it("should fallback to id field", () => {
			const token = createMockToken({ id: "user000" });
			expect(getUserIdFromToken(token)).toBe("user000");
		});

		it("should return empty string for invalid token", () => {
			expect(getUserIdFromToken("invalid")).toBe("");
		});
	});

	describe("getUserEmailFromToken", () => {
		it("should extract email from token", () => {
			const token = createMockToken({ email: "test@example.com" });
			expect(getUserEmailFromToken(token)).toBe("test@example.com");
		});

		it("should return null if email not present", () => {
			const token = createMockToken({ sub: "user123" });
			expect(getUserEmailFromToken(token)).toBeNull();
		});

		it("should return null for invalid token", () => {
			expect(getUserEmailFromToken("invalid")).toBeNull();
		});
	});

	describe("getUsernameFromToken", () => {
		it("should extract username from token", () => {
			const token = createMockToken({ username: "testuser" });
			expect(getUsernameFromToken(token)).toBe("testuser");
		});

		it("should fallback to name field", () => {
			const token = createMockToken({ name: "Test User" });
			expect(getUsernameFromToken(token)).toBe("Test User");
		});

		it("should return null if neither field present", () => {
			const token = createMockToken({ sub: "user123" });
			expect(getUsernameFromToken(token)).toBeNull();
		});
	});

	describe("isTokenExpired", () => {
		it("should return false for non-expired token", () => {
			const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
			const token = createMockToken({ exp: futureTime });
			expect(isTokenExpired(token)).toBe(false);
		});

		it("should return true for expired token", () => {
			const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
			const token = createMockToken({ exp: pastTime });
			expect(isTokenExpired(token)).toBe(true);
		});

		it("should return null if exp field not present", () => {
			const token = createMockToken({ sub: "user123" });
			expect(isTokenExpired(token)).toBeNull();
		});

		it("should return null for invalid token", () => {
			expect(isTokenExpired("invalid")).toBeNull();
		});
	});

	describe("getUserInfoFromToken", () => {
		it("should extract all user info from token", () => {
			const futureTime = Math.floor(Date.now() / 1000) + 3600;
			const payload = {
				sub: "user123",
				email: "test@example.com",
				username: "testuser",
				exp: futureTime,
			};
			const token = createMockToken(payload);
			const info = getUserInfoFromToken(token);

			expect(info).toEqual({
				userId: "user123",
				email: "test@example.com",
				username: "testuser",
				isExpired: false,
				payload,
			});
		});

		it("should return null for invalid token", () => {
			expect(getUserInfoFromToken("invalid")).toBeNull();
		});
	});

	describe("Real-world JWT scenarios", () => {
		it("should handle a typical Cognito JWT token structure", () => {
			// Simulate a real Cognito ID token structure
			const payload = {
				sub: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
				"cognito:username": "testuser",
				email: "user@example.com",
				email_verified: true,
				iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Example",
				aud: "1234567890abcdefghijklmnop",
				token_use: "id",
				auth_time: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 3600,
				iat: Math.floor(Date.now() / 1000),
			};

			const token = createBase64UrlToken(payload);
			const decoded = decodeJWT(token);

			expect(decoded).toBeDefined();
			expect(decoded?.sub).toBe(payload.sub);
			expect(decoded?.email).toBe(payload.email);
		});

		it("should handle token with special ASCII characters", () => {
			// Test with special characters that are safe for btoa
			const payload = {
				sub: "user-123",
				name: "Test O'Brien",
				email: "test+tag@example.com",
			};

			const token = createBase64UrlToken(payload);
			const decoded = decodeJWT(token);

			expect(decoded).toBeDefined();
			expect(decoded?.name).toBe(payload.name);
			expect(decoded?.email).toBe(payload.email);
		});
	});
});
