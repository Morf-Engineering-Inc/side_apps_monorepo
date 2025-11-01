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
import { ISSUE_CATEGORIES, type PoliticianVotingScorecard } from "@/types";
import { CheckCircle, CircleDashed, MinusCircle, XCircle } from "lucide-react";

interface PoliticianCardProps {
	scorecard: PoliticianVotingScorecard;
}

function getVoteIcon(vote: string) {
	switch (vote) {
		case "Yes":
			return <CheckCircle className="size-4 text-green-600" />;
		case "No":
			return <XCircle className="size-4 text-red-600" />;
		case "Present":
			return <MinusCircle className="size-4 text-yellow-600" />;
		case "Not Voting":
			return <CircleDashed className="size-4 text-gray-400" />;
		default:
			return null;
	}
}

function getPartyColor(party: string): "default" | "destructive" | "secondary" {
	switch (party) {
		case "Republican":
			return "destructive";
		case "Democrat":
			return "default";
		default:
			return "secondary";
	}
}

export function PoliticianCard({ scorecard }: PoliticianCardProps) {
	const { politician, votesByIssue } = scorecard;

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-2xl">{politician.name}</CardTitle>
						<CardDescription className="mt-2 flex items-center gap-2">
							<Badge variant={getPartyColor(politician.party)}>
								{politician.party}
							</Badge>
							<span>
								{politician.role} from {politician.state}
							</span>
							<span className="text-muted-foreground">
								• {politician.yearsOfService} years of service
							</span>
						</CardDescription>
					</div>
				</div>
				{politician.website && (
					<div className="text-sm text-muted-foreground mt-2">
						<a
							href={politician.website}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline"
						>
							Official Website
						</a>
						{politician.phone && <span> • {politician.phone}</span>}
					</div>
				)}
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
						const issueData = votesByIssue[category];
						return (
							<TabsContent key={category} value={category}>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold">{category}</h3>
										{issueData && (
											<div className="text-sm text-muted-foreground">
												{issueData.summary.totalVotes} votes •{" "}
												{issueData.summary.yesVotes} Yes •{" "}
												{issueData.summary.noVotes} No
											</div>
										)}
									</div>
									{issueData && issueData.bills.length > 0 ? (
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Vote</TableHead>
													<TableHead>Bill</TableHead>
													<TableHead>Year</TableHead>
													<TableHead>Description</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{issueData.bills.map(({ bill, vote, date }) => (
													<TableRow key={bill.id}>
														<TableCell className="w-16">
															<div className="flex items-center gap-2">
																{getVoteIcon(vote)}
																<span className="text-sm font-medium">
																	{vote}
																</span>
															</div>
														</TableCell>
														<TableCell className="font-medium">
															{bill.number}
														</TableCell>
														<TableCell>{bill.year}</TableCell>
														<TableCell className="max-w-md">
															<div className="line-clamp-2">{bill.title}</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									) : (
										<div className="text-center py-8 text-muted-foreground">
											No voting records available for this issue category
										</div>
									)}
								</div>
							</TabsContent>
						);
					})}
				</Tabs>
			</CardContent>
		</Card>
	);
}
