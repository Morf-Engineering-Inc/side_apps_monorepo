import type { TalkMetadata } from "@/types/conference-types";
import type {
	ScriptureBook,
	ScriptureReferenceStats,
	ScriptureVolume,
} from "@/types/scripture-types";

/**
 * Parse scripture reference to extract book name and volume
 */
export function parseScriptureReference(ref: string): {
	book: string;
	volume:
		| "Old Testament"
		| "New Testament"
		| "Book of Mormon"
		| "Doctrine and Covenants"
		| "Pearl of Great Price";
} | null {
	// Clean up reference
	const cleaned = ref.trim();

	// Old Testament books
	const oldTestamentBooks = [
		"Genesis",
		"Exodus",
		"Leviticus",
		"Numbers",
		"Deuteronomy",
		"Joshua",
		"Judges",
		"Ruth",
		"1 Samuel",
		"2 Samuel",
		"1 Kings",
		"2 Kings",
		"1 Chronicles",
		"2 Chronicles",
		"Ezra",
		"Nehemiah",
		"Esther",
		"Job",
		"Psalm",
		"Psalms",
		"Proverbs",
		"Ecclesiastes",
		"Song of Solomon",
		"Isaiah",
		"Jeremiah",
		"Lamentations",
		"Ezekiel",
		"Daniel",
		"Hosea",
		"Joel",
		"Amos",
		"Obadiah",
		"Jonah",
		"Micah",
		"Nahum",
		"Habakkuk",
		"Zephaniah",
		"Haggai",
		"Zechariah",
		"Malachi",
	];

	// New Testament books
	const newTestamentBooks = [
		"Matthew",
		"Mark",
		"Luke",
		"John",
		"Acts",
		"Romans",
		"1 Corinthians",
		"2 Corinthians",
		"Galatians",
		"Ephesians",
		"Philippians",
		"Colossians",
		"1 Thessalonians",
		"2 Thessalonians",
		"1 Timothy",
		"2 Timothy",
		"Titus",
		"Philemon",
		"Hebrews",
		"James",
		"1 Peter",
		"2 Peter",
		"1 John",
		"2 John",
		"3 John",
		"Jude",
		"Revelation",
	];

	// Book of Mormon books
	const bookOfMormonBooks = [
		"1 Nephi",
		"2 Nephi",
		"Jacob",
		"Enos",
		"Jarom",
		"Omni",
		"Words of Mormon",
		"Mosiah",
		"Alma",
		"Helaman",
		"3 Nephi",
		"4 Nephi",
		"Mormon",
		"Ether",
		"Moroni",
	];

	// Pearl of Great Price books
	const pearlOfGreatPriceBooks = [
		"Moses",
		"Abraham",
		"Joseph Smith—Matthew",
		"Joseph Smith—History",
		"Articles of Faith",
	];

	// Check which book it matches
	for (const book of oldTestamentBooks) {
		if (cleaned.startsWith(book)) {
			return {
				book: book === "Psalms" ? "Psalm" : book,
				volume: "Old Testament",
			};
		}
	}

	for (const book of newTestamentBooks) {
		if (cleaned.startsWith(book)) {
			return { book, volume: "New Testament" };
		}
	}

	for (const book of bookOfMormonBooks) {
		if (cleaned.startsWith(book)) {
			return { book, volume: "Book of Mormon" };
		}
	}

	// Check for D&C (various formats)
	if (
		cleaned.startsWith("D&C") ||
		cleaned.startsWith("D & C") ||
		cleaned.startsWith("Doctrine and Covenants")
	) {
		return { book: "Doctrine and Covenants", volume: "Doctrine and Covenants" };
	}

	for (const book of pearlOfGreatPriceBooks) {
		if (cleaned.startsWith(book)) {
			return { book, volume: "Pearl of Great Price" };
		}
	}

	return null;
}

/**
 * Aggregate scripture references from talks
 */
export function aggregateScriptureReferences(
	talks: TalkMetadata[],
): ScriptureReferenceStats {
	const bookMap = new Map<
		string,
		{
			book: string;
			volume:
				| "Old Testament"
				| "New Testament"
				| "Book of Mormon"
				| "Doctrine and Covenants"
				| "Pearl of Great Price";
			talkIds: Set<string>;
			references: string[];
		}
	>();

	// Track volume citations by year for time series
	const volumeByYearMap = new Map<string, Map<string, Set<string>>>();

	// Process all talks
	for (const talk of talks) {
		if (!talk.scripture_references) continue;

		for (const ref of talk.scripture_references) {
			const parsed = parseScriptureReference(ref);
			if (!parsed) continue;

			const key = `${parsed.volume}:${parsed.book}`;
			if (!bookMap.has(key)) {
				bookMap.set(key, {
					book: parsed.book,
					volume: parsed.volume,
					talkIds: new Set(),
					references: [],
				});
			}

			const bookData = bookMap.get(key);
			if (bookData) {
				bookData.talkIds.add(talk.id);
				bookData.references.push(ref);
			}

			// Track volume citations by year
			if (!volumeByYearMap.has(parsed.volume)) {
				volumeByYearMap.set(parsed.volume, new Map());
			}
			const yearMap = volumeByYearMap.get(parsed.volume);
			if (yearMap) {
				const yearStr = String(talk.year);
				if (!yearMap.has(yearStr)) {
					yearMap.set(yearStr, new Set());
				}
				yearMap.get(yearStr)?.add(talk.id);
			}
		}
	}

	// Convert to volumes structure
	const volumeMap = new Map<string, ScriptureVolume>();

	for (const [, bookData] of bookMap) {
		if (!volumeMap.has(bookData.volume)) {
			volumeMap.set(bookData.volume, {
				volume: bookData.volume,
				books: [],
				totalTalkCount: 0,
			});
		}

		const volume = volumeMap.get(bookData.volume);
		if (volume) {
			const book: ScriptureBook = {
				book: bookData.book,
				volume: bookData.volume,
				talkCount: bookData.talkIds.size,
				talkIds: Array.from(bookData.talkIds),
				references: bookData.references,
			};

			volume.books.push(book);
			volume.totalTalkCount += book.talkCount;
		}
	}

	// Sort books within each volume by talk count
	for (const volume of volumeMap.values()) {
		volume.books.sort((a, b) => b.talkCount - a.talkCount);
	}

	const volumes = Array.from(volumeMap.values());

	// Find most quoted book and volume
	let mostQuotedBook: ScriptureBook | null = null;
	let maxCount = 0;

	for (const volume of volumes) {
		for (const book of volume.books) {
			if (book.talkCount > maxCount) {
				maxCount = book.talkCount;
				mostQuotedBook = book;
			}
		}
	}

	const mostQuotedVolume =
		volumes.length > 0
			? volumes.reduce((max, vol) =>
					vol.totalTalkCount > max.totalTalkCount ? vol : max,
				).volume
			: "";

	const totalReferences = Array.from(bookMap.values()).reduce(
		(sum, book) => sum + book.references.length,
		0,
	);

	// Calculate most quoted book per volume
	const mostQuotedPerVolume = volumes.map((volume) => {
		const topBook = volume.books.reduce((max, book) =>
			book.talkCount > max.talkCount ? book : max,
		);
		return {
			volume: volume.volume,
			book: topBook,
		};
	});

	// Build time series data for chart
	const allYears = new Set<string>();
	for (const yearMap of volumeByYearMap.values()) {
		for (const year of yearMap.keys()) {
			allYears.add(year);
		}
	}
	const sortedYears = Array.from(allYears).sort();

	const citationTrends = sortedYears.map((year) => {
		const dataPoint: { year: string; [key: string]: string | number } = {
			year,
		};

		for (const volume of volumeByYearMap.keys()) {
			const yearMap = volumeByYearMap.get(volume);
			const talkCount = yearMap?.get(year)?.size || 0;
			dataPoint[volume] = talkCount;
		}

		return dataPoint;
	});

	return {
		volumes,
		totalReferences,
		mostQuotedBook: mostQuotedBook || {
			book: "",
			volume: "Old Testament",
			talkCount: 0,
			talkIds: [],
			references: [],
		},
		mostQuotedVolume,
		mostQuotedPerVolume,
		citationTrends,
	};
}
