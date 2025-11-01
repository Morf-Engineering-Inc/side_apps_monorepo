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
import { type Bill, ISSUE_CATEGORIES, type IssueCategory } from "@/types";
import { ArrowUpDown, Calendar, FileText, Users } from "lucide-react";
import { useState } from "react";

interface IssueDeepDiveProps {
	issueCategory?: IssueCategory;
	bills: Bill[];
	onCategoryChange?: (category: IssueCategory) => void;
}

type SortField = "year" | "result" | "impact";
type SortDirection = "asc" | "desc";

interface PartyVotingStats {
	democraticSupport: { yes: number; no: number; total: number };
	republicanSupport: { yes: number; no: number; total: number };
}

export function IssueDeepDive({
	issueCategory = "Healthcare",
	bills,
	onCategoryChange,
}: IssueDeepDiveProps) {
	const [selectedCategory, setSelectedCategory] =
		useState<IssueCategory>(issueCategory);
	const [sortField, setSortField] = useState<SortField>("year");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const handleCategoryChange = (category: IssueCategory) => {
		setSelectedCategory(category);
		onCategoryChange?.(category);
	};

	const filteredBills = bills.filter(
		(bill) => bill.issueCategory === selectedCategory,
	);

	const sortedBills = [...filteredBills].sort((a, b) => {
		let comparison = 0;

		switch (sortField) {
			case "year":
				comparison = a.year - b.year;
				break;
			case "result":
				comparison = a.result.localeCompare(b.result);
				break;
			case "impact":
				comparison = (a.impactRank || 999) - (b.impactRank || 999);
				break;
		}

		return sortDirection === "asc" ? comparison : -comparison;
	});

	const toggleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	const getResultBadge = (result: string) => {
		const lowerResult = result.toLowerCase();
		if (lowerResult.includes("passed") || lowerResult.includes("enacted")) {
			return (
				<Badge variant="default" className="bg-green-600">
					{result}
				</Badge>
			);
		}
		if (lowerResult.includes("failed") || lowerResult.includes("defeated")) {
			return <Badge variant="destructive">{result}</Badge>;
		}
		return <Badge variant="secondary">{result}</Badge>;
	};

	// Calculate party voting statistics (mock data - would come from API)
	const calculatePartyStats = (bill: Bill): PartyVotingStats => {
		// Mock calculation - in production this would come from actual vote data
		const totalDemVotes = Math.floor(bill.yesVotes * 0.48);
		const totalRepVotes = Math.floor(bill.yesVotes * 0.52);

		return {
			democraticSupport: {
				yes: Math.floor(totalDemVotes * 0.7),
				no: Math.floor(totalDemVotes * 0.3),
				total: totalDemVotes,
			},
			republicanSupport: {
				yes: Math.floor(totalRepVotes * 0.3),
				no: Math.floor(totalRepVotes * 0.7),
				total: totalRepVotes,
			},
		};
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-2xl flex items-center gap-2 mb-2">
								<FileText className="size-6" />
								Issue Deep Dive
							</CardTitle>
							<CardDescription>
								Explore legislation and party voting patterns by topic
							</CardDescription>
						</div>
						<div className="w-64">
							<Select
								value={selectedCategory}
								onValueChange={(value) =>
									handleCategoryChange(value as IssueCategory)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select topic" />
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
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								{sortedBills.length} bills in {selectedCategory}
							</div>
							<Badge variant="outline" className="text-sm">
								<FileText className="size-3 mr-1" />
								{selectedCategory}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Timeline View with Party Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="size-5" />
						Legislative Timeline & Party Voting Patterns
					</CardTitle>
					<CardDescription>
						Understanding how each party approached {selectedCategory}{" "}
						legislation
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{sortedBills.map((bill) => {
							const partyStats = calculatePartyStats(bill);
							const demSupportPct = (
								(partyStats.democraticSupport.yes /
									partyStats.democraticSupport.total) *
								100
							).toFixed(0);
							const repSupportPct = (
								(partyStats.republicanSupport.yes /
									partyStats.republicanSupport.total) *
								100
							).toFixed(0);

							return (
								<div
									key={bill.id}
									className="relative pl-8 pb-6 border-l-2 border-gray-300 dark:border-gray-700 last:pb-0 cursor-pointer rounded-lg p-3 -ml-3 transition-all hover:bg-red-50 hover:border-red-400 dark:hover:bg-red-950/20 dark:hover:border-red-700"
								>
									<div className="absolute left-[-9px] top-3 size-4 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-950" />
									<div className="space-y-3">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-semibold">{bill.number}</span>
													<Badge variant="outline" className="text-xs">
														{bill.year}
													</Badge>
													{bill.impactRank && (
														<Badge
															variant="secondary"
															className="text-xs bg-amber-100 dark:bg-amber-900"
														>
															Top {bill.impactRank}
														</Badge>
													)}
												</div>
												<h4 className="font-medium text-sm mb-2">
													{bill.title}
												</h4>
												<p className="text-sm text-muted-foreground line-clamp-2">
													{bill.description}
												</p>
												<div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
													<span>{bill.chamber}</span>
													<span>•</span>
													<span>
														{bill.yesVotes} Yes, {bill.noVotes} No
													</span>
												</div>
											</div>
											<div>{getResultBadge(bill.result)}</div>
										</div>

										{/* Party Voting Breakdown */}
										<div className="bg-muted/30 p-3 rounded-lg">
											<div className="flex items-center gap-2 mb-2">
												<Users className="size-4 text-muted-foreground" />
												<span className="text-xs font-medium text-muted-foreground">
													Party Voting Breakdown
												</span>
											</div>
											<div className="grid grid-cols-2 gap-4 text-sm">
												<div className="space-y-1">
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground">
															Democratic Party
														</span>
														<span className="font-semibold">
															{demSupportPct}% support
														</span>
													</div>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span className="text-green-600">
															{partyStats.democraticSupport.yes} Yes
														</span>
														<span>•</span>
														<span className="text-red-600">
															{partyStats.democraticSupport.no} No
														</span>
													</div>
												</div>
												<div className="space-y-1">
													<div className="flex items-center justify-between">
														<span className="text-muted-foreground">
															Republican Party
														</span>
														<span className="font-semibold">
															{repSupportPct}% support
														</span>
													</div>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span className="text-green-600">
															{partyStats.republicanSupport.yes} Yes
														</span>
														<span>•</span>
														<span className="text-red-600">
															{partyStats.republicanSupport.no} No
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Sortable Table View */}
			<Card>
				<CardHeader>
					<CardTitle>Bill Details</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead
									className="cursor-pointer hover:bg-accent"
									onClick={() => toggleSort("year")}
								>
									<div className="flex items-center gap-1">
										Year
										<ArrowUpDown className="size-3" />
									</div>
								</TableHead>
								<TableHead>Bill Number</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Chamber</TableHead>
								<TableHead className="text-center">Votes (Y/N)</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-accent"
									onClick={() => toggleSort("result")}
								>
									<div className="flex items-center gap-1">
										Result
										<ArrowUpDown className="size-3" />
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer hover:bg-accent text-center"
									onClick={() => toggleSort("impact")}
								>
									<div className="flex items-center gap-1 justify-center">
										Impact Rank
										<ArrowUpDown className="size-3" />
									</div>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{sortedBills.map((bill) => (
								<TableRow key={bill.id}>
									<TableCell className="font-medium">{bill.year}</TableCell>
									<TableCell>{bill.number}</TableCell>
									<TableCell className="max-w-xs">
										<div className="line-clamp-2">{bill.title}</div>
									</TableCell>
									<TableCell>{bill.chamber}</TableCell>
									<TableCell className="text-center">
										<span className="text-green-600 font-medium">
											{bill.yesVotes}
										</span>
										{" / "}
										<span className="text-red-600 font-medium">
											{bill.noVotes}
										</span>
									</TableCell>
									<TableCell>{getResultBadge(bill.result)}</TableCell>
									<TableCell className="text-center">
										{bill.impactRank ? (
											<Badge variant="secondary">#{bill.impactRank}</Badge>
										) : (
											<span className="text-muted-foreground">—</span>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
