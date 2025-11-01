import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Bill, ISSUE_CATEGORIES } from "@/types";
import { Award, TrendingUp } from "lucide-react";

interface Top50BillsProps {
	bills: Bill[];
}

export function Top50Bills({ bills }: Top50BillsProps) {
	// Filter only bills with impact rank (top 50)
	const rankedBills = bills
		.filter((bill) => bill.impactRank && bill.impactRank <= 50)
		.sort((a, b) => (a.impactRank || 999) - (b.impactRank || 999));

	// Group bills by issue category
	const billsByIssue = ISSUE_CATEGORIES.reduce(
		(acc, category) => {
			acc[category] = rankedBills.filter(
				(bill) => bill.issueCategory === category,
			);
			return acc;
		},
		{} as Record<string, Bill[]>,
	);

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

	const getRankBadge = (rank: number) => {
		if (rank <= 10) {
			return (
				<Badge
					variant="default"
					className="bg-amber-500 hover:bg-amber-600 text-white"
				>
					#{rank}
				</Badge>
			);
		}
		if (rank <= 25) {
			return (
				<Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900">
					#{rank}
				</Badge>
			);
		}
		return <Badge variant="outline">#{rank}</Badge>;
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-2xl">
						<Award className="size-6 text-amber-500" />
						Top 50 Pivotal Bills
					</CardTitle>
					<CardDescription>
						The most significant pieces of legislation over the last 20-30
						years, ranked by impact and organized by issue category
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<TrendingUp className="size-4" />
						<span>{rankedBills.length} pivotal bills tracked</span>
					</div>
				</CardContent>
			</Card>

			{/* All Bills View */}
			<Card>
				<CardHeader>
					<CardTitle>Complete Ranking</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">Rank</TableHead>
								<TableHead>Bill</TableHead>
								<TableHead>Issue Category</TableHead>
								<TableHead>Year</TableHead>
								<TableHead>Chamber</TableHead>
								<TableHead className="text-center">Votes</TableHead>
								<TableHead>Result</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rankedBills.map((bill) => (
								<TableRow key={bill.id}>
									<TableCell>
										{bill.impactRank && getRankBadge(bill.impactRank)}
									</TableCell>
									<TableCell className="max-w-md">
										<div className="font-medium">{bill.number}</div>
										<div className="text-sm text-muted-foreground line-clamp-2">
											{bill.title}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline">{bill.issueCategory}</Badge>
									</TableCell>
									<TableCell className="font-medium">{bill.year}</TableCell>
									<TableCell>{bill.chamber}</TableCell>
									<TableCell className="text-center text-sm">
										<div>
											<span className="text-green-600 font-medium">
												{bill.yesVotes}
											</span>
											{" / "}
											<span className="text-red-600 font-medium">
												{bill.noVotes}
											</span>
										</div>
									</TableCell>
									<TableCell>{getResultBadge(bill.result)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* By Issue Category */}
			<Card>
				<CardHeader>
					<CardTitle>Browse by Issue Category</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue={ISSUE_CATEGORIES[0]} className="w-full">
						<TabsList className="w-full grid grid-cols-5 lg:grid-cols-10">
							{ISSUE_CATEGORIES.map((category) => (
								<TabsTrigger
									key={category}
									value={category}
									className="text-xs px-2"
								>
									{category.replace(" ", "\n")}
								</TabsTrigger>
							))}
						</TabsList>
						{ISSUE_CATEGORIES.map((category) => {
							const categoryBills = billsByIssue[category] || [];
							return (
								<TabsContent key={category} value={category}>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold">{category}</h3>
											<span className="text-sm text-muted-foreground">
												{categoryBills.length} pivotal bills
											</span>
										</div>
										{categoryBills.length > 0 ? (
											<div className="space-y-3">
												{categoryBills.map((bill) => (
													<Card key={bill.id}>
														<CardHeader className="pb-3">
															<div className="flex items-start justify-between gap-4">
																<div className="flex items-start gap-3">
																	<div>
																		{bill.impactRank &&
																			getRankBadge(bill.impactRank)}
																	</div>
																	<div className="flex-1">
																		<CardTitle className="text-base">
																			{bill.number}
																		</CardTitle>
																		<CardDescription className="mt-1">
																			{bill.title}
																		</CardDescription>
																	</div>
																</div>
																{getResultBadge(bill.result)}
															</div>
														</CardHeader>
														<CardContent>
															<p className="text-sm text-muted-foreground mb-3">
																{bill.description}
															</p>
															<div className="flex items-center gap-4 text-xs text-muted-foreground">
																<span>
																	{bill.year} • {bill.chamber}
																</span>
																<span>•</span>
																<span>
																	<span className="text-green-600 font-medium">
																		{bill.yesVotes} Yes
																	</span>
																	{", "}
																	<span className="text-red-600 font-medium">
																		{bill.noVotes} No
																	</span>
																</span>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-center py-8 text-muted-foreground">
												No pivotal bills ranked in the top 50 for this category
											</div>
										)}
									</div>
								</TabsContent>
							);
						})}
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
