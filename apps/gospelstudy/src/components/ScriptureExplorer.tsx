import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { aggregateScriptureReferences } from "@/lib/scripture-utils";
import type { TalkMetadata } from "@/types/conference-types";
import type { ScriptureBook, ScriptureVolume } from "@/types/scripture-types";
import { Book, BookOpen, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface ScriptureExplorerProps {
	talks: TalkMetadata[];
	onTalkSelect?: (talkId: string) => void;
}

export function ScriptureExplorer({
	talks,
	onTalkSelect,
}: ScriptureExplorerProps) {
	const [selectedBook, setSelectedBook] = useState<ScriptureBook | null>(null);
	const [selectedVolume, setSelectedVolume] = useState<string | null>(null);

	// Aggregate scripture references from talks
	const stats = useMemo(() => aggregateScriptureReferences(talks), [talks]);

	const handleBookClick = (book: ScriptureBook) => {
		setSelectedBook(book);
		setSelectedVolume(null);
	};

	const handleVolumeClick = (volume: ScriptureVolume) => {
		setSelectedVolume(volume.volume);
		setSelectedBook(null);
	};

	const handleBack = () => {
		if (selectedBook) {
			setSelectedBook(null);
		} else if (selectedVolume) {
			setSelectedVolume(null);
		}
	};

	// Get talks for selected book
	const selectedTalks = useMemo(() => {
		if (!selectedBook) return [];
		return talks.filter((talk) => selectedBook.talkIds.includes(talk.id));
	}, [selectedBook, talks]);

	// Render volume overview
	const renderVolumeOverview = () => (
		<div className="space-y-4">
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold mb-2">
					Scripture References by Volume
				</h2>
				<p className="text-muted-foreground">
					Explore which scriptures are quoted most frequently in General
					Conference talks
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
							<div className="text-3xl font-bold">{stats.totalReferences}</div>
							<p className="text-sm text-muted-foreground">
								Total Scripture References
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<Book className="w-8 h-8 mx-auto mb-2 text-primary" />
							<div className="text-3xl font-bold">
								{stats.mostQuotedBook.book || "N/A"}
							</div>
							<p className="text-sm text-muted-foreground">
								Most Quoted Book ({stats.mostQuotedBook.talkCount} talks)
							</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="text-center">
							<BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
							<div className="text-3xl font-bold">{stats.mostQuotedVolume}</div>
							<p className="text-sm text-muted-foreground">
								Most Quoted Volume
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Citation Trends Chart */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Scripture Citations Over Time</CardTitle>
					<CardDescription>
						Number of talks citing each scripture volume by year
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={400}>
						<LineChart
							data={stats.citationTrends}
							margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="year" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line
								type="monotone"
								dataKey="Old Testament"
								stroke="#8884d8"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="New Testament"
								stroke="#82ca9d"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="Book of Mormon"
								stroke="#ffc658"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="Doctrine and Covenants"
								stroke="#ff7c7c"
								strokeWidth={2}
								dot={false}
							/>
							<Line
								type="monotone"
								dataKey="Pearl of Great Price"
								stroke="#a78bfa"
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Separator />

			{/* Volume Cards */}
			<div className="space-y-3">
				{stats.volumes.length === 0 ? (
					<Card className="p-8 text-center">
						<BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
						<p className="text-muted-foreground">
							No scripture references found in the selected talks.
						</p>
					</Card>
				) : (
					stats.volumes.map((volume) => (
						<Card
							key={volume.volume}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => handleVolumeClick(volume)}
						>
							<CardHeader>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<CardTitle className="text-xl flex items-center gap-2">
											<BookOpen className="w-5 h-5" />
											{volume.volume}
										</CardTitle>
										<CardDescription className="mt-1">
											{volume.books.length} book
											{volume.books.length !== 1 ? "s" : ""} •{" "}
											{volume.totalTalkCount} talk
											{volume.totalTalkCount !== 1 ? "s" : ""}
										</CardDescription>
									</div>
									<Badge variant="secondary" className="text-lg px-3 py-1">
										{volume.totalTalkCount}
									</Badge>
								</div>
							</CardHeader>
						</Card>
					))
				)}
			</div>
		</div>
	);

	// Render books in selected volume
	const renderVolumeBooks = () => {
		const volume = stats.volumes.find((v) => v.volume === selectedVolume);
		if (!volume) return null;

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2 mb-4">
					<Button variant="ghost" size="sm" onClick={handleBack}>
						← Back
					</Button>
					<h2 className="text-2xl font-bold">{volume.volume}</h2>
				</div>

				<p className="text-muted-foreground mb-6">
					Select a book to see which talks quote from it
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{volume.books.map((book) => (
						<Card
							key={book.book}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => handleBookClick(book)}
						>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between mb-2">
									<h3 className="font-semibold text-lg">{book.book}</h3>
									<Badge variant="secondary">{book.talkCount}</Badge>
								</div>
								<p className="text-sm text-muted-foreground">
									{book.talkCount} talk{book.talkCount !== 1 ? "s" : ""}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									{book.references.length} reference
									{book.references.length !== 1 ? "s" : ""}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	};

	// Render talks that reference selected book
	const renderBookTalks = () => {
		if (!selectedBook) return null;

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2 mb-4">
					<Button variant="ghost" size="sm" onClick={handleBack}>
						← Back
					</Button>
					<h2 className="text-2xl font-bold">{selectedBook.book}</h2>
				</div>

				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
							<div>
								<div className="text-2xl font-bold">
									{selectedBook.talkCount}
								</div>
								<p className="text-sm text-muted-foreground">
									Talk{selectedBook.talkCount !== 1 ? "s" : ""}
								</p>
							</div>
							<div>
								<div className="text-2xl font-bold">
									{selectedBook.references.length}
								</div>
								<p className="text-sm text-muted-foreground">
									Reference{selectedBook.references.length !== 1 ? "s" : ""}
								</p>
							</div>
							<div className="col-span-2 md:col-span-1">
								<div className="text-2xl font-bold">{selectedBook.volume}</div>
								<p className="text-sm text-muted-foreground">Volume</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<h3 className="text-lg font-semibold mb-3">
					Talks Quoting {selectedBook.book}
				</h3>

				<div className="space-y-3">
					{selectedTalks.map((talk) => {
						// Get references from this book in this talk
						const talkRefs =
							talk.scripture_references?.filter((ref) =>
								ref.startsWith(selectedBook.book),
							) || [];

						return (
							<Card
								key={talk.id}
								className="hover:shadow-md transition-shadow cursor-pointer"
								onClick={() => onTalkSelect?.(talk.id)}
							>
								<CardHeader>
									<CardTitle className="text-lg">{talk.title}</CardTitle>
									<CardDescription>
										{talk.speaker} • {talk.month === "04" ? "April" : "October"}{" "}
										{talk.year}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p className="text-sm font-semibold">
											References in this talk:
										</p>
										<div className="flex flex-wrap gap-1.5">
											{talkRefs.map((ref) => (
												<Badge key={ref} variant="outline" className="text-xs">
													{ref}
												</Badge>
											))}
										</div>
									</div>
									<Button
										size="sm"
										variant="outline"
										className="mt-3"
										onClick={(e) => {
											e.stopPropagation();
											window.open(talk.talk_url, "_blank");
										}}
									>
										View Talk
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-4">
			{!selectedVolume && !selectedBook && renderVolumeOverview()}
			{selectedVolume && !selectedBook && renderVolumeBooks()}
			{selectedBook && renderBookTalks()}
		</div>
	);
}
