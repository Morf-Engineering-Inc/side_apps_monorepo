import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Bill, ISSUE_CATEGORIES, type IssueCategory } from "@/types";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface PartyCaucusInsightsProps {
	bills: Bill[];
}

interface PartyPosition {
	issueCategory: IssueCategory;
	democraticStance: {
		supportRate: number;
		totalVotes: number;
		keyBills: string[];
		position: string;
	};
	republicanStance: {
		supportRate: number;
		totalVotes: number;
		keyBills: string[];
		position: string;
	};
	partisanship: "Highly Partisan" | "Moderate" | "Bipartisan";
}

export function PartyCaucusInsights({ bills }: PartyCaucusInsightsProps) {
	const [selectedIssue, setSelectedIssue] =
		useState<IssueCategory>("Healthcare");

	// Calculate party positions (mock data - would come from API)
	const calculatePartyPositions = (): PartyPosition[] => {
		return ISSUE_CATEGORIES.map((category) => {
			const categoryBills = bills.filter((b) => b.issueCategory === category);

			// Mock calculations for demonstration
			const demSupport = Math.random() * 100;
			const repSupport = Math.random() * 100;
			const difference = Math.abs(demSupport - repSupport);

			let partisanship: "Highly Partisan" | "Moderate" | "Bipartisan";
			if (difference > 50) partisanship = "Highly Partisan";
			else if (difference > 25) partisanship = "Moderate";
			else partisanship = "Bipartisan";

			return {
				issueCategory: category,
				democraticStance: {
					supportRate: demSupport,
					totalVotes: categoryBills.length,
					keyBills: categoryBills.slice(0, 2).map((b) => b.number),
					position:
						demSupport > 50 ? "Generally supportive" : "Generally opposed",
				},
				republicanStance: {
					supportRate: repSupport,
					totalVotes: categoryBills.length,
					keyBills: categoryBills.slice(0, 2).map((b) => b.number),
					position:
						repSupport > 50 ? "Generally supportive" : "Generally opposed",
				},
				partisanship,
			};
		});
	};

	const partyPositions = calculatePartyPositions();
	const selectedPosition = partyPositions.find(
		(p) => p.issueCategory === selectedIssue,
	);

	const getPartisanshipBadge = (level: string) => {
		switch (level) {
			case "Highly Partisan":
				return <Badge variant="destructive">{level}</Badge>;
			case "Moderate":
				return <Badge variant="secondary">{level}</Badge>;
			case "Bipartisan":
				return (
					<Badge variant="default" className="bg-green-600">
						{level}
					</Badge>
				);
			default:
				return <Badge variant="outline">{level}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header Card */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-2xl flex items-center gap-2">
								<Users className="size-6" />
								Party Caucus Insights
							</CardTitle>
							<CardDescription>
								Understand party positions on major issues without partisan
								bias. See how each party approaches legislation.
							</CardDescription>
						</div>
						<div className="w-64">
							<Select
								value={selectedIssue}
								onValueChange={(value) =>
									setSelectedIssue(value as IssueCategory)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select issue" />
								</SelectTrigger>
								<SelectContent>
									{ISSUE_CATEGORIES.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Tabs for Democratic and Republican Views */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="democratic">Democratic Caucus</TabsTrigger>
					<TabsTrigger value="republican">Republican Caucus</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="size-5" />
								{selectedIssue} - Party Comparison
							</CardTitle>
							<CardDescription>
								Understanding both parties' approaches to{" "}
								{selectedIssue.toLowerCase()}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{selectedPosition && (
								<>
									<div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
										<span className="font-medium">Partisanship Level</span>
										{getPartisanshipBadge(selectedPosition.partisanship)}
									</div>

									<div className="grid grid-cols-2 gap-6">
										{/* Democratic Position */}
										<div className="space-y-3 p-4 border rounded-lg">
											<div className="flex items-center justify-between">
												<h3 className="font-semibold text-lg">
													Democratic Party
												</h3>
												<Badge variant="outline">
													{selectedPosition.democraticStance.supportRate.toFixed(
														0,
													)}
													% support
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												{selectedPosition.democraticStance.position}
											</p>
											<div className="space-y-2">
												<p className="text-xs font-medium text-muted-foreground">
													Key Legislation:
												</p>
												{selectedPosition.democraticStance.keyBills.map(
													(bill) => (
														<Badge
															key={bill}
															variant="secondary"
															className="mr-2"
														>
															{bill}
														</Badge>
													),
												)}
											</div>
										</div>

										{/* Republican Position */}
										<div className="space-y-3 p-4 border rounded-lg">
											<div className="flex items-center justify-between">
												<h3 className="font-semibold text-lg">
													Republican Party
												</h3>
												<Badge variant="outline">
													{selectedPosition.republicanStance.supportRate.toFixed(
														0,
													)}
													% support
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">
												{selectedPosition.republicanStance.position}
											</p>
											<div className="space-y-2">
												<p className="text-xs font-medium text-muted-foreground">
													Key Legislation:
												</p>
												{selectedPosition.republicanStance.keyBills.map(
													(bill) => (
														<Badge
															key={bill}
															variant="secondary"
															className="mr-2"
														>
															{bill}
														</Badge>
													),
												)}
											</div>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* All Issues Overview Table */}
					<Card>
						<CardHeader>
							<CardTitle>All Issues Summary</CardTitle>
							<CardDescription>
								Party positions across all major policy areas
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Issue</TableHead>
										<TableHead className="text-center">
											Democratic Support
										</TableHead>
										<TableHead className="text-center">
											Republican Support
										</TableHead>
										<TableHead className="text-center">Partisanship</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{partyPositions.map((position) => (
										<TableRow
											key={position.issueCategory}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => setSelectedIssue(position.issueCategory)}
										>
											<TableCell className="font-medium">
												{position.issueCategory}
											</TableCell>
											<TableCell className="text-center">
												<span className="font-semibold">
													{position.democraticStance.supportRate.toFixed(0)}%
												</span>
											</TableCell>
											<TableCell className="text-center">
												<span className="font-semibold">
													{position.republicanStance.supportRate.toFixed(0)}%
												</span>
											</TableCell>
											<TableCell className="text-center">
												{getPartisanshipBadge(position.partisanship)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Democratic Caucus Tab */}
				<TabsContent value="democratic" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="size-5" />
								Democratic Party Position on {selectedIssue}
							</CardTitle>
							<CardDescription>
								Understanding Democratic caucus priorities and voting patterns
							</CardDescription>
						</CardHeader>
						<CardContent>
							{selectedPosition && (
								<div className="space-y-4">
									<div className="p-4 bg-muted/30 rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="font-semibold">
												Overall Support Rate
											</span>
											<span className="text-2xl font-bold">
												{selectedPosition.democraticStance.supportRate.toFixed(
													0,
												)}
												%
											</span>
										</div>
										<p className="text-sm text-muted-foreground">
											Based on {selectedPosition.democraticStance.totalVotes}{" "}
											votes
										</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-semibold">Position Summary</h4>
										<p className="text-muted-foreground">
											{selectedPosition.democraticStance.position}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Republican Caucus Tab */}
				<TabsContent value="republican" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<TrendingUp className="size-5" />
								Republican Party Position on {selectedIssue}
							</CardTitle>
							<CardDescription>
								Understanding Republican caucus priorities and voting patterns
							</CardDescription>
						</CardHeader>
						<CardContent>
							{selectedPosition && (
								<div className="space-y-4">
									<div className="p-4 bg-muted/30 rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="font-semibold">
												Overall Support Rate
											</span>
											<span className="text-2xl font-bold">
												{selectedPosition.republicanStance.supportRate.toFixed(
													0,
												)}
												%
											</span>
										</div>
										<p className="text-sm text-muted-foreground">
											Based on {selectedPosition.republicanStance.totalVotes}{" "}
											votes
										</p>
									</div>
									<div className="space-y-2">
										<h4 className="font-semibold">Position Summary</h4>
										<p className="text-muted-foreground">
											{selectedPosition.republicanStance.position}
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
