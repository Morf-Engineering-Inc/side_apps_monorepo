/**
 * Types for General Conference Talk data
 */

export interface TalkMetadata {
	id: string;
	conference_url: string;
	talk_url: string;
	year: number;
	month: string; // "04" for April, "10" for October
	title: string;
	speaker: string;
	description?: string;
	session?: string; // e.g., "Saturday Morning Session"
	text?: string; // Full text of the talk
	topics?: string[]; // Extracted topics/themes
	scripture_references?: string[]; // Bible, Book of Mormon, etc.
	word_count?: number;
}

export interface SearchFilters {
	query?: string;
	startYear?: number;
	endYear?: number;
	month?: "04" | "10" | "both";
	speakers?: string[];
	sessions?: string[];
	topics?: string[];
	minWordCount?: number;
	maxWordCount?: number;
}

export interface SearchResult {
	talk: TalkMetadata;
	relevanceScore: number;
	matchedSnippets?: string[];
}

export interface AnalysisResult {
	keyPhrases: Array<{ phrase: string; frequency: number }>;
	topics: Array<{ topic: string; confidence: number }>;
	sentiment?: {
		positive: number;
		neutral: number;
		negative: number;
	};
	scriptureReferences: Array<{ reference: string; count: number }>;
	relatedTalks: TalkMetadata[];
}

export interface ConferenceSession {
	year: number;
	month: string;
	sessions: string[];
}
