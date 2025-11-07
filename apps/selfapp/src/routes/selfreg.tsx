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
	createSelfRegEntry,
	deleteSelfRegEntry,
	listSelfRegEntries,
	type SelfRegEntry,
} from "@/lib/api-client-entities";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getMessageClassName } from "@/lib/ui-utils";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Sparkles, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/selfreg")({
	component: RouteComponent,
});

function RouteComponent() {
	const [entries, setEntries] = useState<SelfRegEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const [trigger, setTrigger] = useState("");
	const [distraction, setDistraction] = useState("");
	const [choice, setChoice] = useState("");
	const [identity, setIdentity] = useState<"inward" | "outward">("inward");
	const [saveMessage, setSaveMessage] = useState("");

	// Load entries from API
	useEffect(() => {
		const loadEntries = async () => {
			try {
				setLoading(true);
				const data = await listSelfRegEntries();
				// Sort by createdAt descending (most recent first)
				const sorted = data.sort(
					(a, b) =>
						new Date(b.createdAt || "").getTime() -
						new Date(a.createdAt || "").getTime(),
				);
				setEntries(sorted);
			} catch (error) {
				console.error("Failed to load self-reg entries:", error);
				const authError = getAuthErrorMessage(error);
				if (authError) {
					setSaveMessage(authError);
				} else {
					const errorMessage = error instanceof Error ? error.message : "Unknown error";
					setSaveMessage(`Failed to load entries: ${errorMessage}`);
				}
			} finally {
				setLoading(false);
			}
		};
		loadEntries();
	}, []);

	const resetForm = () => {
		setTrigger("");
		setDistraction("");
		setChoice("");
		setIdentity("inward");
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!trigger.trim() || !choice.trim()) {
			setSaveMessage("Please fill Trigger and Choice (2 required fields).");
			setTimeout(() => setSaveMessage(""), 2500);
			return;
		}

		setSubmitting(true);
		try {
			const entry = await createSelfRegEntry({
				trigger: trigger.trim(),
				distraction: distraction.trim() || null,
				choice: choice.trim(),
				identity,
			});

			setEntries((prev) => [entry, ...prev]);
			setSaveMessage("Saved successfully!");
			setTimeout(() => setSaveMessage(""), 2000);
			resetForm();
		} catch (error) {
			console.error("Failed to save entry:", error);
			const authError = getAuthErrorMessage(error);
			if (authError) {
				setSaveMessage(authError);
			} else {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				setSaveMessage(`Failed to save: ${errorMessage}`);
			}
			setTimeout(() => setSaveMessage(""), 5000);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (entryId: string | undefined) => {
		if (!entryId) return;
		if (!confirm("Are you sure you want to delete this entry?")) return;

		try {
			await deleteSelfRegEntry(entryId);
			setEntries((prev) => prev.filter((e) => e.entryId !== entryId));
			setSaveMessage("Entry deleted");
			setTimeout(() => setSaveMessage(""), 2000);
		} catch (error) {
			console.error("Failed to delete entry:", error);
			const authError = getAuthErrorMessage(error);
			if (authError) {
				setSaveMessage(authError);
			} else {
				const errorMessage = error instanceof Error ? error.message : "Unknown error";
				setSaveMessage(`Failed to delete: ${errorMessage}`);
			}
			setTimeout(() => setSaveMessage(""), 5000);
		}
	};

	// Coach summary for last 7 entries (or last 7 days if available)
	const coachSummary = () => {
		if (entries.length < 7) return null;
		const last7 = entries.slice(-7);
		const freq = (arr: string[]) =>
			Object.entries(
				arr.reduce<Record<string, number>>((acc, v) => {
					const k = v.toLowerCase();
					acc[k] = (acc[k] || 0) + 1;
					return acc;
				}, {}),
			).sort((a, b) => b[1] - a[1]);

		const triggers = freq(last7.map((e) => e.trigger));
		const distractions = freq(last7.map((e) => e.distraction || ""));
		const mostTrigger = triggers.length > 0 ? triggers[0][0] : null;
		const mostImpulse = distractions.length > 0 ? distractions[0][0] : null;
		const outwardCount = last7.filter((e) => e.identity === "outward").length;
		const outwardPct = Math.round((outwardCount / last7.length) * 100);

		if (mostImpulse && mostImpulse !== "") {
			return `The most common impulse this week was "${mostImpulse}" — and ${outwardPct}% of the time you chose outward.`;
		}

		if (mostTrigger) {
			return `Most of your triggers this week come from "${mostTrigger}".`;
		}

		return null;
	};

	const summary = coachSummary();

	if (loading) {
		return (
			<Card>
				<CardContent className="p-12 text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
					<p className="app-text-subtle">Loading your entries...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Log a Moment of Becoming</h1>
				<p className="text-sm app-text-subtle mt-1">
					4 quick fields — 6–15 seconds per entry
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>New Entry</CardTitle>
					<CardDescription>Capture a self-regulation moment</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label>What set this off?</Label>
							<Input
								placeholder="e.g., stress, boredom, hunger, phone"
								value={trigger}
								onChange={(e) => setTrigger(e.target.value)}
								disabled={submitting}
							/>
						</div>

						<div>
							<Label>What did you WANT to do?</Label>
							<Input
								placeholder="scroll, sugar, withdraw, lash out"
								value={distraction}
								onChange={(e) => setDistraction(e.target.value)}
								disabled={submitting}
							/>
						</div>

						<div>
							<Label>What did you CHOOSE instead?</Label>
							<Textarea
								placeholder="e.g., took 3 slow breaths"
								value={choice}
								onChange={(e) => setChoice(e.target.value)}
								rows={2}
								disabled={submitting}
							/>
						</div>

						<div>
							<Label>Identity tag</Label>
							<div className="flex gap-2 mt-2">
								<button
									type="button"
									className={`px-3 py-2 rounded ${identity === "inward" ? "bg-zinc-200 dark:bg-zinc-700" : "border"}`}
									onClick={() => setIdentity("inward")}
									disabled={submitting}
								>
									⬅ inward
								</button>
								<button
									type="button"
									className={`px-3 py-2 rounded ${identity === "outward" ? "bg-zinc-200 dark:bg-zinc-700" : "border"}`}
									onClick={() => setIdentity("outward")}
									disabled={submitting}
								>
									outward ➡
								</button>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={() => handleSubmit()}
								size="lg"
								className="flex-1"
								disabled={submitting}
							>
								{submitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
									</>
								) : (
									<>
										<Check className="mr-2 h-4 w-4" /> Save
									</>
								)}
							</Button>
							<Button
								variant="outline"
								onClick={resetForm}
								size="lg"
								disabled={submitting}
							>
								Clear
							</Button>
						</div>
						{saveMessage && (
							<p className={getMessageClassName(saveMessage)}>{saveMessage}</p>
						)}
					</form>
				</CardContent>
			</Card>

			{summary && (
				<Card className="bg-amber-50 border-amber-200">
					<CardContent>
						<div className="flex items-center gap-3">
							<Sparkles className="w-5 h-5 text-amber-700" />
							<p className="text-sm text-amber-900">{summary}</p>
						</div>
					</CardContent>
				</Card>
			)}

			{entries.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Recent Moments</CardTitle>
						<CardDescription>{entries.length} total entries</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{entries.slice(0, 20).map((e) => (
								<div key={e.entryId} className="border rounded p-3">
									<div className="flex justify-between items-start gap-3">
										<div className="flex-1">
											<p className="font-medium">{e.choice}</p>
											<p className="text-xs app-text-muted">
												{new Date(e.createdAt || "").toLocaleString()}
											</p>
										</div>
										<div className="text-right flex-shrink-0">
											<p className="text-xs app-text-subtle">
												Trigger: {e.trigger}
											</p>
											{e.distraction && (
												<p className="text-xs app-text-subtle">
													Impulse: {e.distraction}
												</p>
											)}
											<p className="text-xs font-medium">
												{e.identity === "outward" ? "outward ➡" : "⬅ inward"}
											</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDelete(e.entryId)}
											className="h-8 w-8 p-0"
										>
											<Trash2 className="h-4 w-4 text-red-500" />
										</Button>
									</div>
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
