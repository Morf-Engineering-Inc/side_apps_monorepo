import { ScriptureExplorer } from "@/components/ScriptureExplorer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTalkAnalysis } from "@/hooks/use-talk-analysis";
import {
	MOCK_TALKS,
	getUniqueSessions,
	getUniqueSpeakers,
	getUniqueTopics,
	getYearRange,
} from "@/lib/mock-conference-data";
import type { SearchFilters, TalkMetadata } from "@/types/conference-types";
import {
	Book,
	BookOpen,
	Calendar,
	ChevronRight,
	Filter,
	MessageCircle,
	Search,
	Sparkles,
	TrendingUp,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";

export function GeneralConferenceExplorer() {
	// Search and filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
	const [selectedSession, setSelectedSession] = useState<string>("");
	const [selectedTopic, setSelectedTopic] = useState<string>("");
	const [startYear, setStartYear] = useState<string>("");
	const [endYear, setEndYear] = useState<string>("");
	const [selectedMonth, setSelectedMonth] = useState<"04" | "10" | "both">(
		"both",
	);

	// View state
	const [selectedTalk, setSelectedTalk] = useState<TalkMetadata | null>(null);
	const [viewMode, setViewMode] = useState<
		"search" | "analysis" | "ask" | "scripture"
	>("search");

	// AI Analysis state
	const [askQuestion, setAskQuestion] = useState("");
	const talkAnalysis = useTalkAnalysis();

	// Get filter options
	const speakers = useMemo(() => getUniqueSpeakers(), []);
	const sessions = useMemo(() => getUniqueSessions(), []);
	const topics = useMemo(() => getUniqueTopics(), []);
	const yearRange = useMemo(() => getYearRange(), []);

	// Filter talks based on current filters
	const filteredTalks = useMemo(() => {
		return MOCK_TALKS.filter((talk) => {
			// Search query filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				const matchesTitle = talk.title.toLowerCase().includes(query);
				const matchesSpeaker = talk.speaker.toLowerCase().includes(query);
				const matchesText = talk.text?.toLowerCase().includes(query);
				if (!matchesTitle && !matchesSpeaker && !matchesText) return false;
			}

			// Speaker filter
			if (selectedSpeaker && talk.speaker !== selectedSpeaker) return false;

			// Session filter
			if (selectedSession && talk.session !== selectedSession) return false;

			// Topic filter
			if (selectedTopic) {
				if (!talk.topics?.includes(selectedTopic)) return false;
			}

			// Year range filter
			if (startYear && talk.year < Number.parseInt(startYear)) return false;
			if (endYear && talk.year > Number.parseInt(endYear)) return false;

			// Month filter
			if (selectedMonth !== "both" && talk.month !== selectedMonth)
				return false;

			return true;
		});
	}, [
		searchQuery,
		selectedSpeaker,
		selectedSession,
		selectedTopic,
		startYear,
		endYear,
		selectedMonth,
	]);

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedSpeaker("");
		setSelectedSession("");
		setSelectedTopic("");
		setStartYear("");
		setEndYear("");
		setSelectedMonth("both");
	};

	const handleAnalyzeTalk = (talk: TalkMetadata) => {
		setSelectedTalk(talk);
		if (talk.text) {
			talkAnalysis.mutate({
				talkTitle: talk.title,
				talkText: talk.text,
				speaker: talk.speaker,
			});
		}
	};

	const handleAskQuestion = () => {
		if (!askQuestion.trim()) return;

		// Combine text from filtered talks for context
		const context = filteredTalks
			.slice(0, 5) // Limit to first 5 talks for token limits
			.map((t) => `Title: ${t.title}\nSpeaker: ${t.speaker}\n\n${t.text}`)
			.join("\n\n---\n\n");

		talkAnalysis.mutate({
			question: askQuestion,
			context: context,
		});
		setViewMode("analysis");
	};

	const handleScriptureTalkSelect = (talkId: string) => {
		const talk = MOCK_TALKS.find((t) => t.id === talkId);
		if (talk) {
			setSelectedTalk(talk);
			setViewMode("search");
		}
	};

	const renderSearchView = () => (
		<div className="space-y-4">
			{/* Search Results Count */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">
					{filteredTalks.length} talk{filteredTalks.length !== 1 ? "s" : ""}{" "}
					found
				</h3>
				{(searchQuery ||
					selectedSpeaker ||
					selectedSession ||
					selectedTopic ||
					startYear ||
					endYear ||
					selectedMonth !== "both") && (
					<Button variant="ghost" size="sm" onClick={handleClearFilters}>
						Clear All Filters
					</Button>
				)}
			</div>

			{/* Talk List */}
			<div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
				{filteredTalks.length === 0 ? (
					<Card className="p-8 text-center">
						<Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
						<p className="text-muted-foreground">
							No talks found matching your filters.
						</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={handleClearFilters}
						>
							Clear Filters
						</Button>
					</Card>
				) : (
					filteredTalks.map((talk) => (
						<Card
							key={talk.id}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => setSelectedTalk(talk)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<CardTitle className="text-lg">{talk.title}</CardTitle>
										<CardDescription className="mt-1">
											<div className="flex items-center gap-2 flex-wrap">
												<span className="flex items-center gap-1">
													<User className="w-3 h-3" />
													{talk.speaker}
												</span>
												<span>•</span>
												<span className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{talk.month === "04" ? "April" : "October"}{" "}
													{talk.year}
												</span>
												{talk.session && (
													<>
														<span>•</span>
														<span>{talk.session}</span>
													</>
												)}
											</div>
										</CardDescription>
									</div>
									<ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
								</div>
							</CardHeader>
							<CardContent>
								{talk.topics && talk.topics.length > 0 && (
									<div className="flex flex-wrap gap-1.5 mb-2">
										{talk.topics.map((topic) => (
											<Badge
												key={topic}
												variant="secondary"
												className="text-xs"
											>
												{topic}
											</Badge>
										))}
									</div>
								)}
								{talk.text && (
									<p className="text-sm text-muted-foreground line-clamp-2">
										{talk.text}
									</p>
								)}
								<div className="flex gap-2 mt-3">
									<Button
										size="sm"
										variant="outline"
										onClick={(e) => {
											e.stopPropagation();
											handleAnalyzeTalk(talk);
											setViewMode("analysis");
										}}
									>
										<Sparkles className="w-3 h-3 mr-1" />
										Analyze
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={(e) => {
											e.stopPropagation();
											window.open(talk.talk_url, "_blank");
										}}
									>
										View Original
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);

	const renderAnalysisView = () => {
		if (!talkAnalysis.data && !talkAnalysis.isPending) {
			return (
				<div className="text-center py-12">
					<Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
					<p className="text-muted-foreground">
						Select a talk and click "Analyze" to see AI-powered insights
					</p>
				</div>
			);
		}

		if (talkAnalysis.isPending) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
					<p className="text-muted-foreground">Analyzing talk content...</p>
				</div>
			);
		}

		return (
			<div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
				{selectedTalk && (
					<div>
						<h3 className="text-xl font-bold mb-2">{selectedTalk.title}</h3>
						<p className="text-sm text-muted-foreground mb-4">
							By {selectedTalk.speaker} •{" "}
							{selectedTalk.month === "04" ? "April" : "October"}{" "}
							{selectedTalk.year}
						</p>
					</div>
				)}

				{talkAnalysis.data && (
					<div className="prose prose-sm max-w-none">
						<div className="whitespace-pre-wrap">{talkAnalysis.data}</div>
					</div>
				)}
			</div>
		);
	};

	const renderAskView = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="question">Ask a question about the talks</Label>
				<Textarea
					id="question"
					value={askQuestion}
					onChange={(e) => setAskQuestion(e.target.value)}
					placeholder="e.g., What do these talks teach about faith? How can I apply these principles in my life?"
					className="min-h-24"
				/>
				<p className="text-xs text-muted-foreground">
					Your question will be answered based on the {filteredTalks.length}{" "}
					currently filtered talk{filteredTalks.length !== 1 ? "s" : ""}.
				</p>
			</div>

			<Button
				onClick={handleAskQuestion}
				disabled={!askQuestion.trim() || talkAnalysis.isPending}
				className="w-full"
			>
				<MessageCircle className="w-4 h-4 mr-2" />
				{talkAnalysis.isPending ? "Thinking..." : "Ask AI"}
			</Button>

			{talkAnalysis.isError && (
				<Card className="border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive text-sm">
							Error analyzing content. Please try again.
						</p>
					</CardContent>
				</Card>
			)}

			{talkAnalysis.data && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Answer</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="prose prose-sm max-w-none whitespace-pre-wrap">
							{talkAnalysis.data}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);

	const renderTalkDetail = () => {
		if (!selectedTalk) return null;

		return (
			<Card className="h-full flex flex-col">
				<CardHeader>
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<CardTitle className="text-xl mb-2">
								{selectedTalk.title}
							</CardTitle>
							<CardDescription>
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<User className="w-4 h-4" />
										<span className="font-medium">{selectedTalk.speaker}</span>
										{selectedTalk.description && (
											<>
												<span>•</span>
												<span className="text-xs">
													{selectedTalk.description}
												</span>
											</>
										)}
									</div>
									<div className="flex items-center gap-2 text-sm">
										<Calendar className="w-4 h-4" />
										<span>
											{selectedTalk.month === "04" ? "April" : "October"}{" "}
											{selectedTalk.year} General Conference
										</span>
									</div>
									{selectedTalk.session && (
										<div className="text-sm">{selectedTalk.session}</div>
									)}
								</div>
							</CardDescription>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedTalk(null)}
						>
							Close
						</Button>
					</div>
				</CardHeader>
				<Separator />
				<CardContent className="flex-1 overflow-y-auto pt-6">
					{selectedTalk.topics && selectedTalk.topics.length > 0 && (
						<div className="mb-4">
							<h4 className="text-sm font-semibold mb-2">Topics</h4>
							<div className="flex flex-wrap gap-2">
								{selectedTalk.topics.map((topic) => (
									<Badge key={topic} variant="secondary">
										{topic}
									</Badge>
								))}
							</div>
						</div>
					)}

					{selectedTalk.scripture_references &&
						selectedTalk.scripture_references.length > 0 && (
							<div className="mb-4">
								<h4 className="text-sm font-semibold mb-2">
									Scripture References
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedTalk.scripture_references.map((ref) => (
										<Badge key={ref} variant="outline">
											{ref}
										</Badge>
									))}
								</div>
							</div>
						)}

					<Separator className="my-4" />

					{selectedTalk.text && (
						<div className="prose prose-sm max-w-none">
							<div className="whitespace-pre-wrap leading-relaxed">
								{selectedTalk.text}
							</div>
						</div>
					)}

					<Separator className="my-4" />

					<div className="flex gap-2">
						<Button
							variant="default"
							size="sm"
							onClick={() => {
								handleAnalyzeTalk(selectedTalk);
								setViewMode("analysis");
							}}
						>
							<Sparkles className="w-4 h-4 mr-2" />
							Analyze with AI
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => window.open(selectedTalk.talk_url, "_blank")}
						>
							View Original
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="container mx-auto px-4 py-6 max-w-7xl">
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
					<BookOpen className="w-10 h-10" />
					General Conference Talk Explorer
				</h1>
				<p className="text-xl text-muted-foreground">
					Search, analyze, and study LDS General Conference talks with
					AI-powered insights
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Filters Sidebar */}
				<div className="lg:col-span-1 space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Filter className="w-4 h-4" />
								Search & Filters
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Search */}
							<div className="space-y-2">
								<Label htmlFor="search">Search</Label>
								<div className="relative">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										id="search"
										placeholder="Search talks..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8"
									/>
								</div>
							</div>

							<Separator />

							{/* Year Range */}
							<div className="space-y-2">
								<Label>Year Range</Label>
								<div className="grid grid-cols-2 gap-2">
									<div>
										<Input
											type="number"
											placeholder={`From ${yearRange.min}`}
											value={startYear}
											onChange={(e) => setStartYear(e.target.value)}
											min={yearRange.min}
											max={yearRange.max}
										/>
									</div>
									<div>
										<Input
											type="number"
											placeholder={`To ${yearRange.max}`}
											value={endYear}
											onChange={(e) => setEndYear(e.target.value)}
											min={yearRange.min}
											max={yearRange.max}
										/>
									</div>
								</div>
							</div>

							{/* Month Filter */}
							<div className="space-y-2">
								<Label>Conference</Label>
								<Select
									value={selectedMonth}
									onValueChange={(value) =>
										setSelectedMonth(value as "04" | "10" | "both")
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="both">Both (April & October)</SelectItem>
										<SelectItem value="04">April Only</SelectItem>
										<SelectItem value="10">October Only</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Speaker Filter */}
							<div className="space-y-2">
								<Label htmlFor="speaker">Speaker</Label>
								<Select
									value={selectedSpeaker}
									onValueChange={setSelectedSpeaker}
								>
									<SelectTrigger id="speaker">
										<SelectValue placeholder="All speakers" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">All speakers</SelectItem>
										{speakers.map((speaker) => (
											<SelectItem key={speaker} value={speaker}>
												{speaker}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Session Filter */}
							<div className="space-y-2">
								<Label htmlFor="session">Session</Label>
								<Select
									value={selectedSession}
									onValueChange={setSelectedSession}
								>
									<SelectTrigger id="session">
										<SelectValue placeholder="All sessions" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">All sessions</SelectItem>
										{sessions.map((session) => (
											<SelectItem key={session} value={session}>
												{session}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Topic Filter */}
							<div className="space-y-2">
								<Label htmlFor="topic">Topic</Label>
								<Select value={selectedTopic} onValueChange={setSelectedTopic}>
									<SelectTrigger id="topic">
										<SelectValue placeholder="All topics" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">All topics</SelectItem>
										{topics.map((topic) => (
											<SelectItem key={topic} value={topic}>
												{topic}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Stats Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<TrendingUp className="w-4 h-4" />
								Collection Stats
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Total Talks:</span>
								<span className="font-semibold">{MOCK_TALKS.length}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Filtered:</span>
								<span className="font-semibold">{filteredTalks.length}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Year Range:</span>
								<span className="font-semibold">
									{yearRange.min}-{yearRange.max}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Speakers:</span>
								<span className="font-semibold">{speakers.length}</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Area */}
				<div className="lg:col-span-3">
					<Tabs
						value={viewMode}
						onValueChange={(v) => setViewMode(v as typeof viewMode)}
					>
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="search" className="flex items-center gap-2">
								<Search className="w-4 h-4" />
								Search Results
							</TabsTrigger>
							<TabsTrigger
								value="scripture"
								className="flex items-center gap-2"
							>
								<Book className="w-4 h-4" />
								Scriptures
							</TabsTrigger>
							<TabsTrigger value="analysis" className="flex items-center gap-2">
								<Sparkles className="w-4 h-4" />
								AI Analysis
							</TabsTrigger>
							<TabsTrigger value="ask" className="flex items-center gap-2">
								<MessageCircle className="w-4 h-4" />
								Ask Content
							</TabsTrigger>
						</TabsList>

						<div className="mt-4">
							<TabsContent value="search" className="mt-0">
								<Card>
									<CardContent className="pt-6">
										{renderSearchView()}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="scripture" className="mt-0">
								<Card>
									<CardContent className="pt-6">
										<ScriptureExplorer
											talks={filteredTalks}
											onTalkSelect={handleScriptureTalkSelect}
										/>
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="analysis" className="mt-0">
								<Card>
									<CardContent className="pt-6">
										{renderAnalysisView()}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="ask" className="mt-0">
								<Card>
									<CardContent className="pt-6">{renderAskView()}</CardContent>
								</Card>
							</TabsContent>
						</div>
					</Tabs>

					{/* Talk Detail View */}
					{selectedTalk && viewMode === "search" && (
						<div className="mt-4">{renderTalkDetail()}</div>
					)}
				</div>
			</div>
		</div>
	);
}
