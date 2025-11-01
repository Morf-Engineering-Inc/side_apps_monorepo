/**
 * Congressional Voting Records Application Types
 */

export type IssueCategory =
	| "Immigration"
	| "Healthcare"
	| "Climate Change"
	| "National Debt"
	| "War Authorization"
	| "Gun Control"
	| "Infrastructure"
	| "Abortion"
	| "Social Security"
	| "Civil Rights";

export type Party = "Democrat" | "Republican" | "Independent" | "Other";

export type Role = "Senator" | "Representative";

export type VotePosition = "Yes" | "No" | "Present" | "Not Voting";

export type USState =
	| "AL"
	| "AK"
	| "AZ"
	| "AR"
	| "CA"
	| "CO"
	| "CT"
	| "DE"
	| "FL"
	| "GA"
	| "HI"
	| "ID"
	| "IL"
	| "IN"
	| "IA"
	| "KS"
	| "KY"
	| "LA"
	| "ME"
	| "MD"
	| "MA"
	| "MI"
	| "MN"
	| "MS"
	| "MO"
	| "MT"
	| "NE"
	| "NV"
	| "NH"
	| "NJ"
	| "NM"
	| "NY"
	| "NC"
	| "ND"
	| "OH"
	| "OK"
	| "OR"
	| "PA"
	| "RI"
	| "SC"
	| "SD"
	| "TN"
	| "TX"
	| "UT"
	| "VT"
	| "VA"
	| "WA"
	| "WV"
	| "WI"
	| "WY";

export const US_STATES: { value: USState; label: string }[] = [
	{ value: "AL", label: "Alabama" },
	{ value: "AK", label: "Alaska" },
	{ value: "AZ", label: "Arizona" },
	{ value: "AR", label: "Arkansas" },
	{ value: "CA", label: "California" },
	{ value: "CO", label: "Colorado" },
	{ value: "CT", label: "Connecticut" },
	{ value: "DE", label: "Delaware" },
	{ value: "FL", label: "Florida" },
	{ value: "GA", label: "Georgia" },
	{ value: "HI", label: "Hawaii" },
	{ value: "ID", label: "Idaho" },
	{ value: "IL", label: "Illinois" },
	{ value: "IN", label: "Indiana" },
	{ value: "IA", label: "Iowa" },
	{ value: "KS", label: "Kansas" },
	{ value: "KY", label: "Kentucky" },
	{ value: "LA", label: "Louisiana" },
	{ value: "ME", label: "Maine" },
	{ value: "MD", label: "Maryland" },
	{ value: "MA", label: "Massachusetts" },
	{ value: "MI", label: "Michigan" },
	{ value: "MN", label: "Minnesota" },
	{ value: "MS", label: "Mississippi" },
	{ value: "MO", label: "Missouri" },
	{ value: "MT", label: "Montana" },
	{ value: "NE", label: "Nebraska" },
	{ value: "NV", label: "Nevada" },
	{ value: "NH", label: "New Hampshire" },
	{ value: "NJ", label: "New Jersey" },
	{ value: "NM", label: "New Mexico" },
	{ value: "NY", label: "New York" },
	{ value: "NC", label: "North Carolina" },
	{ value: "ND", label: "North Dakota" },
	{ value: "OH", label: "Ohio" },
	{ value: "OK", label: "Oklahoma" },
	{ value: "OR", label: "Oregon" },
	{ value: "PA", label: "Pennsylvania" },
	{ value: "RI", label: "Rhode Island" },
	{ value: "SC", label: "South Carolina" },
	{ value: "SD", label: "South Dakota" },
	{ value: "TN", label: "Tennessee" },
	{ value: "TX", label: "Texas" },
	{ value: "UT", label: "Utah" },
	{ value: "VT", label: "Vermont" },
	{ value: "VA", label: "Virginia" },
	{ value: "WA", label: "Washington" },
	{ value: "WV", label: "West Virginia" },
	{ value: "WI", label: "Wisconsin" },
	{ value: "WY", label: "Wyoming" },
];

export const ISSUE_CATEGORIES: IssueCategory[] = [
	"Immigration",
	"Healthcare",
	"Climate Change",
	"National Debt",
	"War Authorization",
	"Gun Control",
	"Infrastructure",
	"Abortion",
	"Social Security",
	"Civil Rights",
];

// Application view types for politician data display
export interface PoliticianProfile {
	id: string;
	name: string;
	party: Party;
	state: USState;
	role: Role;
	yearsOfService: number;
	imageUrl?: string;
	website?: string;
	phone?: string;
	govtrackId?: number;
	proPublicaId?: string;
}

export interface VotingRecord {
	id: string;
	politicianId: string;
	billId: string;
	vote: VotePosition;
	date: string;
}

export interface Bill {
	id: string;
	title: string;
	shortTitle?: string;
	number: string;
	congress: number;
	chamber: "Senate" | "House";
	issueCategory: IssueCategory;
	description: string;
	year: number;
	introducedDate: string;
	status: string;
	yesVotes: number;
	noVotes: number;
	presentVotes: number;
	notVotingCount: number;
	result: string;
	impactRank?: number;
}

export interface RhetoricsStatement {
	id: string;
	politicianId: string;
	issueCategory: IssueCategory;
	quote: string;
	source: string;
	date: string;
	url?: string;
}

export interface PoliticianVotingScorecard {
	politician: PoliticianProfile;
	votesByIssue: {
		[key in IssueCategory]?: {
			bills: Array<{
				bill: Bill;
				vote: VotePosition;
				date: string;
			}>;
			summary: {
				totalVotes: number;
				yesVotes: number;
				noVotes: number;
			};
		};
	};
}

export interface PoliticianComparison {
	politician1: PoliticianProfile;
	politician2: PoliticianProfile;
	comparedBills: Array<{
		bill: Bill;
		vote1: VotePosition;
		vote2: VotePosition;
		agreement: boolean;
	}>;
	agreementPercentage: number;
}
