import { type UseQueryResult, useQuery } from "@tanstack/react-query";

/**
 * ProPublica Congress API Integration Hooks
 *
 * API for U.S. Congressional data from ProPublica
 * API Documentation: https://projects.propublica.org/api-docs/congress-api/
 *
 * IMPORTANT: Requires API Key from ProPublica
 * Get your API key at: https://www.propublica.org/datastore/api/propublica-congress-api
 *
 * Usage:
 * 1. Set VITE_PROPUBLICA_API_KEY in your .env file
 * 2. Or pass apiKey directly to hooks via input parameter
 */

const PROPUBLICA_API_BASE = "https://api.propublica.org/congress/v1";

// ============================================================================
// Type Definitions - Based on ProPublica Congress API Schema
// ============================================================================

export interface ProPublicaMember {
	id: string;
	title: string;
	short_title: string;
	api_uri: string;
	first_name: string;
	middle_name?: string;
	last_name: string;
	suffix?: string;
	date_of_birth?: string;
	gender: string;
	party: string;
	leadership_role?: string;
	twitter_account?: string;
	facebook_account?: string;
	youtube_account?: string;
	govtrack_id?: string;
	cspan_id?: string;
	votesmart_id?: string;
	icpsr_id?: string;
	crp_id?: string;
	google_entity_id?: string;
	fec_candidate_id?: string;
	url?: string;
	rss_url?: string;
	contact_form?: string;
	in_office: boolean;
	cook_pvi?: string;
	dw_nominate?: number;
	ideal_point?: number;
	seniority?: string;
	next_election?: string;
	total_votes?: number;
	missed_votes?: number;
	total_present?: number;
	last_updated?: string;
	ocd_id?: string;
	office?: string;
	phone?: string;
	fax?: string;
	state: string;
	senate_class?: string;
	state_rank?: string;
	lis_id?: string;
	missed_votes_pct?: number;
	votes_with_party_pct?: number;
	votes_against_party_pct?: number;
}

export interface ProPublicaMemberVote {
	member_id: string;
	chamber: string;
	congress: string;
	session: string;
	roll_call: string;
	vote_uri: string;
	bill?: {
		bill_id: string;
		number: string;
		sponsor_id?: string;
		api_uri: string;
		title: string;
		latest_action: string;
	};
	description: string;
	question: string;
	result: string;
	date: string;
	time: string;
	position: string;
	total: {
		yes: number;
		no: number;
		present: number;
		not_voting: number;
	};
}

export interface ProPublicaBill {
	bill_id: string;
	bill_slug: string;
	bill_type: string;
	number: string;
	bill_uri: string;
	title: string;
	short_title?: string;
	sponsor_title?: string;
	sponsor_id?: string;
	sponsor_name?: string;
	sponsor_state?: string;
	sponsor_party?: string;
	sponsor_uri?: string;
	gpo_pdf_uri?: string;
	congressdotgov_url?: string;
	govtrack_url?: string;
	introduced_date: string;
	active: boolean;
	last_vote?: string;
	house_passage?: string;
	senate_passage?: string;
	enacted?: string;
	vetoed?: string;
	cosponsors?: number;
	cosponsors_by_party?: {
		D?: number;
		R?: number;
		ID?: number;
	};
	committees?: string;
	committee_codes?: string[];
	subcommittee_codes?: string[];
	primary_subject?: string;
	summary?: string;
	summary_short?: string;
	latest_major_action_date?: string;
	latest_major_action?: string;
}

export interface ProPublicaMembersResponse {
	status: string;
	copyright: string;
	results: Array<{
		congress: string;
		chamber: string;
		num_results: number;
		offset: number;
		members: ProPublicaMember[];
	}>;
}

export interface ProPublicaMembersByStateResponse {
	status: string;
	copyright: string;
	results: ProPublicaMember[];
}

export interface ProPublicaMemberVotesResponse {
	status: string;
	copyright: string;
	results: Array<{
		member_id: string;
		total_votes: number;
		offset: number;
		votes: ProPublicaMemberVote[];
	}>;
}

export interface ProPublicaRecentBillsResponse {
	status: string;
	copyright: string;
	results: Array<{
		congress: string;
		chamber: string;
		num_results: number;
		offset: number;
		bills: ProPublicaBill[];
	}>;
}

// ============================================================================
// Query Input Types
// ============================================================================

export interface GetMembersByStateInput {
	chamber: "house" | "senate";
	state: string;
	apiKey?: string;
}

export interface GetRecentBillsInput {
	congress: number;
	chamber: "house" | "senate";
	type: "introduced" | "updated" | "active" | "passed" | "enacted" | "vetoed";
	offset?: number;
	apiKey?: string;
}

export interface GetMemberVotesInput {
	memberId: string;
	congress?: number;
	chamber?: "house" | "senate";
	offset?: number;
	apiKey?: string;
}

// ============================================================================
// API Functions
// ============================================================================

function getProPublicaApiKey(providedKey?: string): string {
	const apiKey = providedKey || import.meta.env.VITE_PROPUBLICA_API_KEY;

	if (!apiKey) {
		throw new Error(
			"ProPublica API key is required. Set VITE_PROPUBLICA_API_KEY in .env or pass apiKey parameter.",
		);
	}

	return apiKey;
}

async function fetchProPublica<T>(
	endpoint: string,
	apiKey: string,
): Promise<T> {
	const url = `${PROPUBLICA_API_BASE}${endpoint}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"X-API-Key": apiKey,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text().catch(() => "Unknown error");
		throw new Error(`ProPublica API error (${response.status}): ${errorText}`);
	}

	return response.json();
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Get current members of Congress by chamber and state
 *
 * @example
 * const { data, isLoading, error } = useProPublicaMembersByState({
 *   chamber: 'senate',
 *   state: 'CA'
 * });
 */
export function useProPublicaMembersByState(
	input: GetMembersByStateInput,
): UseQueryResult<ProPublicaMembersByStateResponse, Error> {
	return useQuery({
		queryKey: ["propublica", "members", "state", input.chamber, input.state],
		queryFn: async () => {
			if (!input.chamber) {
				throw new Error("Chamber is required (house or senate)");
			}
			if (!input.state) {
				throw new Error("State is required (e.g., CA, NY, TX)");
			}

			const apiKey = getProPublicaApiKey(input.apiKey);
			const endpoint = `/members/${input.chamber}/${input.state}/current.json`;

			return fetchProPublica<ProPublicaMembersByStateResponse>(
				endpoint,
				apiKey,
			);
		},
		enabled: !!input.chamber && !!input.state,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Get recent bills by type
 *
 * @example
 * const { data, isLoading, error } = useProPublicaRecentBills({
 *   congress: 118,
 *   chamber: 'house',
 *   type: 'introduced',
 *   offset: 0
 * });
 */
export function useProPublicaRecentBills(
	input: GetRecentBillsInput,
): UseQueryResult<ProPublicaRecentBillsResponse, Error> {
	return useQuery({
		queryKey: [
			"propublica",
			"bills",
			"recent",
			input.congress,
			input.chamber,
			input.type,
			input.offset,
		],
		queryFn: async () => {
			if (!input.congress) {
				throw new Error("Congress number is required (e.g., 118)");
			}
			if (!input.chamber) {
				throw new Error("Chamber is required (house or senate)");
			}
			if (!input.type) {
				throw new Error(
					"Bill type is required (introduced, updated, active, passed, enacted, vetoed)",
				);
			}

			const apiKey = getProPublicaApiKey(input.apiKey);
			const offset = input.offset || 0;
			const endpoint = `/${input.congress}/${input.chamber}/bills/${input.type}.json?offset=${offset}`;

			return fetchProPublica<ProPublicaRecentBillsResponse>(endpoint, apiKey);
		},
		enabled: !!input.congress && !!input.chamber && !!input.type,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Get voting records for a specific member
 *
 * @example
 * const { data, isLoading, error } = useProPublicaMemberVotes({
 *   memberId: 'A000360',
 *   congress: 118,
 *   chamber: 'senate'
 * });
 */
export function useProPublicaMemberVotes(
	input: GetMemberVotesInput,
): UseQueryResult<ProPublicaMemberVotesResponse, Error> {
	const congress = input.congress || 118; // Default to current congress
	const chamber = input.chamber || "senate"; // Default to senate

	return useQuery({
		queryKey: [
			"propublica",
			"member",
			"votes",
			input.memberId,
			congress,
			chamber,
			input.offset,
		],
		queryFn: async () => {
			if (!input.memberId) {
				throw new Error("Member ID is required");
			}

			const apiKey = getProPublicaApiKey(input.apiKey);
			const offset = input.offset || 0;
			const endpoint = `/${congress}/${chamber}/members/${input.memberId}/votes.json?offset=${offset}`;

			return fetchProPublica<ProPublicaMemberVotesResponse>(endpoint, apiKey);
		},
		enabled: !!input.memberId,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Get all current members of a chamber
 *
 * @example
 * const { data, isLoading, error } = useProPublicaMembers({
 *   congress: 118,
 *   chamber: 'senate'
 * });
 */
export function useProPublicaMembers(input: {
	congress: number;
	chamber: "house" | "senate";
	apiKey?: string;
}): UseQueryResult<ProPublicaMembersResponse, Error> {
	return useQuery({
		queryKey: ["propublica", "members", input.congress, input.chamber],
		queryFn: async () => {
			if (!input.congress) {
				throw new Error("Congress number is required (e.g., 118)");
			}
			if (!input.chamber) {
				throw new Error("Chamber is required (house or senate)");
			}

			const apiKey = getProPublicaApiKey(input.apiKey);
			const endpoint = `/${input.congress}/${input.chamber}/members.json`;

			return fetchProPublica<ProPublicaMembersResponse>(endpoint, apiKey);
		},
		enabled: !!input.congress && !!input.chamber,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}
