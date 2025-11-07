/**
 * Enhanced API Client for SelfApp with Single Table Design support
 * Provides generic CRUD operations for all entity types
 */

import { getAuthToken } from "./auth-integration";
import { TokenExpiredError } from "./auth-errors";

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

export interface BaseEntity {
	userId?: string;
	entryId?: string;
	entityType?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface DailyLogEntry extends BaseEntity {
	date: string;
	goals: string[];
	execution_notes?: string | null;
	tasks?: any[] | null;
	focus_rating: number;
	energy_rating: number;
	motivation: number;
	anxiety: number;
	confidence: number;
	difficulties?: string | null;
	performance_score: number;
	win_lose: boolean;
	reasoning?: string | null;
	improvement_notes?: string | null;
	skills?: string[] | null;
	strengths?: string[] | null;
	scorecard?: {
		wins: string[];
		needs_improvement: string;
	};
}

export interface BecomeEntry extends BaseEntity {
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

export interface SuccessDefinition extends BaseEntity {
	vision: string;
	divineCapacities: string[];
	selfMasteryGoals: string[];
	principles: Array<{
		id: number;
		principle: string;
		scripture: string;
		commitment: string;
		dateCreated: string;
	}>;
	temporalGoals: string;
	spiritualGoals: string;
	characterGoals: string;
	intelligenceGoals: string;
}

export interface LetGodEntry extends BaseEntity {
	date: string;
	situation: string;
	seekingPrompt: string;
	holyGhostGuidance: string;
	myDesire: string;
	godsWill: string;
	actionTaken: string;
	alignment: "aligned" | "partial" | "struggling";
	reflection: string;
}

export interface SelfRegEntry extends BaseEntity {
	createdAt: string;
	trigger: string;
	distraction: string | null;
	choice: string;
	identity: "inward" | "outward";
}

export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	entry?: T;
	entries?: T[];
	error?: string;
	message?: string;
	count?: number;
	entityType?: string;
}

/**
 * Make authenticated API request with enhanced error handling
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
		// Handle 401 Unauthorized specifically (expired or invalid token)
		if (response.status === 401) {
			throw new TokenExpiredError();
		}
		
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.message || errorData.error || `HTTP ${response.status}`,
		);
	}

	return response.json();
}

/**
 * Generic function to list entities by type
 */
export async function listEntities<T extends BaseEntity>(
	entityType: string,
	limit = 100,
): Promise<T[]> {
	const response = await apiRequest<ApiResponse<T>>(
		`/api/${entityType.toLowerCase()}?limit=${limit}`,
	);
	return response.entries || [];
}

/**
 * Generic function to get a specific entity
 */
export async function getEntity<T extends BaseEntity>(
	entityType: string,
	entryId: string,
): Promise<T> {
	const response = await apiRequest<ApiResponse<T>>(
		`/api/${entityType.toLowerCase()}/${entryId}`,
	);
	if (!response.entry) {
		throw new Error("Entry not found");
	}
	return response.entry;
}

/**
 * Generic function to create an entity
 */
export async function createEntity<T extends BaseEntity>(
	entityType: string,
	entity: Omit<T, "userId" | "entryId" | "createdAt" | "updatedAt" | "entityType">,
): Promise<T> {
	const response = await apiRequest<ApiResponse<T>>(
		`/api/${entityType.toLowerCase()}`,
		{
			method: "POST",
			body: JSON.stringify(entity),
		},
	);
	if (!response.entry) {
		throw new Error("Failed to create entry");
	}
	return response.entry;
}

/**
 * Generic function to update an entity
 */
export async function updateEntity<T extends BaseEntity>(
	entityType: string,
	entryId: string,
	updates: Partial<Omit<T, "userId" | "entryId" | "createdAt" | "entityType">>,
): Promise<T> {
	const response = await apiRequest<ApiResponse<T>>(
		`/api/${entityType.toLowerCase()}/${entryId}`,
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
 * Generic function to delete an entity
 */
export async function deleteEntity(
	entityType: string,
	entryId: string,
): Promise<void> {
	await apiRequest<ApiResponse<void>>(
		`/api/${entityType.toLowerCase()}/${entryId}`,
		{
			method: "DELETE",
		},
	);
}

/**
 * Convenience functions for specific entity types
 */

// Daily Log
export const listDailyLogs = () => listEntities<DailyLogEntry>("daily-log");
export const getDailyLog = (id: string) => getEntity<DailyLogEntry>("daily-log", id);
export const createDailyLog = (entry: Omit<DailyLogEntry, "userId" | "entryId" | "createdAt" | "updatedAt" | "entityType">) =>
	createEntity<DailyLogEntry>("daily-log", entry);
export const updateDailyLog = (id: string, updates: Partial<Omit<DailyLogEntry, "userId" | "entryId" | "createdAt" | "entityType">>) =>
	updateEntity<DailyLogEntry>("daily-log", id, updates);
export const deleteDailyLog = (id: string) => deleteEntity("daily-log", id);

// Become
export const listBecomeEntries = () => listEntities<BecomeEntry>("become");
export const getBecomeEntry = (id: string) => getEntity<BecomeEntry>("become", id);
export const createBecomeEntry = (entry: Omit<BecomeEntry, "userId" | "entryId" | "createdAt" | "updatedAt" | "entityType">) =>
	createEntity<BecomeEntry>("become", entry);
export const updateBecomeEntry = (id: string, updates: Partial<Omit<BecomeEntry, "userId" | "entryId" | "createdAt" | "entityType">>) =>
	updateEntity<BecomeEntry>("become", id, updates);
export const deleteBecomeEntry = (id: string) => deleteEntity("become", id);

// Success Definition
export const listSuccessDefinitions = () => listEntities<SuccessDefinition>("success");
export const getSuccessDefinition = (id: string) => getEntity<SuccessDefinition>("success", id);
export const createSuccessDefinition = (entry: Omit<SuccessDefinition, "userId" | "entryId" | "createdAt" | "updatedAt" | "entityType">) =>
	createEntity<SuccessDefinition>("success", entry);
export const updateSuccessDefinition = (id: string, updates: Partial<Omit<SuccessDefinition, "userId" | "entryId" | "createdAt" | "entityType">>) =>
	updateEntity<SuccessDefinition>("success", id, updates);
export const deleteSuccessDefinition = (id: string) => deleteEntity("success", id);

// Let God Prevail
export const listLetGodEntries = () => listEntities<LetGodEntry>("letgod");
export const getLetGodEntry = (id: string) => getEntity<LetGodEntry>("letgod", id);
export const createLetGodEntry = (entry: Omit<LetGodEntry, "userId" | "entryId" | "createdAt" | "updatedAt" | "entityType">) =>
	createEntity<LetGodEntry>("letgod", entry);
export const updateLetGodEntry = (id: string, updates: Partial<Omit<LetGodEntry, "userId" | "entryId" | "createdAt" | "entityType">>) =>
	updateEntity<LetGodEntry>("letgod", id, updates);
export const deleteLetGodEntry = (id: string) => deleteEntity("letgod", id);

// Self Regulation
export const listSelfRegEntries = () => listEntities<SelfRegEntry>("selfreg");
export const getSelfRegEntry = (id: string) => getEntity<SelfRegEntry>("selfreg", id);
export const createSelfRegEntry = (entry: Omit<SelfRegEntry, "userId" | "entryId" | "createdAt" | "updatedAt" | "entityType">) =>
	createEntity<SelfRegEntry>("selfreg", entry);
export const updateSelfRegEntry = (id: string, updates: Partial<Omit<SelfRegEntry, "userId" | "entryId" | "createdAt" | "entityType">>) =>
	updateEntity<SelfRegEntry>("selfreg", id, updates);
export const deleteSelfRegEntry = (id: string) => deleteEntity("selfreg", id);

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
