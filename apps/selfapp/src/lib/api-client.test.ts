import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type Entry,
	checkHealth,
	createEntry,
	deleteEntry,
	getEntries,
	getEntry,
	updateEntry,
} from "./api-client";
import * as authIntegration from "./auth-integration";

// Mock the auth-integration module
vi.mock("./auth-integration", () => ({
	getAuthToken: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

describe("API Client - CRUD Operations", () => {
	const mockToken = "mock-jwt-token";
	const mockApiUrl = "https://api.example.com";
	const mockEntry: Entry = {
		userId: "user123",
		entryId: "entry456",
		createdAt: "2025-11-07T00:00:00Z",
		updatedAt: "2025-11-07T00:00:00Z",
		date: "2025-11-07",
		action: "Studied scriptures",
		motive: "To feel closer to God",
		conscienceCheck: true,
		hearingHisVoice: true,
		losingEvilDesires: true,
		servingOthers: true,
		serviceBlessedOthers: true,
		reflection: "Felt peace and direction",
	};

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks();

		// Mock the auth token
		vi.mocked(authIntegration.getAuthToken).mockReturnValue(mockToken);

		// Mock the API URL via environment variable
		import.meta.env.VITE_API_URL = mockApiUrl;

		// Reset fetch mock
		(global.fetch as any).mockReset();
	});

	describe("getEntries - READ all entries", () => {
		it("should fetch all entries successfully", async () => {
			const mockEntries = [mockEntry, { ...mockEntry, entryId: "entry789" }];
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entries: mockEntries }),
			});

			const result = await getEntries(50);

			expect(global.fetch).toHaveBeenCalledWith(
				`${mockApiUrl}/api/entries?limit=50`,
				expect.objectContaining({
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						Authorization: `Bearer ${mockToken}`,
					}),
				}),
			);
			expect(result).toEqual(mockEntries);
		});

		it("should handle custom limit parameter", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entries: [] }),
			});

			await getEntries(100);

			expect(global.fetch).toHaveBeenCalledWith(
				`${mockApiUrl}/api/entries?limit=100`,
				expect.any(Object),
			);
		});

		it("should return empty array when no entries are returned", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entries: undefined }),
			});

			const result = await getEntries();

			expect(result).toEqual([]);
		});

		it("should throw error when authentication token is missing", async () => {
			vi.mocked(authIntegration.getAuthToken).mockReturnValue(null);

			await expect(getEntries()).rejects.toThrow(
				"No authentication token available",
			);
		});

		it("should throw error when API URL is not configured", async () => {
			import.meta.env.VITE_API_URL = "";

			await expect(getEntries()).rejects.toThrow("API URL not configured");
		});

		it("should handle network errors", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => ({ message: "Internal Server Error" }),
			});

			await expect(getEntries()).rejects.toThrow("Internal Server Error");
		});
	});

	describe("getEntry - READ single entry", () => {
		it("should fetch a single entry by ID", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: mockEntry }),
			});

			const result = await getEntry("entry456");

			expect(global.fetch).toHaveBeenCalledWith(
				`${mockApiUrl}/api/entries/entry456`,
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: `Bearer ${mockToken}`,
					}),
				}),
			);
			expect(result).toEqual(mockEntry);
		});

		it("should throw error when entry is not found", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: undefined }),
			});

			await expect(getEntry("nonexistent")).rejects.toThrow("Entry not found");
		});

		it("should handle 404 errors", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: async () => ({ error: "Entry not found" }),
			});

			await expect(getEntry("entry456")).rejects.toThrow("Entry not found");
		});
	});

	describe("createEntry - CREATE operation", () => {
		const newEntry: Omit<
			Entry,
			"userId" | "entryId" | "createdAt" | "updatedAt"
		> = {
			date: "2025-11-07",
			action: "Helped a neighbor",
			motive: "Love and compassion",
			conscienceCheck: true,
			hearingHisVoice: false,
			losingEvilDesires: true,
			servingOthers: true,
			serviceBlessedOthers: true,
			reflection: "Felt fulfilled",
		};

		it("should create a new entry successfully", async () => {
			const createdEntry = { ...mockEntry, ...newEntry };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: createdEntry }),
			});

			const result = await createEntry(newEntry);

			expect(global.fetch).toHaveBeenCalledWith(
				`${mockApiUrl}/api/entries`,
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						Authorization: `Bearer ${mockToken}`,
					}),
					body: JSON.stringify(newEntry),
				}),
			);
			expect(result).toEqual(createdEntry);
		});

		it("should throw error when entry creation fails", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: undefined }),
			});

			await expect(createEntry(newEntry)).rejects.toThrow(
				"Failed to create entry",
			);
		});

		it("should handle validation errors", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({ error: "Invalid entry data" }),
			});

			await expect(createEntry(newEntry)).rejects.toThrow("Invalid entry data");
		});

		it("should require authentication token", async () => {
			vi.mocked(authIntegration.getAuthToken).mockReturnValue(null);

			await expect(createEntry(newEntry)).rejects.toThrow(
				"No authentication token available",
			);
		});
	});

	describe("updateEntry - UPDATE operation", () => {
		const updates = {
			reflection: "Updated reflection after more thought",
			serviceBlessedOthers: false,
		};

		it("should update an existing entry successfully", async () => {
			const updatedEntry = { ...mockEntry, ...updates };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: updatedEntry }),
			});

			const result = await updateEntry("entry456", updates);

			expect(global.fetch).toHaveBeenCalledWith(
				`${mockApiUrl}/api/entries/entry456`,
				expect.objectContaining({
					method: "PUT",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						Authorization: `Bearer ${mockToken}`,
					}),
					body: JSON.stringify(updates),
				}),
			);
			expect(result).toEqual(updatedEntry);
		});

		it("should allow partial updates", async () => {
			const partialUpdate = { reflection: "Just reflection update" };
			const updatedEntry = { ...mockEntry, ...partialUpdate };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: updatedEntry }),
			});

			const result = await updateEntry("entry456", partialUpdate);

			expect(result.reflection).toBe(partialUpdate.reflection);
			expect(result.action).toBe(mockEntry.action); // Should maintain other fields
		});

		it("should throw error when update fails", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entry: undefined }),
			});

			await expect(updateEntry("entry456", updates)).rejects.toThrow(
				"Failed to update entry",
			);
		});

		it("should handle 404 for non-existent entries", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: async () => ({ error: "Entry not found" }),
			});

			await expect(updateEntry("nonexistent", updates)).rejects.toThrow(
				"Entry not found",
			);
		});

		it("should require authentication token", async () => {
			vi.mocked(authIntegration.getAuthToken).mockReturnValue(null);

			await expect(updateEntry("entry456", updates)).rejects.toThrow(
				"No authentication token available",
			);
		});
	});

	describe("deleteEntry - DELETE operation", () => {
		it("should delete an entry successfully", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, message: "Entry deleted" }),
			});

			await deleteEntry("entry456");

			expect(global.fetch).toHaveBeenCalledWith(
				`${mockApiUrl}/api/entries/entry456`,
				expect.objectContaining({
					method: "DELETE",
					headers: expect.objectContaining({
						Authorization: `Bearer ${mockToken}`,
					}),
				}),
			);
		});

		it("should handle deletion of non-existent entry", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404,
				json: async () => ({ error: "Entry not found" }),
			});

			await expect(deleteEntry("nonexistent")).rejects.toThrow(
				"Entry not found",
			);
		});

		it("should require authentication token", async () => {
			vi.mocked(authIntegration.getAuthToken).mockReturnValue(null);

			await expect(deleteEntry("entry456")).rejects.toThrow(
				"No authentication token available",
			);
		});

		it("should handle server errors during deletion", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => ({ message: "Failed to delete entry" }),
			});

			await expect(deleteEntry("entry456")).rejects.toThrow(
				"Failed to delete entry",
			);
		});
	});

	describe("checkHealth - Health check endpoint", () => {
		it("should check API health successfully", async () => {
			const healthResponse = {
				status: "healthy",
				timestamp: "2025-11-07T00:00:00Z",
			};
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => healthResponse,
			});

			const result = await checkHealth();

			expect(global.fetch).toHaveBeenCalledWith(`${mockApiUrl}/health`);
			expect(result).toEqual(healthResponse);
		});

		it("should throw error when health check fails", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 503,
			});

			await expect(checkHealth()).rejects.toThrow("Health check failed: 503");
		});

		it("should throw error when API URL is not configured", async () => {
			import.meta.env.VITE_API_URL = "";

			await expect(checkHealth()).rejects.toThrow("API URL not configured");
		});
	});

	describe("Error handling and edge cases", () => {
		it("should handle JSON parse errors gracefully", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => {
					throw new Error("Invalid JSON");
				},
			});

			await expect(getEntries()).rejects.toThrow("HTTP 500");
		});

		it("should include authorization header in all authenticated requests", async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ success: true, entries: [] }),
			});

			await getEntries();

			const fetchCall = (global.fetch as any).mock.calls[0];
			const headers = fetchCall[1].headers;
			expect(headers.Authorization).toBe(`Bearer ${mockToken}`);
		});

		it("should handle network timeouts", async () => {
			(global.fetch as any).mockRejectedValueOnce(new Error("Network timeout"));

			await expect(getEntries()).rejects.toThrow("Network timeout");
		});
	});
});
