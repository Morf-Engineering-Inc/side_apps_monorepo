import { type UseQueryResult, useQuery } from "@tanstack/react-query";

/**
 * GovTrack API Integration Hooks
 *
 * Public API for U.S. Congressional data from GovTrack.us
 * API Documentation: https://www.govtrack.us/developers/api
 *
 * Note: GovTrack API is public and does not require authentication
 */

const GOVTRACK_API_BASE = "https://www.govtrack.us/api/v2";

// ============================================================================
// Type Definitions - Based on GovTrack API v2 Schema
// ============================================================================

export interface GovTrackRole {
	id: number;
	person: {
		id: number;
		firstname: string;
		lastname: string;
		name: string;
		gender: string;
		birthday: string;
		link: string;
	};
	role_type: "senator" | "representative";
	role_type_label: string;
	senator_class?: number;
	senator_rank?: string;
	district?: number;
	state: string;
	party: string;
	title: string;
	title_long: string;
	startdate: string;
	enddate: string;
	current: boolean;
	website?: string;
	phone?: string;
	contact_form?: string;
	leadership_title?: string;
}

export interface GovTrackVote {
	id: number;
	chamber: "senate" | "house";
	chamber_label: string;
	congress: number;
	session: string;
	number: number;
	question: string;
	required: string;
	result: string;
	category: string;
	created: string;
	vote_type: string;
	question_details?: string;
	link: string;
	total_plus: number;
	total_minus: number;
	total_other: number;
	options?: {
		key: string;
		value: string;
	}[];
}

export interface GovTrackBill {
	id: number;
	congress: number;
	bill_type: string;
	bill_type_label: string;
	number: number;
	title: string;
	title_without_number: string;
	display_number: string;
	introduced_date: string;
	current_status: string;
	current_status_label: string;
	current_status_date: string;
	sponsor?: {
		id: number;
		name: string;
		party: string;
		state: string;
	};
	sponsor_role?: number;
	committees?: string[];
	cosponsors?: number[];
	link: string;
	thomas_link?: string;
	opensecrets_summary?: string;
	major_actions?: Array<{
		date: string;
		description: string;
	}>;
}

export interface GovTrackPaginatedResponse<T> {
	meta: {
		limit: number;
		offset: number;
		total_count: number;
		next?: string;
		previous?: string;
	};
	objects: T[];
}

// ============================================================================
// Query Input Types
// ============================================================================

export interface GetRolesByStateInput {
	state: string;
	current?: boolean;
	role_type?: "senator" | "representative";
	limit?: number;
	offset?: number;
}

export interface GetVotesInput {
	chamber?: "senate" | "house";
	congress?: number;
	session?: string;
	limit?: number;
	offset?: number;
	order_by?: string;
}

export interface GetBillsInput {
	congress?: number;
	current_status?: string;
	sponsor?: number;
	cosponsors?: number;
	committees?: string;
	limit?: number;
	offset?: number;
	order_by?: string;
}

export interface GetBillByIdInput {
	billId: number;
}

export interface GetVoteByIdInput {
	voteId: number;
}

// ============================================================================
// API Functions
// ============================================================================

async function fetchGovTrack<T>(
	endpoint: string,
	params?: Record<string, string | number | boolean>,
): Promise<T> {
	const url = new URL(endpoint, GOVTRACK_API_BASE);

	// Add query parameters
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				url.searchParams.append(key, String(value));
			}
		}
	}

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(`GovTrack API error (${response.status}): ${errorText}`);
	}

	return response.json();
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Get current members of Congress by state
 *
 * @example
 * const { data, isLoading, error } = useGovTrackRolesByState({
 *   state: 'CA',
 *   current: true,
 *   role_type: 'senator'
 * });
 */
export function useGovTrackRolesByState(
	input: GetRolesByStateInput,
): UseQueryResult<GovTrackPaginatedResponse<GovTrackRole>, Error> {
	return useQuery({
		queryKey: [
			"govtrack",
			"roles",
			"state",
			input.state,
			input.current,
			input.role_type,
			input.limit,
			input.offset,
		],
		queryFn: async () => {
			if (!input.state) {
				throw new Error("State is required");
			}

			const params: Record<string, string | number | boolean> = {
				state: input.state,
			};

			if (input.current !== undefined) {
				params.current = input.current;
			}
			if (input.role_type) {
				params.role_type = input.role_type;
			}
			if (input.limit !== undefined) {
				params.limit = input.limit;
			}
			if (input.offset !== undefined) {
				params.offset = input.offset;
			}

			return fetchGovTrack<GovTrackPaginatedResponse<GovTrackRole>>(
				"/role",
				params,
			);
		},
		enabled: !!input.state,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Get voting records with optional filters
 *
 * @example
 * const { data, isLoading, error } = useGovTrackVotes({
 *   chamber: 'senate',
 *   congress: 118,
 *   limit: 20
 * });
 */
export function useGovTrackVotes(
	input: GetVotesInput = {},
): UseQueryResult<GovTrackPaginatedResponse<GovTrackVote>, Error> {
	return useQuery({
		queryKey: [
			"govtrack",
			"votes",
			input.chamber,
			input.congress,
			input.session,
			input.limit,
			input.offset,
			input.order_by,
		],
		queryFn: async () => {
			const params: Record<string, string | number | boolean> = {};

			if (input.chamber) {
				params.chamber = input.chamber;
			}
			if (input.congress !== undefined) {
				params.congress = input.congress;
			}
			if (input.session) {
				params.session = input.session;
			}
			if (input.limit !== undefined) {
				params.limit = input.limit;
			}
			if (input.offset !== undefined) {
				params.offset = input.offset;
			}
			if (input.order_by) {
				params.order_by = input.order_by;
			}

			return fetchGovTrack<GovTrackPaginatedResponse<GovTrackVote>>(
				"/vote",
				params,
			);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Get a specific vote by ID
 *
 * @example
 * const { data, isLoading, error } = useGovTrackVoteById({ voteId: 12345 });
 */
export function useGovTrackVoteById(
	input: GetVoteByIdInput,
): UseQueryResult<GovTrackVote, Error> {
	return useQuery({
		queryKey: ["govtrack", "vote", input.voteId],
		queryFn: async () => {
			if (!input.voteId) {
				throw new Error("Vote ID is required");
			}

			return fetchGovTrack<GovTrackVote>(`/vote/${input.voteId}`);
		},
		enabled: !!input.voteId,
		staleTime: 10 * 60 * 1000, // 10 minutes - votes don't change
	});
}

/**
 * Get bill information with optional filters
 *
 * @example
 * const { data, isLoading, error } = useGovTrackBills({
 *   congress: 118,
 *   current_status: 'enacted_signed',
 *   limit: 50
 * });
 */
export function useGovTrackBills(
	input: GetBillsInput = {},
): UseQueryResult<GovTrackPaginatedResponse<GovTrackBill>, Error> {
	return useQuery({
		queryKey: [
			"govtrack",
			"bills",
			input.congress,
			input.current_status,
			input.sponsor,
			input.cosponsors,
			input.committees,
			input.limit,
			input.offset,
			input.order_by,
		],
		queryFn: async () => {
			const params: Record<string, string | number | boolean> = {};

			if (input.congress !== undefined) {
				params.congress = input.congress;
			}
			if (input.current_status) {
				params.current_status = input.current_status;
			}
			if (input.sponsor !== undefined) {
				params.sponsor = input.sponsor;
			}
			if (input.cosponsors !== undefined) {
				params.cosponsors = input.cosponsors;
			}
			if (input.committees) {
				params.committees = input.committees;
			}
			if (input.limit !== undefined) {
				params.limit = input.limit;
			}
			if (input.offset !== undefined) {
				params.offset = input.offset;
			}
			if (input.order_by) {
				params.order_by = input.order_by;
			}

			return fetchGovTrack<GovTrackPaginatedResponse<GovTrackBill>>(
				"/bill",
				params,
			);
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Get a specific bill by ID
 *
 * @example
 * const { data, isLoading, error } = useGovTrackBillById({ billId: 123456 });
 */
export function useGovTrackBillById(
	input: GetBillByIdInput,
): UseQueryResult<GovTrackBill, Error> {
	return useQuery({
		queryKey: ["govtrack", "bill", input.billId],
		queryFn: async () => {
			if (!input.billId) {
				throw new Error("Bill ID is required");
			}

			return fetchGovTrack<GovTrackBill>(`/bill/${input.billId}`);
		},
		enabled: !!input.billId,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}
