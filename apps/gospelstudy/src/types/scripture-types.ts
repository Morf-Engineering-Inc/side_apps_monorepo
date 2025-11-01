/**
 * Types for Scripture Reference Aggregation
 */

export interface ScriptureBook {
	book: string;
	volume:
		| "Old Testament"
		| "New Testament"
		| "Book of Mormon"
		| "Doctrine and Covenants"
		| "Pearl of Great Price";
	talkCount: number;
	talkIds: string[];
	references: string[];
}

export interface ScriptureVolume {
	volume: string;
	books: ScriptureBook[];
	totalTalkCount: number;
}

export interface CitationTrendDataPoint {
	year: string;
	[volumeName: string]: string | number;
}

export interface ScriptureReferenceStats {
	volumes: ScriptureVolume[];
	totalReferences: number;
	mostQuotedBook: ScriptureBook;
	mostQuotedVolume: string;
	mostQuotedPerVolume: {
		volume: string;
		book: ScriptureBook;
	}[];
	citationTrends: CitationTrendDataPoint[];
}
