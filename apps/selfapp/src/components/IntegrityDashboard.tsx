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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	BookOpen,
	Brain,
	Eye,
	EyeOff,
	Heart,
	Lightbulb,
	Save,
	Settings,
	Target,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

// Types for Integrity data
interface AlignmentLayer {
	desire: string;
	intention: string;
	choice: string;
	action: string;
	timestamp: string;
}

interface JournalEntry {
	id: string;
	date: string;
	content: string;
	integrityScore: number;
}

interface IntegritySettings {
	showBiblicalContent: boolean;
	visibleWidgets: {
		integrityScore: boolean;
		alignmentTracker: boolean;
		journaling: boolean;
		biblicalContent: boolean;
		aiSuggestions: boolean;
	};
}

// Biblical/Spiritual content
const motivationalExcerpts = [
	{
		text: "The spirits that dwell in these tabernacles were as pure as the heavens, when they entered them; they are susceptible of improvement, of education, and refinement, and of arriving at a state of great knowledge; and they are also susceptible of degradation.",
		reference: "Abraham 3:17 (paraphrased concept)",
	},
	{
		text: "For what doth it profit a man if a gift is bestowed upon him, and he receive not the gift? Behold, he rejoices not in that which is given unto him, neither rejoices in him who is the giver of the gift.",
		reference: "Doctrine and Covenants 88:33",
	},
	{
		text: "Let integrity and uprightness preserve me; for I wait on thee.",
		reference: "Psalm 25:21",
	},
	{
		text: "And he said unto me: Knowest thou the meaning of the tree which thy father saw? And I answered him, saying: Yea, it is the love of God, which sheddeth itself abroad in the hearts of the children of men; wherefore, it is the most desirable above all things.",
		reference: "1 Nephi 11:21-22",
	},
];

const DEFAULT_SETTINGS: IntegritySettings = {
	showBiblicalContent: false,
	visibleWidgets: {
		integrityScore: true,
		alignmentTracker: true,
		journaling: true,
		biblicalContent: true,
		aiSuggestions: true,
	},
};

export function IntegrityDashboard() {
	// State management
	const [settings, setSettings] = useState<IntegritySettings>(DEFAULT_SETTINGS);
	const [alignmentLayers, setAlignmentLayers] = useState<AlignmentLayer[]>([]);
	const [currentAlignment, setCurrentAlignment] = useState<Omit<AlignmentLayer, 'timestamp'>>({
		desire: "",
		intention: "",
		choice: "",
		action: "",
	});
	const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
	const [currentJournal, setCurrentJournal] = useState("");
	const [showSettings, setShowSettings] = useState(false);
	const [currentExcerptIndex, setCurrentExcerptIndex] = useState(0);

	// Load data from localStorage on mount
	useEffect(() => {
		const savedSettings = localStorage.getItem("integritySettings");
		if (savedSettings) {
			setSettings(JSON.parse(savedSettings));
		}

		const savedAlignments = localStorage.getItem("alignmentLayers");
		if (savedAlignments) {
			setAlignmentLayers(JSON.parse(savedAlignments));
		}

		const savedJournals = localStorage.getItem("journalEntries");
		if (savedJournals) {
			setJournalEntries(JSON.parse(savedJournals));
		}
	}, []);

	// Save settings whenever they change
	useEffect(() => {
		localStorage.setItem("integritySettings", JSON.stringify(settings));
	}, [settings]);

	// Calculate Integrity Score based on alignment
	const calculateIntegrityScore = (): number => {
		if (alignmentLayers.length === 0) return 0;

		const recentAlignment = alignmentLayers[alignmentLayers.length - 1];
		let score = 0;

		// Score each layer based on whether it's filled and its alignment
		if (recentAlignment.desire) score += 25;
		if (recentAlignment.intention) score += 25;
		if (recentAlignment.choice) score += 25;
		if (recentAlignment.action) score += 25;

		return score;
	};

	// Handle saving alignment
	const handleSaveAlignment = () => {
		if (!currentAlignment.desire && !currentAlignment.intention && 
			!currentAlignment.choice && !currentAlignment.action) {
			return;
		}

		const newAlignment: AlignmentLayer = {
			...currentAlignment,
			timestamp: new Date().toISOString(),
		};

		const updatedLayers = [...alignmentLayers, newAlignment];
		setAlignmentLayers(updatedLayers);
		localStorage.setItem("alignmentLayers", JSON.stringify(updatedLayers));

		// Reset form
		setCurrentAlignment({
			desire: "",
			intention: "",
			choice: "",
			action: "",
		});
	};

	// Handle saving journal entry
	const handleSaveJournal = () => {
		if (!currentJournal.trim()) return;

		const newEntry: JournalEntry = {
			id: Date.now().toString(),
			date: new Date().toISOString(),
			content: currentJournal,
			integrityScore: calculateIntegrityScore(),
		};

		const updatedEntries = [...journalEntries, newEntry];
		setJournalEntries(updatedEntries);
		localStorage.setItem("journalEntries", JSON.stringify(updatedEntries));
		setCurrentJournal("");
	};

	// Generate AI suggestions based on alignment history
	const generateAISuggestions = (): string[] => {
		const suggestions: string[] = [];

		if (alignmentLayers.length === 0) {
			suggestions.push("Start tracking your alignment layers to receive personalized suggestions.");
			return suggestions;
		}

		const recentAlignments = alignmentLayers.slice(-5);

		// Check for patterns
		const hasDesireGap = recentAlignments.some(a => a.desire && (!a.intention || !a.action));
		const hasIntentionGap = recentAlignments.some(a => a.intention && !a.action);
		const hasChoiceGap = recentAlignments.some(a => a.choice && !a.action);

		if (hasDesireGap) {
			suggestions.push("Consider creating specific intentions and action plans for your desires to improve alignment.");
		}

		if (hasIntentionGap) {
			suggestions.push("You have intentions but missing actions. Break down your intentions into smaller, actionable steps.");
		}

		if (hasChoiceGap) {
			suggestions.push("Transform your choices into concrete actions. Set specific times and conditions for execution.");
		}

		if (alignmentLayers.length >= 7) {
			const avgScore = alignmentLayers.reduce((sum, layer) => {
				let layerScore = 0;
				if (layer.desire) layerScore += 25;
				if (layer.intention) layerScore += 25;
				if (layer.choice) layerScore += 25;
				if (layer.action) layerScore += 25;
				return sum + layerScore;
			}, 0) / alignmentLayers.length;

			if (avgScore < 75) {
				suggestions.push("Your integrity score could improve. Focus on completing all four layers consistently.");
			} else if (avgScore >= 90) {
				suggestions.push("Excellent alignment! You're demonstrating strong integrity across all layers.");
			}
		}

		if (suggestions.length === 0) {
			suggestions.push("Keep logging your alignment layers to build a strong foundation of integrity.");
		}

		return suggestions;
	};

	// Toggle widget visibility
	const toggleWidget = (widget: keyof IntegritySettings['visibleWidgets']) => {
		setSettings(prev => ({
			...prev,
			visibleWidgets: {
				...prev.visibleWidgets,
				[widget]: !prev.visibleWidgets[widget],
			},
		}));
	};

	// Rotate biblical excerpts
	useEffect(() => {
		if (settings.showBiblicalContent) {
			const interval = setInterval(() => {
				setCurrentExcerptIndex((prev) => (prev + 1) % motivationalExcerpts.length);
			}, 30000); // Change every 30 seconds

			return () => clearInterval(interval);
		}
	}, [settings.showBiblicalContent]);

	const integrityScore = calculateIntegrityScore();
	const aiSuggestions = generateAISuggestions();

	return (
		<div className="space-y-6">
			{/* Header with Settings Toggle */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold app-text-strong">Integrity Dashboard</h1>
					<p className="text-sm app-text-subtle mt-1">
						Align your desires, intentions, choices, and actions
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowSettings(!showSettings)}
				>
					<Settings className="mr-2 h-4 w-4" />
					{showSettings ? "Hide Settings" : "Settings"}
				</Button>
			</div>

			{/* Settings Panel */}
			{showSettings && (
				<Card>
					<CardHeader>
						<CardTitle>Dashboard Settings</CardTitle>
						<CardDescription>Customize your integrity dashboard layout and preferences</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label>Biblical/Spiritual Content</Label>
								<p className="text-sm app-text-subtle">
									Show inspirational excerpts from scripture
								</p>
							</div>
							<Switch
								checked={settings.showBiblicalContent}
								onCheckedChange={(checked) =>
									setSettings((prev) => ({ ...prev, showBiblicalContent: checked }))
								}
							/>
						</div>

						<div className="border-t pt-4">
							<Label className="text-base mb-3 block">Visible Widgets</Label>
							<div className="space-y-3">
								{Object.entries(settings.visibleWidgets).map(([key, value]) => (
									<div key={key} className="flex items-center justify-between">
										<Label className="capitalize">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</Label>
										<Switch
											checked={value}
											onCheckedChange={() =>
												toggleWidget(key as keyof IntegritySettings['visibleWidgets'])
											}
										/>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Biblical Content Widget */}
			{settings.showBiblicalContent && settings.visibleWidgets.biblicalContent && (
				<Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
					<CardContent className="p-6">
						<div className="flex gap-4">
							<BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
							<div className="space-y-2">
								<p className="text-base italic app-text-strong leading-relaxed">
									"{motivationalExcerpts[currentExcerptIndex].text}"
								</p>
								<p className="text-sm app-text-subtle">
									— {motivationalExcerpts[currentExcerptIndex].reference}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Integrity Score Widget */}
			{settings.visibleWidgets.integrityScore && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-5 w-5" />
							Integrity Score
						</CardTitle>
						<CardDescription>
							Your alignment score based on the four layers
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center p-8">
							<div className="relative">
								<div className="text-center">
									<div className="text-7xl font-bold bg-gradient-to-br from-purple-600 to-blue-400 bg-clip-text text-transparent">
										{integrityScore}
									</div>
									<p className="text-xl app-text-muted mt-2">/ 100</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-4 gap-3 mt-6">
							{[
								{ label: "Desire", icon: Heart, filled: alignmentLayers.length > 0 && alignmentLayers[alignmentLayers.length - 1]?.desire },
								{ label: "Intention", icon: Target, filled: alignmentLayers.length > 0 && alignmentLayers[alignmentLayers.length - 1]?.intention },
								{ label: "Choice", icon: TrendingUp, filled: alignmentLayers.length > 0 && alignmentLayers[alignmentLayers.length - 1]?.choice },
								{ label: "Action", icon: Eye, filled: alignmentLayers.length > 0 && alignmentLayers[alignmentLayers.length - 1]?.action },
							].map((layer) => (
								<div
									key={layer.label}
									className={`p-3 rounded-lg border text-center transition-colors ${
										layer.filled
											? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
											: "app-bg-surface-alt app-border-default"
									}`}
								>
									<layer.icon className={`h-5 w-5 mx-auto mb-2 ${layer.filled ? "text-green-600 dark:text-green-400" : "app-text-muted"}`} />
									<p className="text-xs font-medium">{layer.label}</p>
								</div>
							))}
						</div>

						<div className="mt-4 p-3 rounded-lg app-bg-surface-alt">
							<p className="text-xs app-text-subtle">
								<strong>How it's calculated:</strong> Each completed layer (Desire, Intention, Choice, Action) contributes 25 points to your integrity score.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Alignment Tracker Widget */}
			{settings.visibleWidgets.alignmentTracker && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Four-Layer Alignment Tracker
						</CardTitle>
						<CardDescription>
							Track your progress through desire, intention, choice, and action
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="desire">1. Desire - What do you truly want?</Label>
								<Textarea
									id="desire"
									placeholder="Describe your deep desire or aspiration..."
									value={currentAlignment.desire}
									onChange={(e) =>
										setCurrentAlignment((prev) => ({ ...prev, desire: e.target.value }))
									}
									rows={2}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="intention">2. Intention/Plan - What do you intend to do?</Label>
								<Textarea
									id="intention"
									placeholder="Outline your intention or plan..."
									value={currentAlignment.intention}
									onChange={(e) =>
										setCurrentAlignment((prev) => ({ ...prev, intention: e.target.value }))
									}
									rows={2}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="choice">3. Choice - What choice are you making?</Label>
								<Textarea
									id="choice"
									placeholder="Describe the choice you're committing to..."
									value={currentAlignment.choice}
									onChange={(e) =>
										setCurrentAlignment((prev) => ({ ...prev, choice: e.target.value }))
									}
									rows={2}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="action">4. Action - What action will you take?</Label>
								<Textarea
									id="action"
									placeholder="Specify the concrete action you'll take..."
									value={currentAlignment.action}
									onChange={(e) =>
										setCurrentAlignment((prev) => ({ ...prev, action: e.target.value }))
									}
									rows={2}
								/>
							</div>
						</div>

						<Button onClick={handleSaveAlignment} className="w-full">
							<Save className="mr-2 h-4 w-4" />
							Save Alignment
						</Button>

						{/* Recent Alignment History */}
						{alignmentLayers.length > 0 && (
							<div className="border-t pt-4 mt-4">
								<h4 className="font-semibold mb-3 app-text-strong">Recent Alignments</h4>
								<div className="space-y-2 max-h-64 overflow-y-auto">
									{alignmentLayers.slice(-5).reverse().map((layer, idx) => (
										<div
											key={layer.timestamp}
											className="p-3 rounded-lg app-bg-surface-alt border app-border-default text-sm"
										>
											<p className="text-xs app-text-muted mb-2">
												{new Date(layer.timestamp).toLocaleDateString()} at{" "}
												{new Date(layer.timestamp).toLocaleTimeString()}
											</p>
											{layer.desire && (
												<p className="mb-1">
													<strong>Desire:</strong> {layer.desire.substring(0, 50)}
													{layer.desire.length > 50 ? "..." : ""}
												</p>
											)}
											{layer.action && (
												<p>
													<strong>Action:</strong> {layer.action.substring(0, 50)}
													{layer.action.length > 50 ? "..." : ""}
												</p>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* Journaling Widget */}
			{settings.visibleWidgets.journaling && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Integrity Journal
						</CardTitle>
						<CardDescription>
							Reflect on how your actions align with your intentions and desires
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="journal">Today's Reflection</Label>
							<Textarea
								id="journal"
								placeholder="How are my actions aligning with my intentions today? What adjustments can I make?"
								value={currentJournal}
								onChange={(e) => setCurrentJournal(e.target.value)}
								rows={6}
							/>
						</div>

						<Button onClick={handleSaveJournal} className="w-full">
							<Save className="mr-2 h-4 w-4" />
							Save Journal Entry
						</Button>

						{/* Recent Journal Entries */}
						{journalEntries.length > 0 && (
							<div className="border-t pt-4 mt-4">
								<h4 className="font-semibold mb-3 app-text-strong">Recent Entries</h4>
								<div className="space-y-3 max-h-96 overflow-y-auto">
									{journalEntries.slice(-10).reverse().map((entry) => (
										<div
											key={entry.id}
											className="p-4 rounded-lg app-bg-surface-alt border app-border-default"
										>
											<div className="flex justify-between items-start mb-2">
												<p className="text-xs app-text-muted">
													{new Date(entry.date).toLocaleDateString()} at{" "}
													{new Date(entry.date).toLocaleTimeString()}
												</p>
												<span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
													Score: {entry.integrityScore}
												</span>
											</div>
											<p className="text-sm app-text-subtle whitespace-pre-wrap">
												{entry.content}
											</p>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}

			{/* AI Suggestions Widget */}
			{settings.visibleWidgets.aiSuggestions && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Brain className="h-5 w-5" />
							AI Insights & Suggestions
						</CardTitle>
						<CardDescription>
							Personalized recommendations based on your alignment patterns
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{aiSuggestions.map((suggestion, idx) => (
								<div
									key={idx}
									className="flex gap-3 items-start p-3 rounded-lg app-bg-surface-alt border app-border-default"
								>
									<Lightbulb className="h-5 w-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
									<p className="text-sm app-text-subtle">{suggestion}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
