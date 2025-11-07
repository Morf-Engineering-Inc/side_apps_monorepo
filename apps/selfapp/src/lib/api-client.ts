/**
 * API Client for BecomeLog backend
 * Handles all API communication with authentication
 */

import { getAuthToken } from "./auth-integration";

// Get API URL from config or environment
const getApiUrl = (): string => {
	if (typeof window !== "undefined") {
		const config = (window as any).AWS_CONFIG;
		if (config?.apiUrl) {
			return config.apiUrl;
		}
	}
	return import.meta.env.VITE_API_URL || "";
};

export interface Entry {
	userId?: string;
	entryId?: string;
	createdAt?: string;
	updatedAt?: string;
	date: string;
	action: string;
	motive: string;
	conscienceCheck: boolean;
	hearingHisVoice: boolean;
	losingEvilDesires: boolean;
	servingOthers: boolean;
	serviceBlessedOthers: boolean;
	reflection: string;
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const apiUrl = getApiUrl();
	const token = getAuthToken();

	if (!apiUrl) {
		throw new Error("API URL not configured");
	}

	if (!token) {
		throw new Error("No authentication token available");
	}

	const url = `${apiUrl}${endpoint}`;

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
		...options.headers,
	};

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.message || errorData.error || `HTTP ${response.status}`,
		);
	}

	return response.json();
}

/**
 * Get all entries for the current user
 */
export async function getEntries(limit = 50): Promise<Entry[]> {
	const response = await apiRequest<{ success: boolean; entries: Entry[] }>(
		`/api/entries?limit=${limit}`,
	);
	return response.entries || [];
}

/**
 * Get a specific entry by ID
 */
export async function getEntry(entryId: string): Promise<Entry> {
	const response = await apiRequest<{ success: boolean; entry: Entry }>(
		`/api/entries/${entryId}`,
	);
	if (!response.entry) {
		throw new Error("Entry not found");
	}
	return response.entry;
}

/**
 * Create a new entry
 */
export async function createEntry(
	entry: Omit<Entry, "userId" | "entryId" | "createdAt" | "updatedAt">,
): Promise<Entry> {
	const response = await apiRequest<{ success: boolean; entry: Entry }>(
		"/api/entries",
		{
			method: "POST",
			body: JSON.stringify(entry),
		},
	);
	if (!response.entry) {
		throw new Error("Failed to create entry");
	}
	return response.entry;
}

/**
 * Update an existing entry
 */
export async function updateEntry(
	entryId: string,
	updates: Partial<
		Omit<Entry, "userId" | "entryId" | "createdAt" | "updatedAt">
	>,
): Promise<Entry> {
	const response = await apiRequest<{ success: boolean; entry: Entry }>(
		`/api/entries/${entryId}`,
		{
			method: "PUT",
			body: JSON.stringify(updates),
		},
	);
	if (!response.entry) {
		throw new Error("Failed to update entry");
	}
	return response.entry;
}

/**
 * Delete an entry
 */
export async function deleteEntry(entryId: string): Promise<void> {
	await apiRequest<{ success: boolean; message: string }>(
		`/api/entries/${entryId}`,
		{
			method: "DELETE",
		},
	);
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{
	status: string;
	timestamp: string;
}> {
	const apiUrl = getApiUrl();
	if (!apiUrl) {
		throw new Error("API URL not configured");
	}

	const response = await fetch(`${apiUrl}/health`);
	if (!response.ok) {
		throw new Error(`Health check failed: ${response.status}`);
	}
	return response.json();
}
