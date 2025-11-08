import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
	Edit2,
	Heart,
	Plus,
	Target,
	TrendingUp,
	User,
	X,
	Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/identity")({
	component: RouteComponent,
});

interface IdentityStatement {
	id: string;
	statement: string;
	category: "being" | "doing" | "value";
}

interface ActionCommitment {
	id: string;
	action: string;
	completed: boolean;
}

function RouteComponent() {
	// Identity statements management
	const [identityStatements, setIdentityStatements] = useState<
		IdentityStatement[]
	>([
		{
			id: "1",
			statement: "I am someone who values personal growth",
			category: "being",
		},
		{
			id: "2",
			statement: "I am disciplined and take consistent action",
			category: "doing",
		},
		{
			id: "3",
			statement: "Integrity and authenticity guide my choices",
			category: "value",
		},
	]);

	const [newStatement, setNewStatement] = useState("");
	const [newCategory, setNewCategory] = useState<"being" | "doing" | "value">(
		"being",
	);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingText, setEditingText] = useState("");

	// Action commitments management
	const [actionCommitments, setActionCommitments] = useState<
		ActionCommitment[]
	>([
		{
			id: "1",
			action: "Practice gratitude journaling daily",
			completed: false,
		},
		{
			id: "2",
			action: "Exercise 30 minutes to embody health",
			completed: false,
		},
		{ id: "3", action: "Read for personal development", completed: true },
	]);

	const [newAction, setNewAction] = useState("");

	// Handlers for identity statements
	const handleAddStatement = () => {
		if (newStatement.trim()) {
			setIdentityStatements([
				...identityStatements,
				{
					id: Date.now().toString(),
					statement: newStatement,
					category: newCategory,
				},
			]);
			setNewStatement("");
		}
	};

	const handleDeleteStatement = (id: string) => {
		setIdentityStatements(identityStatements.filter((s) => s.id !== id));
	};

	const handleStartEdit = (id: string, text: string) => {
		setEditingId(id);
		setEditingText(text);
	};

	const handleSaveEdit = () => {
		if (editingId && editingText.trim()) {
			setIdentityStatements(
				identityStatements.map((s) =>
					s.id === editingId ? { ...s, statement: editingText } : s,
				),
			);
			setEditingId(null);
			setEditingText("");
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditingText("");
	};

	// Handlers for action commitments
	const handleAddAction = () => {
		if (newAction.trim()) {
			setActionCommitments([
				...actionCommitments,
				{
					id: Date.now().toString(),
					action: newAction,
					completed: false,
				},
			]);
			setNewAction("");
		}
	};

	const handleToggleAction = (id: string) => {
		setActionCommitments(
			actionCommitments.map((a) =>
				a.id === id ? { ...a, completed: !a.completed } : a,
			),
		);
	};

	const handleDeleteAction = (id: string) => {
		setActionCommitments(actionCommitments.filter((a) => a.id !== id));
	};

	// Count statements by category
	const countByCategory = {
		being: identityStatements.filter((s) => s.category === "being").length,
		doing: identityStatements.filter((s) => s.category === "doing").length,
		value: identityStatements.filter((s) => s.category === "value").length,
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold app-text-strong">
					Manage Your Identity
				</h1>
				<p className="text-sm app-text-subtle italic">
					"The strongest force in the human personality is the need to stay
					consistent with how we define ourselves"
				</p>
				<p className="text-xs app-text-muted">
					— Tony Robbins on Identity as the Driving Force
				</p>
			</div>

			{/* Core Principles */}
			<Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-blue-900">
						<Target className="w-5 h-5" />
						Tony Robbins: The Power of Identity
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-blue-800">
					<div className="flex items-start gap-2">
						<User className="w-4 h-4 mt-1 flex-shrink-0" />
						<div>
							<strong>Identity is the Driving Force:</strong> The strongest
							force in human personality is the need to stay consistent with who
							you believe you are. Change your identity, change your life.
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Heart className="w-4 h-4 mt-1 flex-shrink-0" />
						<div>
							<strong>The Power of Being:</strong> Move from self-justification
							("That's just how I am") to self-mastery ("How can I flex, adapt,
							and grow?"). Become more fully, consciously yourself.
						</div>
					</div>
					<div className="flex items-start gap-2">
						<Zap className="w-4 h-4 mt-1 flex-shrink-0" />
						<div>
							<strong>Massive Action:</strong> "The path to success is to take
							massive determined action." Action creates momentum and is the
							cure for difficult situations.
						</div>
					</div>
					<div className="flex items-start gap-2">
						<TrendingUp className="w-4 h-4 mt-1 flex-shrink-0" />
						<div>
							<strong>Balance of Both:</strong> True transformation aligns
							beliefs and values to naturally take action. Your character
							(being) influences your actions (doing), and actions reinforce
							character.
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Identity Balance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="border-l-4 border-l-purple-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">
							Being (Character)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold text-purple-600">
							{countByCategory.being}
						</p>
						<p className="text-xs text-gray-500 mt-1">Identity statements</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-blue-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Values</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold text-blue-600">
							{countByCategory.value}
						</p>
						<p className="text-xs text-gray-500 mt-1">Core values defined</p>
					</CardContent>
				</Card>

				<Card className="border-l-4 border-l-green-500">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">
							Doing (Actions)
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold text-green-600">
							{countByCategory.doing}
						</p>
						<p className="text-xs text-gray-500 mt-1">Action-based traits</p>
					</CardContent>
				</Card>
			</div>

			{/* Identity Statements */}
			<Card>
				<CardHeader>
					<CardTitle>Your Identity Statements</CardTitle>
					<CardDescription>
						Define who you are at your core. Your actions will naturally align
						with these self-definitions.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Add new statement */}
					<div className="flex flex-col md:flex-row gap-2">
						<select
							value={newCategory}
							onChange={(e) =>
								setNewCategory(e.target.value as "being" | "doing" | "value")
							}
							className="p-2 border rounded md:w-40"
						>
							<option value="being">Being</option>
							<option value="doing">Doing</option>
							<option value="value">Value</option>
						</select>
						<input
							type="text"
							value={newStatement}
							onChange={(e) => setNewStatement(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleAddStatement();
								}
							}}
							placeholder="I am someone who..."
							className="flex-1 p-2 border rounded"
						/>
						<Button onClick={handleAddStatement} className="gap-2">
							<Plus className="w-4 h-4" />
							Add
						</Button>
					</div>

					{/* List of statements */}
					<div className="space-y-2">
						{identityStatements.map((statement) => (
							<div
								key={statement.id}
								className={`p-3 rounded-lg border-l-4 ${
									statement.category === "being"
										? "border-l-purple-500 bg-purple-50"
										: statement.category === "value"
											? "border-l-blue-500 bg-blue-50"
											: "border-l-green-500 bg-green-50"
								}`}
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<span
											className={`text-xs font-semibold uppercase tracking-wide ${
												statement.category === "being"
													? "text-purple-700"
													: statement.category === "value"
														? "text-blue-700"
														: "text-green-700"
											}`}
										>
											{statement.category}
										</span>
										{editingId === statement.id ? (
											<div className="mt-1 flex gap-2">
												<input
													type="text"
													value={editingText}
													onChange={(e) => setEditingText(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															handleSaveEdit();
														} else if (e.key === "Escape") {
															handleCancelEdit();
														}
													}}
													className="flex-1 p-1 border rounded text-sm"
												/>
												<Button
													size="sm"
													variant="ghost"
													onClick={handleSaveEdit}
												>
													Save
												</Button>
												<Button
													size="sm"
													variant="ghost"
													onClick={handleCancelEdit}
												>
													Cancel
												</Button>
											</div>
										) : (
											<p className="text-sm mt-1 app-text-strong">
												{statement.statement}
											</p>
										)}
									</div>
									{editingId !== statement.id && (
										<div className="flex gap-1">
											<button
												type="button"
												onClick={() =>
													handleStartEdit(statement.id, statement.statement)
												}
												className="p-1 hover:bg-white rounded"
												aria-label="Edit statement"
											>
												<Edit2 className="w-4 h-4 text-gray-500" />
											</button>
											<button
												type="button"
												onClick={() => handleDeleteStatement(statement.id)}
												className="p-1 hover:bg-white rounded"
												aria-label="Delete statement"
											>
												<X className="w-4 h-4 text-gray-500" />
											</button>
										</div>
									)}
								</div>
							</div>
						))}

						{identityStatements.length === 0 && (
							<p className="text-center text-gray-500 py-8">
								No identity statements yet. Add your first one above!
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Massive Action Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="w-5 h-5 text-yellow-500" />
						Massive Action Commitments
					</CardTitle>
					<CardDescription>
						"The path to success is to take massive determined action." — Tony
						Robbins
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Add new action */}
					<div className="flex gap-2">
						<input
							type="text"
							value={newAction}
							onChange={(e) => setNewAction(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleAddAction();
								}
							}}
							placeholder="Action that aligns with your identity..."
							className="flex-1 p-2 border rounded"
						/>
						<Button onClick={handleAddAction} className="gap-2">
							<Plus className="w-4 h-4" />
							Add
						</Button>
					</div>

					{/* List of actions */}
					<div className="space-y-2">
						{actionCommitments.map((commitment) => (
							<div
								key={commitment.id}
								className={`p-3 rounded-lg border ${
									commitment.completed
										? "bg-green-50 border-green-200"
										: "bg-gray-50 border-gray-200"
								}`}
							>
								<div className="flex items-center justify-between gap-2">
									<label className="flex items-center gap-3 flex-1 cursor-pointer">
										<input
											type="checkbox"
											checked={commitment.completed}
											onChange={() => handleToggleAction(commitment.id)}
											className="w-5 h-5"
										/>
										<span
											className={`text-sm ${
												commitment.completed
													? "line-through text-gray-500"
													: "app-text-strong"
											}`}
										>
											{commitment.action}
										</span>
									</label>
									<button
										type="button"
										onClick={() => handleDeleteAction(commitment.id)}
										className="p-1 hover:bg-white rounded"
										aria-label="Delete action"
									>
										<X className="w-4 h-4 text-gray-500" />
									</button>
								</div>
							</div>
						))}

						{actionCommitments.length === 0 && (
							<p className="text-center text-gray-500 py-8">
								No action commitments yet. Add your first one above!
							</p>
						)}
					</div>

					{/* Progress summary */}
					<div className="pt-2 border-t">
						<p className="text-sm app-text-subtle">
							<strong>
								{actionCommitments.filter((a) => a.completed).length} of{" "}
								{actionCommitments.length}
							</strong>{" "}
							actions completed
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Key Insights */}
			<Card className="bg-amber-50 border-amber-200">
				<CardContent className="pt-6">
					<div className="space-y-3 text-sm text-amber-900">
						<p className="font-bold flex items-center gap-2">
							<TrendingUp className="w-4 h-4" />
							The Continuous Loop of Transformation:
						</p>
						<p>
							Your beliefs and values shape your identity → Your identity drives
							your actions → Your actions reinforce your identity → Your
							identity evolves through consistent action
						</p>
						<p className="italic pt-2 border-t border-amber-300">
							"It's not about self-justification ('That's just how I am'). It's
							about self-mastery ('How can I flex, adapt, and grow to become who
							I'm meant to be')."
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default RouteComponent;
