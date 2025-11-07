import { TimeTracker } from "@/components/TimeTracker";
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
	type DailyLogEntry,
	createDailyLog,
	listDailyLogs,
	updateDailyLog,
} from "@/lib/api-client-entities";
import type { Task } from "@/types/task-tracking";
import {
	createFileRoute,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import JSZip from "jszip";
import {
	BarChart3,
	BookOpen,
	Brain,
	Calendar,
	Database,
	Download,
	Loader2,
	LogOut,
	TrendingDown,
	TrendingUp,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-errors";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const [activeTab, setActiveTab] = useState("log");

	// Listen to URL hash or query params to sync with SideNav
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const tabParam = urlParams.get("tab");
		if (tabParam && ["log", "dashboard", "insights"].includes(tabParam)) {
			setActiveTab(tabParam);
		}
	}, []);

	// Update URL when tab changes
	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		const url = new URL(window.location.href);
		url.searchParams.set("tab", tab);
		window.history.replaceState({}, "", url.toString());
	};

	// Make handleTabChange available globally for SideNav
	useEffect(() => {
		(window as any).__setMainTab = handleTabChange;
		return () => {
			(window as any).__setMainTab = undefined;
		};
	}, []);

	// Content mapping based on active tab
	const renderContent = () => {
		switch (activeTab) {
			case "dashboard":
				return <Dashboard />;
			case "insights":
				return <Insights />;
			default:
				return <DailyLogForm />;
		}
	};

	return <div className="w-full">{renderContent()}</div>;
}

function DailyLogForm() {
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [goals, setGoals] = useState(["", "", ""]);
	const [executionNotes, setExecutionNotes] = useState("");
	const [tasks, setTasks] = useState<Task[]>([]);
	const [focusRating, setFocusRating] = useState([5]);
	const [energyRating, setEnergyRating] = useState([5]);
	const [motivation, setMotivation] = useState([3]);
	const [anxiety, setAnxiety] = useState([3]);
	const [confidence, setConfidence] = useState([3]);
	const [difficulties, setDifficulties] = useState("");
	const [performanceScore, setPerformanceScore] = useState([5]);
	const [winLose, setWinLose] = useState(true);
	const [reasoning, setReasoning] = useState("");
	const [improvementNotes, setImprovementNotes] = useState("");
	const [strengths, setStrengths] = useState(["", "", ""]);
	const [needsImprovement, setNeedsImprovement] = useState("");
	const [loading, setLoading] = useState(false);
	const [saveMessage, setSaveMessage] = useState("");

	const handleGoalChange = (index: number, value: string) => {
		const newGoals = [...goals];
		newGoals[index] = value;
		setGoals(newGoals);
	};

	const handleStrengthChange = (index: number, value: string) => {
		const newStrengths = [...strengths];
		newStrengths[index] = value;
		setStrengths(newStrengths);
	};

	const handleSubmit = async () => {
		setLoading(true);
		setSaveMessage("");

		try {
			// Detect skills from text
			const allText =
				`${executionNotes} ${reasoning} ${improvementNotes} ${goals.join(" ")}`.toLowerCase();
			const skillKeywords = [
				"javascript",
				"typescript",
				"react",
				"code review",
				"debugging",
				"testing",
				"documentation",
				"problem solving",
				"communication",
				"planning",
				"presentation",
				"mentoring",
				"research",
				"optimization",
				"refactoring",
				"technical writing",
				"stakeholder management",
				"project planning",
				"database",
				"api",
				"design",
				"architecture",
				"leadership",
			];
			const detectedSkills = skillKeywords.filter((skill) =>
				allText.includes(skill),
			);

			const logEntry = {
				date,
				goals,
				execution_notes: executionNotes || undefined,
				tasks: tasks.length > 0 ? tasks : undefined,
				focus_rating: focusRating[0],
				energy_rating: energyRating[0],
				motivation: motivation[0],
				anxiety: anxiety[0],
				confidence: confidence[0],
				difficulties: difficulties || undefined,
				performance_score: performanceScore[0],
				win_lose: winLose,
				reasoning: reasoning || undefined,
				improvement_notes: improvementNotes || undefined,
				skills: detectedSkills.length > 0 ? detectedSkills : undefined,
				strengths:
					strengths.filter(Boolean).length > 0
						? strengths.filter(Boolean)
						: undefined,
				scorecard: {
					wins: strengths,
					needs_improvement: needsImprovement,
				},
			};

			// Check if entry for this date already exists
			const existingEntries = await listDailyLogs();
			const existingForDate = existingEntries.find((e) => e.date === date);

			if (existingForDate?.entryId) {
				await updateDailyLog(existingForDate.entryId, logEntry);
				setSaveMessage("Entry updated successfully!");
			} else {
				await createDailyLog(logEntry);
				setSaveMessage("Entry saved successfully!");
			}

			setTimeout(() => setSaveMessage(""), 3000);
		} catch (error) {
			console.error("Error saving log entry:", error);
			const authError = getAuthErrorMessage(error);
			if (authError) {
				setSaveMessage(authError);
			} else {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				setSaveMessage(`Error saving entry: ${errorMessage}`);
			}
			setTimeout(() => setSaveMessage(""), 5000);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily Performance Log</CardTitle>
				<CardDescription>
					Record your daily goals, execution, and reflections
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="date">Date</Label>
					<Input
						id="date"
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
					/>
				</div>

				<div className="space-y-4">
					<Label>Daily Goals (3)</Label>
					{[0, 1, 2].map((index) => (
						<Input
							key={`goal-${index}`}
							placeholder={`Goal ${index + 1}`}
							value={goals[index]}
							onChange={(e) => handleGoalChange(index, e.target.value)}
						/>
					))}
				</div>

				<div className="space-y-2">
					<Label htmlFor="execution">Execution Notes</Label>
					<Textarea
						id="execution"
						placeholder="How did you execute on your goals today?"
						value={executionNotes}
						onChange={(e) => setExecutionNotes(e.target.value)}
					/>
				</div>

				<div className="border-t pt-6">
					<TimeTracker tasks={tasks} onTasksChange={setTasks} />
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label>Focus Rating: {focusRating[0]}/10</Label>
						<Slider
							value={focusRating}
							onValueChange={setFocusRating}
							min={1}
							max={10}
							step={1}
						/>
					</div>

					<div className="space-y-2">
						<Label>Energy Rating: {energyRating[0]}/10</Label>
						<Slider
							value={energyRating}
							onValueChange={setEnergyRating}
							min={1}
							max={10}
							step={1}
						/>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div className="space-y-2">
						<Label>Motivation: {motivation[0]}/5</Label>
						<Slider
							value={motivation}
							onValueChange={setMotivation}
							min={1}
							max={5}
							step={1}
						/>
					</div>

					<div className="space-y-2">
						<Label>Anxiety: {anxiety[0]}/5</Label>
						<Slider
							value={anxiety}
							onValueChange={setAnxiety}
							min={1}
							max={5}
							step={1}
						/>
					</div>

					<div className="space-y-2">
						<Label>Confidence: {confidence[0]}/5</Label>
						<Slider
							value={confidence}
							onValueChange={setConfidence}
							min={1}
							max={5}
							step={1}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="difficulties">Difficulties / Challenges</Label>
					<Textarea
						id="difficulties"
						placeholder="What challenges did you face?"
						value={difficulties}
						onChange={(e) => setDifficulties(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label>Overall Performance Score: {performanceScore[0]}/10</Label>
					<Slider
						value={performanceScore}
						onValueChange={setPerformanceScore}
						min={1}
						max={10}
						step={1}
					/>
				</div>

				<div className="space-y-2">
					<Label>Day Outcome</Label>
					<div className="flex gap-4">
						<Button
							variant={winLose ? "default" : "outline"}
							onClick={() => setWinLose(true)}
							className="flex-1"
						>
							<TrendingUp className="mr-2" />
							Win
						</Button>
						<Button
							variant={!winLose ? "destructive" : "outline"}
							onClick={() => setWinLose(false)}
							className="flex-1"
						>
							<TrendingDown className="mr-2" />
							Lose
						</Button>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="reasoning">Reasoning</Label>
					<Textarea
						id="reasoning"
						placeholder="Why was today a win or lose?"
						value={reasoning}
						onChange={(e) => setReasoning(e.target.value)}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="improvement">Improvement Notes</Label>
					<Textarea
						id="improvement"
						placeholder="What can you improve for tomorrow?"
						value={improvementNotes}
						onChange={(e) => setImprovementNotes(e.target.value)}
					/>
				</div>

				<div className="space-y-4 border-t pt-6">
					<Label>3:1 Scorecard</Label>
					<div className="space-y-2">
						<Label className="text-sm app-text-subtle">
							3 Strengths Demonstrated Today
						</Label>
						{[0, 1, 2].map((index) => (
							<Input
								key={`strength-${index}`}
								placeholder={`Strength ${index + 1} (e.g., Leadership, Persistence, Communication)`}
								value={strengths[index]}
								onChange={(e) => handleStrengthChange(index, e.target.value)}
							/>
						))}
					</div>
					<div className="space-y-2">
						<Label className="text-sm app-text-subtle">
							1 Area Needs Improvement
						</Label>
						<Input
							placeholder="What needs improvement?"
							value={needsImprovement}
							onChange={(e) => setNeedsImprovement(e.target.value)}
						/>
					</div>
					<p className="text-xs app-text-muted italic mt-2">
						💡 Skills are automatically detected from your notes and goals
					</p>
				</div>

				<div className="flex flex-col gap-2">
					<Button
						onClick={handleSubmit}
						disabled={loading}
						size="lg"
						className="w-full"
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Entry"
						)}
					</Button>
					{saveMessage && (
						<p
							className={`text-sm text-center ${saveMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}
						>
							{saveMessage}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function Dashboard() {
	const [entries, setEntries] = useState<DailyLogEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [recentView, setRecentView] = useState<"entries" | "tasks">("entries");

	useEffect(() => {
		const loadEntries = async () => {
			try {
				const allEntries = await listDailyLogs();
				setEntries(allEntries.sort((a, b) => b.date.localeCompare(a.date)));
			} catch (error) {
				console.error("Error loading entries:", error);
			} finally {
				setLoading(false);
			}
		};
		loadEntries();
	}, []);

	if (loading) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
					<p className="app-text-subtle">Loading dashboard...</p>
				</CardContent>
			</Card>
		);
	}

	if (entries.length === 0) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<p className="app-text-subtle">
						No entries yet. Start logging your daily performance!
					</p>
				</CardContent>
			</Card>
		);
	}

	const avgPerformance = (
		entries.reduce((sum, e) => sum + e.performance_score, 0) / entries.length
	).toFixed(1);
	const avgFocus = (
		entries.reduce((sum, e) => sum + e.focus_rating, 0) / entries.length
	).toFixed(1);
	const avgEnergy = (
		entries.reduce((sum, e) => sum + e.energy_rating, 0) / entries.length
	).toFixed(1);
	const winRate = (
		(entries.filter((e) => e.win_lose).length / entries.length) *
		100
	).toFixed(0);

	const totalTimeSeconds = entries.reduce((sum, entry) => {
		if (!entry.tasks) return sum;
		return (
			sum +
			entry.tasks.reduce((taskSum: number, task: Task) => {
				return (
					taskSum +
					task.timeEntries.reduce((entrySum: number, timeEntry) => {
						return entrySum + timeEntry.duration;
					}, 0)
				);
			}, 0)
		);
	}, 0);

	const totalHours = (totalTimeSeconds / 3600).toFixed(1);

	const totalTaskCount = entries.reduce((sum, entry) => {
		return sum + (entry.tasks?.length || 0);
	}, 0);

	const avgTimePerDay =
		entries.length > 0
			? (totalTimeSeconds / entries.length / 3600).toFixed(1)
			: "0.0";

	const handleExportData = async () => {
		try {
			const zip = new JSZip();
			const dataJson = JSON.stringify(entries, null, 2);
			zip.file("performance_logs.json", dataJson);

			const blob = await zip.generateAsync({ type: "blob" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `performance_tracker_export_${new Date().toISOString().split("T")[0]}.zip`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error exporting data:", error);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-end mb-4">
				<Button onClick={handleExportData} variant="outline" size="sm">
					<Download className="mr-2" />
					Export All Data
				</Button>
			</div>
			<div className="grid grid-cols-4 gap-3">
				<Card>
					<CardContent className="p-4 text-center">
						<p className="text-xs font-medium app-text-subtle mb-2">
							Avg Performance
						</p>
						<div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">
							{avgPerformance}
						</div>
						<p className="text-xs app-text-muted mt-1">/ 10</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<p className="text-xs font-medium app-text-subtle mb-2">
							Avg Focus
						</p>
						<div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-400 bg-clip-text text-transparent">
							{avgFocus}
						</div>
						<p className="text-xs app-text-muted mt-1">/ 10</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<p className="text-xs font-medium app-text-subtle mb-2">
							Avg Energy
						</p>
						<div className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-orange-400 bg-clip-text text-transparent">
							{avgEnergy}
						</div>
						<p className="text-xs app-text-muted mt-1">/ 10</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<p className="text-xs font-medium app-text-subtle mb-2">Win Rate</p>
						<div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-400 bg-clip-text text-transparent">
							{winRate}
						</div>
						<p className="text-xs app-text-muted mt-1">%</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Time Tracking Metrics</CardTitle>
					<CardDescription>Summary of your tracked work time</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4">
						{[
							{ label: "Total Hours", value: `${totalHours}h` },
							{ label: "Total Tasks", value: totalTaskCount },
							{ label: "Avg Hours/Day", value: `${avgTimePerDay}h` },
						].map((stat) => (
							<div
								key={stat.label}
								className="flex flex-col justify-center rounded-lg border app-border-default bg-gradient-to-b from-[color-mix(in_oklab,var(--color-app-surface)_90%,black_10%)] to-[color-mix(in_oklab,var(--color-app-surface)_75%,black_25%)] p-4 text-center shadow-sm"
							>
								<p className="text-xs tracking-wide uppercase app-text-muted mb-2">
									{stat.label}
								</p>
								<p className="text-2xl font-semibold app-text-strong">
									{stat.value}
								</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Recent Activity</CardTitle>
							<CardDescription>
								View your recent entries and tasks
							</CardDescription>
						</div>
						<div className="flex gap-2">
							<Button
								variant={recentView === "entries" ? "default" : "outline"}
								size="sm"
								onClick={() => setRecentView("entries")}
							>
								Entries
							</Button>
							<Button
								variant={recentView === "tasks" ? "default" : "outline"}
								size="sm"
								onClick={() => setRecentView("tasks")}
							>
								Tasks
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{recentView === "entries" ? (
						<div className="space-y-4">
							{entries.slice(0, 10).map((entry) => (
								<div
									key={entry.id}
									className="border app-border-default rounded-lg p-4 space-y-2 app-bg-surface-alt"
								>
									<div className="flex justify-between items-start">
										<div>
											<p className="font-semibold">
												{new Date(entry.date).toLocaleDateString()}
											</p>
											<p className="text-sm app-text-subtle">
												Performance: {entry.performance_score}/10 | Focus:{" "}
												{entry.focus_rating}/10 | Energy: {entry.energy_rating}
												/10
											</p>
										</div>
										<div
											className={`px-2 py-1 rounded text-xs font-medium ${entry.win_lose ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
										>
											{entry.win_lose ? "Win" : "Lose"}
										</div>
									</div>
									<div className="text-sm">
										<p className="font-medium">Goals:</p>
										<ul className="list-disc list-inside app-text-subtle">
											{entry.goals.map(
												(goal, idx) =>
													goal && (
														<li key={`${entry.id}-goal-${idx}`}>{goal}</li>
													),
											)}
										</ul>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="space-y-4">
							{entries
								.filter((entry) => entry.tasks && entry.tasks.length > 0)
								.slice(0, 10)
								.flatMap((entry) =>
									entry.tasks?.map((task) => ({
										...task,
										date: entry.date,
										entryId: entry.id,
									})),
								)
								.filter(
									(task): task is Task & { date: string; entryId: string } =>
										task !== undefined,
								)
								.slice(0, 20)
								.map((task) => {
									const totalTime = task.timeEntries.reduce(
										(sum, entry) => sum + entry.duration,
										0,
									);
									const hours = Math.floor(totalTime / 3600);
									const minutes = Math.floor((totalTime % 3600) / 60);
									return (
										<div
											key={`${task.entryId}-${task.id}`}
											className="border app-border-default rounded-lg p-4 space-y-2 app-bg-surface-alt"
										>
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<p className="text-xs app-text-muted mb-1">
														{new Date(task.date).toLocaleDateString()}
													</p>
													{task.link && (
														<a
															href={task.link}
															target="_blank"
															rel="noopener noreferrer"
															className="text-sm font-medium text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
														>
															{task.link}
														</a>
													)}
													{task.notes && (
														<p className="text-sm app-text-subtle mt-1">
															{task.notes}
														</p>
													)}
												</div>
												<div className="text-right">
													<p className="text-lg font-bold app-text-strong">
														{hours}h {minutes}m
													</p>
													<p className="text-xs app-text-muted">
														{task.timeEntries.length} session
														{task.timeEntries.length !== 1 ? "s" : ""}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							{entries.filter((entry) => entry.tasks && entry.tasks.length > 0)
								.length === 0 && (
								<p className="text-center app-text-muted py-8">
									No tasks tracked yet. Start tracking tasks in your daily logs!
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Insights() {
	const [entries, setEntries] = useState<DailyLogEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadEntries = async () => {
			try {
				const allEntries = await listDailyLogs();
				setEntries(allEntries);
			} catch (error) {
				console.error("Error loading entries:", error);
			} finally {
				setLoading(false);
			}
		};
		loadEntries();
	}, []);

	if (loading) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
					<p className="app-text-subtle">Loading insights...</p>
				</CardContent>
			</Card>
		);
	}

	if (entries.length < 3) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<p className="app-text-subtle">
						Log at least 3 days to see pattern insights!
					</p>
				</CardContent>
			</Card>
		);
	}

	const insights: string[] = [];

	const avgEnergy =
		entries.reduce((sum, e) => sum + e.energy_rating, 0) / entries.length;
	const highEnergyDays = entries.filter((e) => e.energy_rating >= 7);
	const lowEnergyDays = entries.filter((e) => e.energy_rating <= 4);

	if (highEnergyDays.length > 0) {
		const avgPerfHighEnergy =
			highEnergyDays.reduce((sum, e) => sum + e.performance_score, 0) /
			highEnergyDays.length;
		const avgPerfOverall =
			entries.reduce((sum, e) => sum + e.performance_score, 0) / entries.length;
		if (avgPerfHighEnergy > avgPerfOverall + 1) {
			insights.push(
				`You perform significantly better on high-energy days (${avgPerfHighEnergy.toFixed(1)}/10 vs ${avgPerfOverall.toFixed(1)}/10 overall). Prioritize energy management.`,
			);
		}
	}

	if (lowEnergyDays.length >= entries.length * 0.3) {
		insights.push(
			`${((lowEnergyDays.length / entries.length) * 100).toFixed(0)}% of your days have low energy (≤4/10). Consider reviewing sleep, nutrition, or stress levels.`,
		);
	}

	const winDays = entries.filter((e) => e.win_lose);
	const loseDays = entries.filter((e) => !e.win_lose);

	if (winDays.length > 0 && loseDays.length > 0) {
		const avgFocusWin =
			winDays.reduce((sum, e) => sum + e.focus_rating, 0) / winDays.length;
		const avgFocusLose =
			loseDays.reduce((sum, e) => sum + e.focus_rating, 0) / loseDays.length;
		if (avgFocusWin > avgFocusLose + 1.5) {
			insights.push(
				`Win days have notably higher focus (${avgFocusWin.toFixed(1)}/10) compared to lose days (${avgFocusLose.toFixed(1)}/10). Focus is a key success factor.`,
			);
		}
	}

	const difficulties = entries
		.map((e) => e.difficulties)
		.filter(Boolean)
		.join(" ")
		.toLowerCase();

	const commonWords = [
		"distraction",
		"tired",
		"unfocused",
		"procrastination",
		"overwhelmed",
		"stress",
		"interruption",
	];
	const foundPatterns = commonWords.filter((word) =>
		difficulties.includes(word),
	);

	if (foundPatterns.length > 0) {
		insights.push(
			`Common challenges detected: ${foundPatterns.join(", ")}. Consider strategies to address these recurring issues.`,
		);
	}

	const recentTrend = entries.slice(0, 5).filter((e) => e.win_lose).length;
	if (recentTrend >= 4) {
		insights.push(
			"Strong recent performance! You have 4+ wins in your last 5 days. Keep the momentum going.",
		);
	} else if (recentTrend <= 1) {
		insights.push(
			"Recent performance shows room for improvement. Review your last few days and identify actionable changes.",
		);
	}

	const allSkills: string[] = [];
	const allStrengths: string[] = [];
	const skillFrequency: Record<string, number> = {};
	const strengthFrequency: Record<string, number> = {};

	for (const entry of entries) {
		if (entry.skills) {
			for (const skill of entry.skills) {
				allSkills.push(skill);
				skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
			}
		}
		if (entry.strengths) {
			for (const strength of entry.strengths) {
				allStrengths.push(strength);
				strengthFrequency[strength] = (strengthFrequency[strength] || 0) + 1;
			}
		}
	}

	const topSkills = Object.entries(skillFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);
	const topStrengths = Object.entries(strengthFrequency)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Pattern Insights</CardTitle>
					<CardDescription>
						Automatically detected patterns from your performance logs
					</CardDescription>
				</CardHeader>
				<CardContent>
					{insights.length === 0 ? (
						<p className="app-text-subtle">
							No significant patterns detected yet. Continue logging to surface
							insights.
						</p>
					) : (
						<ul className="space-y-3">
							{insights.map((insight) => (
								<li key={insight} className="flex gap-3 items-start">
									<Brain className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
									<p className="app-text-subtle">{insight}</p>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Skills & Strengths Mind Map</CardTitle>
					<CardDescription>
						Long-term tracking of your demonstrated skills and strengths
					</CardDescription>
				</CardHeader>
				<CardContent>
					{topSkills.length === 0 && topStrengths.length === 0 ? (
						<p className="app-text-subtle">
							Start logging skills and strengths to build your mind map!
						</p>
					) : (
						<div className="grid md:grid-cols-2 gap-8">
							{topSkills.length > 0 && (
								<div>
									<h3 className="font-semibold text-lg mb-4 app-text-strong">
										Top Skills
									</h3>
									<div className="space-y-2">
										{topSkills.map(([skill, count]) => (
											<div
												key={skill}
												className="flex items-center justify-between p-3 rounded-lg app-bg-surface-alt border app-border-default"
											>
												<span className="font-medium app-text-strong">
													{skill}
												</span>
												<span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
													{count}x
												</span>
											</div>
										))}
									</div>
								</div>
							)}
							{topStrengths.length > 0 && (
								<div>
									<h3 className="font-semibold text-lg mb-4 app-text-strong">
										Top Strengths
									</h3>
									<div className="space-y-2">
										{topStrengths.map(([strength, count]) => (
											<div
												key={strength}
												className="flex items-center justify-between p-3 rounded-lg app-bg-surface-alt border app-border-default"
											>
												<span className="font-medium app-text-strong">
													{strength}
												</span>
												<span className="text-xs px-2 py-1 rounded-full bg-green-600 text-white">
													{count}x
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
