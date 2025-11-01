import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";

export interface QuizQuestion {
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
	difficulty: "easy" | "medium" | "hard";
}

interface QuizProps {
	questions: QuizQuestion[];
	onComplete?: (results: QuizResult[]) => void;
}

export interface QuizResult {
	questionIndex: number;
	selectedAnswer: number;
	correctAnswer: number;
	isCorrect: boolean;
	timeSpent?: number;
}

type QuizState = "idle" | "selected" | "submitted";

export function Quiz({ questions, onComplete }: QuizProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [quizState, setQuizState] = useState<QuizState>("idle");
	const [results, setResults] = useState<QuizResult[]>([]);
	const [startTime, setStartTime] = useState<number>(Date.now());

	const currentQuestion = questions[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === questions.length - 1;
	const canSubmit = selectedAnswer !== null && quizState === "selected";
	const hasSubmitted = quizState === "submitted";

	// Reset state when moving to next question
	const resetQuestionState = useCallback(() => {
		setSelectedAnswer(null);
		setQuizState("idle");
		setStartTime(Date.now());
	}, []);

	// Handle answer selection
	const handleAnswerSelect = useCallback(
		(answerIndex: number) => {
			if (quizState === "submitted") return; // Prevent selection after submission

			setSelectedAnswer(answerIndex);
			setQuizState("selected");
		},
		[quizState],
	);

	// Handle answer submission
	const handleSubmit = useCallback(() => {
		if (!canSubmit || selectedAnswer === null) return;

		const timeSpent = Date.now() - startTime;
		const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

		const result: QuizResult = {
			questionIndex: currentQuestionIndex,
			selectedAnswer,
			correctAnswer: currentQuestion.correctAnswer,
			isCorrect,
			timeSpent,
		};

		setResults((prev) => [...prev, result]);
		setQuizState("submitted");
	}, [
		canSubmit,
		selectedAnswer,
		currentQuestion,
		currentQuestionIndex,
		startTime,
	]);

	// Handle next question
	const handleNext = useCallback(() => {
		if (isLastQuestion) {
			// Quiz completed
			onComplete?.(results);
		} else {
			setCurrentQuestionIndex((prev) => prev + 1);
			resetQuestionState();
		}
	}, [isLastQuestion, results, onComplete, resetQuestionState]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (quizState === "submitted") {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					handleNext();
				}
				return;
			}

			// Handle number keys for option selection
			const optionNum = Number.parseInt(event.key);
			if (optionNum >= 1 && optionNum <= currentQuestion.options.length) {
				event.preventDefault();
				handleAnswerSelect(optionNum - 1);
			}

			// Handle letter keys (A, B, C, D)
			const keyCode = event.key.toUpperCase().charCodeAt(0);
			if (keyCode >= 65 && keyCode <= 90) {
				const optionIndex = keyCode - 65;
				if (optionIndex < currentQuestion.options.length) {
					event.preventDefault();
					handleAnswerSelect(optionIndex);
				}
			}

			// Handle Enter for submission
			if (event.key === "Enter" && canSubmit) {
				event.preventDefault();
				handleSubmit();
			}

			// Handle Space for selection/submission
			if (event.key === " ") {
				event.preventDefault();
				if (canSubmit) {
					handleSubmit();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		quizState,
		canSubmit,
		currentQuestion.options.length,
		handleAnswerSelect,
		handleSubmit,
		handleNext,
	]);

	const getOptionClassName = (optionIndex: number) => {
		const baseClasses =
			"p-3 rounded-md border cursor-pointer transition-colors text-left w-full";

		if (quizState === "submitted") {
			if (optionIndex === currentQuestion.correctAnswer) {
				return `${baseClasses} bg-green-50 border-green-200 text-green-800`;
			}
			if (
				optionIndex === selectedAnswer &&
				selectedAnswer !== currentQuestion.correctAnswer
			) {
				return `${baseClasses} bg-red-50 border-red-200 text-red-800`;
			}
			return `${baseClasses} bg-gray-50 text-gray-600 cursor-not-allowed`;
		}

		if (selectedAnswer === optionIndex) {
			return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`;
		}

		return `${baseClasses} hover:bg-accent border-border`;
	};

	const getDifficultyColor = (
		difficulty: string,
	): "secondary" | "destructive" | "default" => {
		switch (difficulty) {
			case "easy":
				return "secondary";
			case "hard":
				return "destructive";
			default:
				return "default";
		}
	};

	if (!currentQuestion) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">No questions available</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-primary">Practice Quiz</h2>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						Question {currentQuestionIndex + 1} of {questions.length}
					</span>
					<Badge variant={getDifficultyColor(currentQuestion.difficulty)}>
						{currentQuestion.difficulty}
					</Badge>
				</div>
			</div>

			<Card className="p-6">
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-medium mb-4">
							{currentQuestion.question}
						</h3>

						<div className="space-y-2">
							{currentQuestion.options.map((option, optionIndex) => (
								<button
									key={`${currentQuestion.question.slice(0, 20)}-option-${optionIndex}`}
									type="button"
									className={getOptionClassName(optionIndex)}
									onClick={() => handleAnswerSelect(optionIndex)}
									disabled={quizState === "submitted"}
									aria-checked={selectedAnswer === optionIndex}
									aria-describedby={`option-${optionIndex}-desc`}
								>
									<div className="flex items-start gap-3">
										<span className="font-medium text-sm mt-0.5 min-w-[1.5rem]">
											{String.fromCharCode(65 + optionIndex)}.
										</span>
										<span className="flex-1">{option}</span>
									</div>
								</button>
							))}
						</div>
					</div>

					{/* Explanation - only shown after submission */}
					{hasSubmitted && (
						<div className="p-4 bg-blue-50 border-blue-200 rounded-md">
							<div className="flex items-start gap-2 mb-2">
								<span
									className={`font-medium text-sm ${
										selectedAnswer === currentQuestion.correctAnswer
											? "text-green-700"
											: "text-red-700"
									}`}
								>
									{selectedAnswer === currentQuestion.correctAnswer
										? "✓ Correct!"
										: "✗ Incorrect"}
								</span>
								{selectedAnswer !== currentQuestion.correctAnswer && (
									<span className="text-sm text-muted-foreground">
										(Correct answer:{" "}
										{String.fromCharCode(65 + currentQuestion.correctAnswer)})
									</span>
								)}
							</div>
							<p className="text-sm text-blue-800">
								<strong>Explanation:</strong> {currentQuestion.explanation}
							</p>
						</div>
					)}

					{/* Action buttons */}
					<div className="flex gap-2 pt-2">
						{!hasSubmitted && (
							<Button
								onClick={handleSubmit}
								disabled={!canSubmit}
								className="flex-1"
							>
								Submit Answer
							</Button>
						)}

						{hasSubmitted && (
							<Button onClick={handleNext} className="flex-1">
								{isLastQuestion ? "Complete Quiz" : "Next Question"}
							</Button>
						)}
					</div>

					{/* Keyboard hints */}
					<div className="text-xs text-muted-foreground pt-2 border-t">
						{!hasSubmitted ? (
							<p>
								Use keys A-
								{String.fromCharCode(65 + currentQuestion.options.length - 1)}{" "}
								to select, Enter or Space to submit
							</p>
						) : (
							<p>Press Enter or Space to continue</p>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}
