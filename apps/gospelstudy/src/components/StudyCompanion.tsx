import { Quiz, type QuizQuestion, type QuizResult } from "@/components/Quiz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	type ContentAnalysisOutput,
	type FlashcardOutput,
	type MCQOutput,
	type StudyGuideOutput,
	useContentAnalysisMutation,
	useFlashcardMutation,
	useMCQMutation,
	useStudyGuideMutation,
} from "@/hooks/use-openai-gpt-chat";
import { BookOpen, Brain, HelpCircle, Zap } from "lucide-react";
import { useState } from "react";

type OutputMode = "study-guide" | "mcq" | "flashcards" | "analysis";

export function StudyCompanion() {
	const [notes, setNotes] = useState(`Frog Facts

Classification: Frogs are amphibians in the order Anura. This means they are vertebrates that live part of their lives in water and part on land.

Characteristics: They have permeable skin for breathing, powerful hind legs for jumping, and large eyes. Most adult frogs lack tails.

Life Cycle (Metamorphosis): Frogs undergo a complete transformation:

Egg: Laid in water.

Tadpole: Hatches from the egg; lives in water, breathes with gills, and has a tail.

Froglet: Grows legs and lungs, and its tail shortens.

Adult: Lives on land or in water, breathes with lungs and through its skin.

Diet: Tadpoles are mostly herbivores (eating algae), while adult frogs are carnivores, eating insects, spiders, and other small animals.

Behaviors: Male frogs use calls to attract mates. Many species use camouflage to hide, while some brightly colored frogs are poisonous. In cold climates, they hibernate.

Conservation: Frog populations are declining worldwide due to habitat loss, pollution, disease, and climate change. They are considered important indicator species because their health reflects the health of their ecosystem.`);
	const [outputMode, setOutputMode] = useState<OutputMode>("study-guide");
	const [mcqCount, setMcqCount] = useState(5);
	const [flashcardCount, setFlashcardCount] = useState(10);
	const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
		"medium",
	);
	const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
	const [quizResults, setQuizResults] = useState<QuizResult[] | null>(null);
	const [isQuizCompleted, setIsQuizCompleted] = useState(false);

	const contentAnalysis = useContentAnalysisMutation();
	const studyGuide = useStudyGuideMutation();
	const mcqGenerator = useMCQMutation();
	const flashcardGenerator = useFlashcardMutation();

	const handleGenerate = () => {
		if (!notes.trim()) return;

		switch (outputMode) {
			case "analysis":
				contentAnalysis.mutate({ notes, analysisType: "all" });
				break;
			case "study-guide":
				studyGuide.mutate({
					notes,
					level:
						difficulty === "easy"
							? "beginner"
							: difficulty === "hard"
								? "advanced"
								: "intermediate",
					format: "detailed",
				});
				break;
			case "mcq":
				mcqGenerator.mutate({ notes, questionCount: mcqCount, difficulty });
				setQuizResults(null);
				setIsQuizCompleted(false);
				break;
			case "flashcards":
				flashcardGenerator.mutate({
					notes,
					cardCount: flashcardCount,
					cardType: "mixed",
				});
				setFlippedCards(new Set());
				break;
		}
	};

	const handleRegenarate = () => {
		handleGenerate();
	};

	const toggleFlashcard = (index: number) => {
		const newFlipped = new Set(flippedCards);
		if (newFlipped.has(index)) {
			newFlipped.delete(index);
		} else {
			newFlipped.add(index);
		}
		setFlippedCards(newFlipped);
	};

	const isLoading =
		contentAnalysis.isPending ||
		studyGuide.isPending ||
		mcqGenerator.isPending ||
		flashcardGenerator.isPending;

	const hasError =
		contentAnalysis.isError ||
		studyGuide.isError ||
		mcqGenerator.isError ||
		flashcardGenerator.isError;

	const getCurrentResult = () => {
		switch (outputMode) {
			case "analysis":
				return contentAnalysis.data;
			case "study-guide":
				return studyGuide.data;
			case "mcq":
				return mcqGenerator.data;
			case "flashcards":
				return flashcardGenerator.data;
			default:
				return null;
		}
	};

	const renderAnalysisResult = (data: ContentAnalysisOutput) => (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-3">Key Concepts</h3>
				<div className="flex flex-wrap gap-2">
					{data.concepts.map((concept, index) => (
						<Badge key={`concept-${index}-${concept}`} variant="secondary">
							{concept}
						</Badge>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-3">Important Terms</h3>
				<div className="flex flex-wrap gap-2">
					{data.terms.map((term, index) => (
						<Badge key={`term-${index}-${term}`} variant="outline">
							{term}
						</Badge>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-3">Definitions</h3>
				<div className="space-y-3">
					{data.definitions.map((def, index) => (
						<div
							key={`def-${index}-${def.term}`}
							className="p-3 border rounded-md"
						>
							<strong className="text-primary">{def.term}:</strong>{" "}
							{def.definition}
						</div>
					))}
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-3">Key Points</h3>
				<ul className="space-y-2">
					{data.keyPoints.map((point, index) => (
						<li
							key={`point-${index}-${point.slice(0, 20)}`}
							className="flex items-start gap-2"
						>
							<span className="text-primary">•</span>
							<span>{point}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);

	const renderStudyGuideResult = (data: StudyGuideOutput) => (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-primary">{data.title}</h2>

			{data.sections.map((section, index) => (
				<div key={`section-${index}-${section.heading}`} className="space-y-4">
					<h3 className="text-xl font-semibold border-b pb-2">
						{section.heading}
					</h3>
					<p className="text-muted-foreground leading-relaxed">
						{section.content}
					</p>

					{section.subsections?.map((subsection, subIndex) => (
						<div
							key={`subsection-${index}-${subIndex}-${subsection.subheading}`}
							className="ml-4 space-y-2"
						>
							<h4 className="text-lg font-medium text-primary">
								{subsection.subheading}
							</h4>
							<p className="text-muted-foreground">{subsection.content}</p>
						</div>
					))}
				</div>
			))}

			<div className="mt-8 p-4 bg-accent/50 rounded-lg">
				<h3 className="text-lg font-semibold mb-2">Summary</h3>
				<p className="text-muted-foreground">{data.summary}</p>
			</div>
		</div>
	);

	const renderQuizResults = (results: QuizResult[]) => {
		const totalQuestions = results.length;
		const correctAnswers = results.filter((r) => r.isCorrect).length;
		const score = Math.round((correctAnswers / totalQuestions) * 100);

		return (
			<div className="space-y-6">
				<div className="text-center space-y-4">
					<h3 className="text-2xl font-bold text-primary">Quiz Complete! 🎉</h3>
					<div className="flex justify-center items-center gap-8">
						<div className="text-center">
							<div className="text-3xl font-bold text-primary">{score}%</div>
							<p className="text-sm text-muted-foreground">Score</p>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-green-600">
								{correctAnswers}
							</div>
							<p className="text-sm text-muted-foreground">Correct</p>
						</div>
						<div className="text-center">
							<div className="text-3xl font-bold text-red-600">
								{totalQuestions - correctAnswers}
							</div>
							<p className="text-sm text-muted-foreground">Incorrect</p>
						</div>
					</div>
					<Badge
						variant={
							score >= 80
								? "default"
								: score >= 60
									? "secondary"
									: "destructive"
						}
						className="px-4 py-2"
					>
						{score >= 80
							? "Excellent!"
							: score >= 60
								? "Good Job!"
								: "Keep Studying!"}
					</Badge>
				</div>

				<div className="space-y-3">
					<h4 className="text-lg font-semibold">Question Breakdown:</h4>
					{results.map((result, index) => (
						<div
							key={`result-${result.questionIndex}-${result.selectedAnswer}-${result.correctAnswer}`}
							className={`p-4 rounded-lg border ${
								result.isCorrect
									? "bg-green-50 border-green-200"
									: "bg-red-50 border-red-200"
							}`}
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<span
											className={`font-semibold ${result.isCorrect ? "text-green-700" : "text-red-700"}`}
										>
											Question {index + 1}
										</span>
										<Badge
											variant={result.isCorrect ? "default" : "destructive"}
											className="text-xs"
										>
											{result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
										</Badge>
									</div>
								</div>
								{result.timeSpent && (
									<span className="text-xs text-muted-foreground">
										{Math.round(result.timeSpent / 1000)}s
									</span>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="flex gap-2 pt-4">
					<Button
						onClick={() => {
							setIsQuizCompleted(false);
							setQuizResults(null);
						}}
						variant="outline"
						className="flex-1"
					>
						Retake Quiz
					</Button>
					<Button onClick={() => handleRegenarate()} className="flex-1">
						Generate New Quiz
					</Button>
				</div>
			</div>
		);
	};

	const renderMCQResult = (data: MCQOutput) => {
		// Show results if quiz is completed, otherwise show the quiz
		if (isQuizCompleted && quizResults) {
			return renderQuizResults(quizResults);
		}

		// Convert MCQOutput to QuizQuestion format (they're already compatible)
		const quizQuestions: QuizQuestion[] = data.questions.map((q) => ({
			question: q.question,
			options: q.options,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation,
			difficulty: q.difficulty,
		}));

		return (
			<Quiz
				questions={quizQuestions}
				onComplete={(results) => {
					setQuizResults(results);
					setIsQuizCompleted(true);
				}}
			/>
		);
	};

	const renderFlashcardResult = (data: FlashcardOutput) => (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-primary mb-4">Study Flashcards</h2>
			<p className="text-muted-foreground mb-4">
				Click on any card to reveal the answer
			</p>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{data.cards.map((card, index) => (
					<Card
						key={`card-${index}-${card.front.slice(0, 20)}`}
						className="cursor-pointer transition-all min-h-32"
						onClick={() => toggleFlashcard(index)}
					>
						<CardContent className="p-6 flex flex-col justify-center min-h-32">
							<div className="flex items-center justify-between mb-2">
								<Badge variant="outline" className="text-xs">
									{card.category || "General"}
								</Badge>
								{card.difficulty && (
									<Badge
										variant={
											card.difficulty === "easy"
												? "secondary"
												: card.difficulty === "hard"
													? "destructive"
													: "default"
										}
										className="text-xs"
									>
										{card.difficulty}
									</Badge>
								)}
							</div>

							<div className="text-center">
								{flippedCards.has(index) ? (
									<div>
										<p className="text-sm text-muted-foreground mb-2">
											Answer:
										</p>
										<p className="font-medium">{card.back}</p>
									</div>
								) : (
									<div>
										<p className="text-sm text-muted-foreground mb-2">
											Question:
										</p>
										<p className="font-medium">{card.front}</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);

	const currentResult = getCurrentResult();

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen flex flex-col">
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-primary mb-2">
					📚 AI Study Companion
				</h1>
				<p className="text-xl text-muted-foreground">
					Transform your notes into interactive study materials
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
				{/* Input Section */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Your Notes</CardTitle>
							<CardDescription>
								Paste your course notes, lecture content, or study material here
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Enter your study notes here..."
								className="min-h-48 resize-none"
							/>
						</CardContent>
					</Card>

					{/* Output Mode Selection */}
					<Card>
						<CardHeader>
							<CardTitle>Study Mode</CardTitle>
							<CardDescription>Choose how you want to study</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs
								value={outputMode}
								onValueChange={(value) => setOutputMode(value as OutputMode)}
							>
								<TabsList className="grid w-full grid-cols-2 gap-1">
									<TabsTrigger
										value="study-guide"
										className="flex items-center gap-2"
									>
										<BookOpen className="w-4 h-4" />
										Study Guide
									</TabsTrigger>
									<TabsTrigger value="mcq" className="flex items-center gap-2">
										<HelpCircle className="w-4 h-4" />
										Quiz
									</TabsTrigger>
								</TabsList>
								<TabsList className="grid w-full grid-cols-2 gap-1 mt-2">
									<TabsTrigger
										value="flashcards"
										className="flex items-center gap-2"
									>
										<Zap className="w-4 h-4" />
										Flashcards
									</TabsTrigger>
									<TabsTrigger
										value="analysis"
										className="flex items-center gap-2"
									>
										<Brain className="w-4 h-4" />
										Analysis
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</CardContent>
					</Card>

					{/* Customization Options */}
					{(outputMode === "mcq" ||
						outputMode === "flashcards" ||
						outputMode === "study-guide") && (
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
								<CardDescription>
									Customize your study materials
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{outputMode === "mcq" && (
									<div>
										<label
											htmlFor="mcq-count"
											className="block text-sm font-medium mb-2"
										>
											Number of Questions: {mcqCount}
										</label>
										<input
											id="mcq-count"
											type="range"
											min="5"
											max="20"
											value={mcqCount}
											onChange={(e) => setMcqCount(Number(e.target.value))}
											className="w-full"
										/>
									</div>
								)}

								{outputMode === "flashcards" && (
									<div>
										<label
											htmlFor="flashcard-count"
											className="block text-sm font-medium mb-2"
										>
											Number of Cards: {flashcardCount}
										</label>
										<input
											id="flashcard-count"
											type="range"
											min="5"
											max="30"
											value={flashcardCount}
											onChange={(e) =>
												setFlashcardCount(Number(e.target.value))
											}
											className="w-full"
										/>
									</div>
								)}

								{(outputMode === "mcq" || outputMode === "study-guide") && (
									<div>
										<div className="block text-sm font-medium mb-2">
											Difficulty Level
										</div>
										<Tabs
											value={difficulty}
											onValueChange={(value) =>
												setDifficulty(value as typeof difficulty)
											}
										>
											<TabsList className="grid w-full grid-cols-3">
												<TabsTrigger value="easy">Easy</TabsTrigger>
												<TabsTrigger value="medium">Medium</TabsTrigger>
												<TabsTrigger value="hard">Hard</TabsTrigger>
											</TabsList>
										</Tabs>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Action Buttons */}
					<div className="space-y-2">
						<Button
							onClick={handleGenerate}
							disabled={!notes.trim() || isLoading}
							className="w-full"
							size="lg"
						>
							{isLoading ? "Generating..." : "Generate Study Material"}
						</Button>

						{currentResult && (
							<Button
								onClick={handleRegenarate}
								disabled={isLoading}
								variant="outline"
								className="w-full"
							>
								Regenerate
							</Button>
						)}
					</div>

					{hasError && (
						<Card className="border-destructive">
							<CardContent className="pt-6">
								<p className="text-destructive text-sm">
									Error generating content. Please check your input and try
									again.
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Output Section */}
				<div className="lg:col-span-3 flex flex-col">
					<Card className="flex-1 flex flex-col">
						<CardHeader className="flex-shrink-0">
							<CardTitle>
								{outputMode === "analysis" && "Content Analysis"}
								{outputMode === "study-guide" && "Study Guide"}
								{outputMode === "mcq" && "Practice Quiz"}
								{outputMode === "flashcards" && "Study Flashcards"}
							</CardTitle>
							<CardDescription>
								{!currentResult &&
									!isLoading &&
									"Generate content to see results here"}
								{isLoading && "Generating your study materials..."}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1 flex flex-col overflow-hidden">
							{isLoading && (
								<div className="flex items-center justify-center py-12">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
								</div>
							)}

							{currentResult && !isLoading && (
								<div className="flex-1 overflow-y-auto">
									{outputMode === "analysis" &&
										renderAnalysisResult(
											currentResult as ContentAnalysisOutput,
										)}
									{outputMode === "study-guide" &&
										renderStudyGuideResult(currentResult as StudyGuideOutput)}
									{outputMode === "mcq" &&
										renderMCQResult(currentResult as MCQOutput)}
									{outputMode === "flashcards" &&
										renderFlashcardResult(currentResult as FlashcardOutput)}
								</div>
							)}

							{!currentResult && !isLoading && (
								<div className="text-center py-12">
									<div className="text-muted-foreground">
										<Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p>
											Enter your notes and select a study mode to get started
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
