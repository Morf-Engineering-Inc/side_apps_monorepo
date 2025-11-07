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
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle, Circle, Heart, Sparkles, Target } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/letgod")({
	component: RouteComponent,
});

type SpiritualEntry = {
	id: number;
	date: string;
	situation: string;
	seekingPrompt: string;
	holyGhostGuidance: string;
	myDesire: string;
	godsWill: string;
	actionTaken: string;
	alignment: "aligned" | "partial" | "struggling";
	reflection: string;
};

const STORAGE_KEY = "letgod:entries";

function RouteComponent() {
	const [entries, setEntries] = useState<SpiritualEntry[]>([]);
	const [situation, setSituation] = useState("");
	const [seekingPrompt, setSeekingPrompt] = useState("");
	const [holyGhostGuidance, setHolyGhostGuidance] = useState("");
	const [myDesire, setMyDesire] = useState("");
	const [godsWill, setGodsWill] = useState("");
	const [actionTaken, setActionTaken] = useState("");
	const [alignment, setAlignment] = useState<
		"aligned" | "partial" | "struggling"
	>("aligned");
	const [reflection, setReflection] = useState("");
	const [saveMessage, setSaveMessage] = useState("");

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				setEntries(JSON.parse(saved));
			} catch (e) {
				console.error("Failed to parse Let God Prevail entries", e);
			}
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	}, [entries]);

	const resetForm = () => {
		setSituation("");
		setSeekingPrompt("");
		setHolyGhostGuidance("");
		setMyDesire("");
		setGodsWill("");
		setActionTaken("");
		setAlignment("aligned");
		setReflection("");
	};

	const handleSubmit = (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!situation.trim() || !actionTaken.trim()) {
			setSaveMessage("Please fill in the situation and action taken.");
			setTimeout(() => setSaveMessage(""), 2500);
			return;
		}

		const entry: SpiritualEntry = {
			id: Date.now(),
			date: new Date().toISOString(),
			situation: situation.trim(),
			seekingPrompt: seekingPrompt.trim(),
			holyGhostGuidance: holyGhostGuidance.trim(),
			myDesire: myDesire.trim(),
			godsWill: godsWill.trim(),
			actionTaken: actionTaken.trim(),
			alignment,
			reflection: reflection.trim(),
		};

		setEntries((prev) => [...prev, entry]);
		setSaveMessage("Entry saved with gratitude 🙏");
		setTimeout(() => setSaveMessage(""), 3000);
		resetForm();
	};

	const alignmentStats = () => {
		if (entries.length === 0) return null;
		const recent = entries.slice(-10);
		const alignedCount = recent.filter((e) => e.alignment === "aligned").length;
		const partialCount = recent.filter((e) => e.alignment === "partial").length;
		const strugglingCount = recent.filter(
			(e) => e.alignment === "struggling",
		).length;

		return {
			alignedCount,
			partialCount,
			strugglingCount,
			total: recent.length,
		};
	};

	const stats = alignmentStats();

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold app-text-strong">Let God Prevail</h1>
				<p className="text-lg app-text-subtle">
					"My ability to seek and receive my determination in seeking and
					receiving my ability to receive and respond to the Holy Ghost"
				</p>
				<p className="text-sm app-text-muted italic">
					Aligning my desires with God's will
				</p>
			</div>

			{stats && stats.total > 0 && (
				<Card className="app-bg-surface-alt app-border-default border">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Heart className="w-5 h-5 text-blue-600" />
								<span className="font-medium app-text-strong">
									Recent Alignment (last 10 entries)
								</span>
							</div>
							<div className="flex gap-4 text-sm">
								<Badge
									variant="default"
									className="bg-green-100 text-green-800 hover:bg-green-100"
								>
									Aligned: {stats.alignedCount}
								</Badge>
								<Badge
									variant="secondary"
									className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
								>
									Partial: {stats.partialCount}
								</Badge>
								<Badge
									variant="outline"
									className="bg-red-50 text-red-700 border-red-200"
								>
									Struggling: {stats.strugglingCount}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 app-text-strong">
						<Sparkles className="w-5 h-5 text-purple-600" />
						New Spiritual Moment
					</CardTitle>
					<CardDescription className="app-text-subtle">
						Record a moment of seeking divine guidance and aligning with God's
						will
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<Label
								htmlFor="situation"
								className="app-text-strong font-medium"
							>
								Situation or Decision
							</Label>
							<Textarea
								id="situation"
								placeholder="Describe the situation where you needed divine guidance..."
								value={situation}
								onChange={(e) => setSituation(e.target.value)}
								rows={2}
							/>
						</div>

						<div>
							<Label htmlFor="seeking" className="app-text-strong font-medium">
								How did you seek the Holy Ghost's guidance?
							</Label>
							<Textarea
								id="seeking"
								placeholder="Prayer, scripture study, temple attendance, fasting, quiet reflection..."
								value={seekingPrompt}
								onChange={(e) => setSeekingPrompt(e.target.value)}
								rows={2}
							/>
						</div>

						<div>
							<Label htmlFor="guidance" className="app-text-strong font-medium">
								What guidance did you receive?
							</Label>
							<Textarea
								id="guidance"
								placeholder="Describe the impressions, feelings, thoughts, or promptings you received..."
								value={holyGhostGuidance}
								onChange={(e) => setHolyGhostGuidance(e.target.value)}
								rows={2}
							/>
						</div>

						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<Label
									htmlFor="myDesire"
									className="app-text-strong font-medium"
								>
									My Desires
								</Label>
								<Textarea
									id="myDesire"
									placeholder="What did I want or prefer?"
									value={myDesire}
									onChange={(e) => setMyDesire(e.target.value)}
									rows={3}
								/>
							</div>
							<div>
								<Label
									htmlFor="godsWill"
									className="app-text-strong font-medium"
								>
									God's Will (as I understand it)
								</Label>
								<Textarea
									id="godsWill"
									placeholder="What do I sense God wants?"
									value={godsWill}
									onChange={(e) => setGodsWill(e.target.value)}
									rows={3}
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="action" className="app-text-strong font-medium">
								What action did you take?
							</Label>
							<Textarea
								id="action"
								placeholder="Describe what you chose to do..."
								value={actionTaken}
								onChange={(e) => setActionTaken(e.target.value)}
								rows={2}
							/>
						</div>

						<div>
							<Label className="app-text-strong font-medium">
								Alignment Assessment
							</Label>
							<div className="flex gap-3 mt-2">
								<button
									type="button"
									className={`flex items-center gap-2 px-4 py-2 rounded-lg border app-border-default transition-colors ${
										alignment === "aligned"
											? "bg-green-100 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-100"
											: "app-bg-surface-alt"
									}`}
									onClick={() => setAlignment("aligned")}
								>
									<CheckCircle className="w-4 h-4" />
									Aligned
								</button>
								<button
									type="button"
									className={`flex items-center gap-2 px-4 py-2 rounded-lg border app-border-default transition-colors ${
										alignment === "partial"
											? "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100"
											: "app-bg-surface-alt"
									}`}
									onClick={() => setAlignment("partial")}
								>
									<Target className="w-4 h-4" />
									Partial
								</button>
								<button
									type="button"
									className={`flex items-center gap-2 px-4 py-2 rounded-lg border app-border-default transition-colors ${
										alignment === "struggling"
											? "bg-red-100 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-100"
											: "app-bg-surface-alt"
									}`}
									onClick={() => setAlignment("struggling")}
								>
									<Circle className="w-4 h-4" />
									Struggling
								</button>
							</div>
						</div>

						<div>
							<Label
								htmlFor="reflection"
								className="app-text-strong font-medium"
							>
								Reflection & Gratitude
							</Label>
							<Textarea
								id="reflection"
								placeholder="What did you learn? How did this experience strengthen your relationship with God?"
								value={reflection}
								onChange={(e) => setReflection(e.target.value)}
								rows={3}
							/>
						</div>

						<div className="flex gap-2">
							<Button
								type="submit"
								size="lg"
								className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
							>
								<Heart className="mr-2 h-4 w-4" />
								Save with Gratitude
							</Button>
							<Button variant="outline" onClick={resetForm} size="lg">
								Clear
							</Button>
						</div>
						{saveMessage && (
							<p className="text-sm text-center font-medium text-blue-600 dark:text-blue-400">
								{saveMessage}
							</p>
						)}
					</form>
				</CardContent>
			</Card>

			{entries.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Spiritual Journey Entries</CardTitle>
						<CardDescription>
							Your moments of seeking and receiving divine guidance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{entries
								.slice(-5)
								.reverse()
								.map((entry) => (
									<div
										key={entry.id}
										className="border app-border-default rounded-lg p-4 space-y-3 app-bg-surface-alt"
									>
										<div className="flex justify-between items-start">
											<div>
												<h4 className="font-semibold app-text-strong">
													{entry.situation}
												</h4>
												<p className="text-xs app-text-muted">
													{new Date(entry.date).toLocaleString()}
												</p>
											</div>
											<Badge
												variant={
													entry.alignment === "aligned"
														? "default"
														: entry.alignment === "partial"
															? "secondary"
															: "outline"
												}
												className={
													entry.alignment === "aligned"
														? "bg-green-100 text-green-800 hover:bg-green-100"
														: entry.alignment === "partial"
															? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
															: "bg-red-50 text-red-700 border-red-200"
												}
											>
												{entry.alignment}
											</Badge>
										</div>

										{entry.holyGhostGuidance && (
											<div>
												<p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
													Divine Guidance
												</p>
												<p className="text-sm app-text-subtle italic">
													"{entry.holyGhostGuidance}"
												</p>
											</div>
										)}

										<div>
											<p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
												Action Taken
											</p>
											<p className="text-sm app-text-subtle">
												{entry.actionTaken}
											</p>
										</div>

										{entry.reflection && (
											<div>
												<p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
													Reflection
												</p>
												<p className="text-sm app-text-subtle">
													{entry.reflection}
												</p>
											</div>
										)}
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export default RouteComponent;
