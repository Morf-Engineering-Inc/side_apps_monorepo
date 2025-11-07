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
import { Textarea } from "@/components/ui/textarea";
import {
	createSuccessDefinition,
	listSuccessDefinitions,
	updateSuccessDefinition,
	type SuccessDefinition,
} from "@/lib/api-client-entities";
import { createFileRoute } from "@tanstack/react-router";
import {
	BookOpen,
	Brain,
	CheckCircle,
	Compass,
	Crown,
	Heart,
	Loader2,
	Plus,
	Shield,
	Sparkles,
	Star,
	Target,
	TrendingUp,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/success")({
	component: RouteComponent,
});

interface GuidingPrinciple {
	id: number;
	principle: string;
	scripture: string;
	commitment: string;
	dateCreated: string;
}

function RouteComponent() {
	const [definition, setDefinition] = useState<SuccessDefinition | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const [vision, setVision] = useState("");
	const [divineCapacities, setDivineCapacities] = useState<string[]>([""]);
	const [selfMasteryGoals, setSelfMasteryGoals] = useState<string[]>([""]);
	const [principles, setPrinciples] = useState<GuidingPrinciple[]>([]);
	const [temporalGoals, setTemporalGoals] = useState("");
	const [spiritualGoals, setSpiritualGoals] = useState("");
	const [characterGoals, setCharacterGoals] = useState("");
	const [intelligenceGoals, setIntelligenceGoals] = useState("");
	const [saveMessage, setSaveMessage] = useState("");

	// New principle form
	const [newPrinciple, setNewPrinciple] = useState("");
	const [newScripture, setNewScripture] = useState("");
	const [newCommitment, setNewCommitment] = useState("");

	// Load success definition from API
	useEffect(() => {
		const loadDefinition = async () => {
			try {
				setLoading(true);
				const definitions = await listSuccessDefinitions();
				// Get the most recent one (should only be one per user)
				if (definitions.length > 0) {
					const latest = definitions[0];
					setDefinition(latest);
					setVision(latest.vision || "");
					setDivineCapacities(latest.divineCapacities || [""]);
					setSelfMasteryGoals(latest.selfMasteryGoals || [""]);
					setPrinciples(latest.principles || []);
					setTemporalGoals(latest.temporalGoals || "");
					setSpiritualGoals(latest.spiritualGoals || "");
					setCharacterGoals(latest.characterGoals || "");
					setIntelligenceGoals(latest.intelligenceGoals || "");
				}
			} catch (error) {
				console.error("Failed to load success definition:", error);
				setSaveMessage("Failed to load data. Please refresh.");
			} finally {
				setLoading(false);
			}
		};
		loadDefinition();
	}, []);

	const addDivineCapacity = () => {
		setDivineCapacities([...divineCapacities, ""]);
	};

	const updateDivineCapacity = (index: number, value: string) => {
		const updated = [...divineCapacities];
		updated[index] = value;
		setDivineCapacities(updated);
	};

	const removeDivineCapacity = (index: number) => {
		if (divineCapacities.length > 1) {
			const updated = divineCapacities.filter((_, i) => i !== index);
			setDivineCapacities(updated);
		}
	};

	const addSelfMasteryGoal = () => {
		setSelfMasteryGoals([...selfMasteryGoals, ""]);
	};

	const updateSelfMasteryGoal = (index: number, value: string) => {
		const updated = [...selfMasteryGoals];
		updated[index] = value;
		setSelfMasteryGoals(updated);
	};

	const removeSelfMasteryGoal = (index: number) => {
		if (selfMasteryGoals.length > 1) {
			const updated = selfMasteryGoals.filter((_, i) => i !== index);
			setSelfMasteryGoals(updated);
		}
	};

	const addPrinciple = () => {
		if (!newPrinciple.trim()) return;

		const principle: GuidingPrinciple = {
			id: Date.now(),
			principle: newPrinciple.trim(),
			scripture: newScripture.trim(),
			commitment: newCommitment.trim(),
			dateCreated: new Date().toISOString(),
		};

		setPrinciples([...principles, principle]);
		setNewPrinciple("");
		setNewScripture("");
		setNewCommitment("");
	};

	const removePrinciple = (id: number) => {
		setPrinciples(principles.filter((p) => p.id !== id));
	};

	const saveDefinition = async () => {
		const successDef = {
			vision: vision.trim(),
			divineCapacities: divineCapacities.filter(Boolean),
			selfMasteryGoals: selfMasteryGoals.filter(Boolean),
			principles,
			temporalGoals: temporalGoals.trim(),
			spiritualGoals: spiritualGoals.trim(),
			characterGoals: characterGoals.trim(),
			intelligenceGoals: intelligenceGoals.trim(),
		};

		setSubmitting(true);
		try {
			let savedDef: SuccessDefinition;
			if (definition?.entryId) {
				// Update existing definition
				savedDef = await updateSuccessDefinition(
					definition.entryId,
					successDef,
				);
			} else {
				// Create new definition
				savedDef = await createSuccessDefinition(successDef);
			}

			setDefinition(savedDef);
			setSaveMessage("Success definition saved! 🌟");
			setTimeout(() => setSaveMessage(""), 3000);
		} catch (error) {
			console.error("Failed to save success definition:", error);
			setSaveMessage("Failed to save. Please try again.");
			setTimeout(() => setSaveMessage(""), 3000);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
					<p className="app-text-subtle">Loading your success definition...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6 max-w-5xl mx-auto">
			<div className="text-center space-y-3">
				<div className="flex items-center justify-center gap-2 mb-2">
					<Crown className="w-8 h-8 text-yellow-600" />
					<Target className="w-8 h-8 text-blue-600" />
				</div>
				<h1 className="text-4xl font-bold app-text-strong">Define Success</h1>
				<p className="text-lg app-text-subtle max-w-2xl mx-auto">
					"I urge you to discern through the Spirit your divinely given
					capacities"
				</p>
				<p className="text-sm app-text-muted italic">
					Begin with the end in mind — align your success with eternal
					principles
				</p>
			</div>

			{/* Inspirational Quotes */}
			<Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950/50 dark:to-purple-950/50 dark:border-blue-800">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 app-text-strong">
						<BookOpen className="w-5 h-5 text-blue-600" />
						Guiding Wisdom
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<blockquote className="text-sm app-text-subtle italic border-l-2 border-blue-300 pl-3">
							"He that is slow to anger is better than the mighty; and he that
							ruleth his spirit than he that taketh a city."
							<cite className="block text-xs app-text-muted mt-1 not-italic">
								— Proverbs 16:32
							</cite>
						</blockquote>
						<blockquote className="text-sm app-text-subtle italic border-l-2 border-purple-300 pl-3">
							"Success is gauged by self-mastery. Character is determined by the
							extent to which we can master ourselves toward good ends."
							<cite className="block text-xs app-text-muted mt-1 not-italic">
								— President N. Eldon Tanner
							</cite>
						</blockquote>
					</div>
				</CardContent>
			</Card>

			{/* Vision Statement */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 app-text-strong">
						<Compass className="w-5 h-5 text-purple-600" />
						Your North Star Vision
					</CardTitle>
					<CardDescription className="app-text-subtle">
						What does success look like when viewed through eternal perspective?
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Textarea
						placeholder="Describe your vision of success — how you want to become, what legacy you want to leave, how you want to serve God and others..."
						value={vision}
						onChange={(e) => setVision(e.target.value)}
						rows={4}
						className="text-base"
					/>
				</CardContent>
			</Card>

			{/* Divine Capacities */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 app-text-strong">
						<Star className="w-5 h-5 text-yellow-600" />
						Divinely Given Capacities
					</CardTitle>
					<CardDescription className="app-text-subtle">
						What unique gifts, talents, and abilities has God given you to
						develop?
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{divineCapacities.map((capacity, index) => (
						<div key={index} className="flex gap-2 items-center">
							<Input
								placeholder={`Divine capacity ${index + 1} (e.g., Leadership, Compassion, Teaching, Creative Vision...)`}
								value={capacity}
								onChange={(e) => updateDivineCapacity(index, e.target.value)}
								className="flex-1"
							/>
							{divineCapacities.length > 1 && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => removeDivineCapacity(index)}
								>
									<X className="w-4 h-4" />
								</Button>
							)}
						</div>
					))}
					<Button
						type="button"
						variant="outline"
						onClick={addDivineCapacity}
						className="w-full"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Another Capacity
					</Button>
				</CardContent>
			</Card>

			{/* Self-Mastery Goals */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 app-text-strong">
						<Shield className="w-5 h-5 text-green-600" />
						Self-Mastery Goals
					</CardTitle>
					<CardDescription className="app-text-subtle">
						"He that ruleth his spirit than he that taketh a city" — What
						aspects of yourself will you master?
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{selfMasteryGoals.map((goal, index) => (
						<div key={index} className="flex gap-2 items-center">
							<Input
								placeholder={`Self-mastery goal ${index + 1} (e.g., Control anger, Overcome pride, Master procrastination...)`}
								value={goal}
								onChange={(e) => updateSelfMasteryGoal(index, e.target.value)}
								className="flex-1"
							/>
							{selfMasteryGoals.length > 1 && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => removeSelfMasteryGoal(index)}
								>
									<X className="w-4 h-4" />
								</Button>
							)}
						</div>
					))}
					<Button
						type="button"
						variant="outline"
						onClick={addSelfMasteryGoal}
						className="w-full"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Self-Mastery Goal
					</Button>
				</CardContent>
			</Card>

			{/* Guiding Principles */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 app-text-strong">
						<Heart className="w-5 h-5 text-red-600" />
						Guiding Principles
					</CardTitle>
					<CardDescription className="app-text-subtle">
						"Never compromise [your principles]. Strength comes from making no
						exceptions to guiding principles."
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Existing Principles */}
					{principles.length > 0 && (
						<div className="space-y-3">
							{principles.map((principle) => (
								<div
									key={principle.id}
									className="border rounded-lg p-4 space-y-2"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h4 className="font-semibold app-text-strong">
												{principle.principle}
											</h4>
											{principle.scripture && (
												<p className="text-sm app-text-muted italic">
													"{principle.scripture}"
												</p>
											)}
											{principle.commitment && (
												<p className="text-sm app-text-subtle mt-1">
													{principle.commitment}
												</p>
											)}
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => removePrinciple(principle.id)}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Add New Principle Form */}
					<div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-4 space-y-4">
						<h4 className="font-medium app-text-strong">Add New Principle</h4>
						<div>
							<Label
								htmlFor="newPrinciple"
								className="app-text-strong font-medium"
							>
								Principle Statement
							</Label>
							<Input
								id="newPrinciple"
								placeholder="State your principle clearly and specifically..."
								value={newPrinciple}
								onChange={(e) => setNewPrinciple(e.target.value)}
							/>
						</div>
						<div>
							<Label
								htmlFor="newScripture"
								className="app-text-strong font-medium"
							>
								Supporting Scripture (optional)
							</Label>
							<Input
								id="newScripture"
								placeholder="Reference or quote that supports this principle..."
								value={newScripture}
								onChange={(e) => setNewScripture(e.target.value)}
							/>
						</div>
						<div>
							<Label
								htmlFor="newCommitment"
								className="app-text-strong font-medium"
							>
								Your Commitment (optional)
							</Label>
							<Textarea
								id="newCommitment"
								placeholder="How will you live this principle? What commitment are you making?"
								value={newCommitment}
								onChange={(e) => setNewCommitment(e.target.value)}
								rows={2}
							/>
						</div>
						<Button type="button" onClick={addPrinciple} className="w-full">
							<Plus className="w-4 h-4 mr-2" />
							Add Principle
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Four Dimensions of Success */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Temporal Success */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 app-text-strong">
							<TrendingUp className="w-5 h-5 text-blue-600" />
							Temporal Success
						</CardTitle>
						<CardDescription className="app-text-subtle">
							Career, skills, financial stewardship, earthly achievements
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							placeholder="What does temporal success look like for you? How will you use your professional gifts to serve and build the kingdom?"
							value={temporalGoals}
							onChange={(e) => setTemporalGoals(e.target.value)}
							rows={4}
						/>
					</CardContent>
				</Card>

				{/* Spiritual Success */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 app-text-strong">
							<Sparkles className="w-5 h-5 text-purple-600" />
							Spiritual Success
						</CardTitle>
						<CardDescription className="app-text-subtle">
							Relationship with God, discipleship, eternal perspective
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							placeholder="How will you deepen your relationship with God? What spiritual milestones matter most to you?"
							value={spiritualGoals}
							onChange={(e) => setSpiritualGoals(e.target.value)}
							rows={4}
						/>
					</CardContent>
				</Card>

				{/* Character Success */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 app-text-strong">
							<Heart className="w-5 h-5 text-red-600" />
							Character Success
						</CardTitle>
						<CardDescription className="app-text-subtle">
							Christlike attributes, integrity, love, service to others
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							placeholder="What character traits will you develop? How will you become more Christlike in your relationships and service?"
							value={characterGoals}
							onChange={(e) => setCharacterGoals(e.target.value)}
							rows={4}
						/>
					</CardContent>
				</Card>

				{/* Intelligence Success */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 app-text-strong">
							<Brain className="w-5 h-5 text-green-600" />
							Intelligence Success
						</CardTitle>
						<CardDescription className="app-text-subtle">
							Learning, wisdom, using knowledge for good like God would
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Textarea
							placeholder="How will you continue learning and growing? What knowledge and wisdom do you seek to acquire and share?"
							value={intelligenceGoals}
							onChange={(e) => setIntelligenceGoals(e.target.value)}
							rows={4}
						/>
					</CardContent>
				</Card>
			</div>

			{/* Save Button */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-2">
						<Button
							onClick={saveDefinition}
							size="lg"
							className="w-full"
							disabled={submitting}
						>
							{submitting ? (
								<>
									<Loader2 className="w-5 h-5 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<CheckCircle className="w-5 h-5 mr-2" />
									Save Your Success Definition
								</>
							)}
						</Button>
						{saveMessage && (
							<p
								className={`text-sm text-center ${saveMessage.includes("Failed") ? "text-red-600" : "app-text-strong"}`}
							>
								{saveMessage}
							</p>
						)}
						{definition && definition.updatedAt && (
							<p className="text-xs text-center app-text-muted">
								Last updated:{" "}
								{new Date(definition.updatedAt).toLocaleDateString()}
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Summary Display */}
			{definition && (
				<Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 dark:from-green-950/50 dark:to-blue-950/50 dark:border-green-800">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 app-text-strong">
							<Target className="w-5 h-5 text-green-600" />
							Your Success Framework
						</CardTitle>
						<CardDescription className="app-text-subtle">
							A quick reference to keep you aligned with your eternal
							perspective
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{definition.vision && (
							<div>
								<h4 className="font-medium app-text-strong mb-1">Vision</h4>
								<p className="text-sm app-text-subtle">{definition.vision}</p>
							</div>
						)}

						{definition.divineCapacities.length > 0 && (
							<div>
								<h4 className="font-medium app-text-strong mb-2">
									Divine Capacities
								</h4>
								<div className="flex flex-wrap gap-1">
									{definition.divineCapacities.map((capacity, index) => (
										<Badge key={index} variant="secondary" className="text-xs">
											{capacity}
										</Badge>
									))}
								</div>
							</div>
						)}

						{definition.principles.length > 0 && (
							<div>
								<h4 className="font-medium app-text-strong mb-2">
									Core Principles ({definition.principles.length})
								</h4>
								<div className="space-y-1">
									{definition.principles.slice(0, 3).map((principle) => (
										<p key={principle.id} className="text-xs app-text-muted">
											• {principle.principle}
										</p>
									))}
									{definition.principles.length > 3 && (
										<p className="text-xs app-text-muted">
											+ {definition.principles.length - 3} more principles
										</p>
									)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
