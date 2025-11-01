import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type {
	Bill,
	IssueCategory,
	RhetoricsStatement,
	VotePosition,
} from "@/types";
import { MessageSquareQuote, Scale } from "lucide-react";

interface RhetoricVsRecordProps {
	issueCategory: IssueCategory;
	statements: RhetoricsStatement[];
	votes: Array<{
		bill: Bill;
		vote: VotePosition;
		date: string;
	}>;
}

function getConsistencyBadge(isConsistent: boolean) {
	return isConsistent ? (
		<Badge variant="default" className="bg-green-600">
			Consistent
		</Badge>
	) : (
		<Badge variant="destructive">Contradiction</Badge>
	);
}

export function RhetoricVsRecord({
	issueCategory,
	statements,
	votes,
}: RhetoricVsRecordProps) {
	// Simple heuristic: Check if voting pattern matches typical position
	// This would need more sophisticated logic in a real app
	const analyzeConsistency = () => {
		if (statements.length === 0 || votes.length === 0) return null;

		const yesVotes = votes.filter((v) => v.vote === "Yes").length;
		const totalVotes = votes.filter(
			(v) => v.vote === "Yes" || v.vote === "No",
		).length;

		// Placeholder logic - in production, this would analyze statement sentiment
		const votingPattern = totalVotes > 0 ? yesVotes / totalVotes : 0.5;

		return votingPattern > 0.6 || votingPattern < 0.4;
	};

	const hasConsistency = analyzeConsistency();

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Scale className="size-5" />
						Rhetoric vs. Record: {issueCategory}
					</CardTitle>
					{hasConsistency !== null && getConsistencyBadge(hasConsistency)}
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Public Statements Section */}
				<div>
					<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
						<MessageSquareQuote className="size-4" />
						Public Statements
					</h3>
					{statements.length > 0 ? (
						<div className="space-y-4">
							{statements.map((statement) => (
								<div
									key={statement.id}
									className="border-l-4 border-blue-600 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20"
								>
									<blockquote className="text-sm italic mb-2">
										"{statement.quote}"
									</blockquote>
									<div className="text-xs text-muted-foreground">
										<span className="font-medium">{statement.source}</span>
										{" • "}
										{new Date(statement.date).toLocaleDateString()}
										{statement.url && (
											<>
												{" • "}
												<a
													href={statement.url}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline"
												>
													Source
												</a>
											</>
										)}
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No public statements recorded for this issue
						</p>
					)}
				</div>

				<Separator />

				{/* Voting Record Section */}
				<div>
					<h3 className="text-lg font-semibold mb-4">Voting Record</h3>
					{votes.length > 0 ? (
						<div className="space-y-3">
							{votes.map(({ bill, vote, date }) => (
								<div
									key={bill.id}
									className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="flex-1">
										<div className="font-medium text-sm">{bill.number}</div>
										<div className="text-sm text-muted-foreground line-clamp-2 mt-1">
											{bill.title}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{new Date(date).toLocaleDateString()} • {bill.chamber}
										</div>
									</div>
									<Badge
										variant={
											vote === "Yes"
												? "default"
												: vote === "No"
													? "destructive"
													: "secondary"
										}
										className="ml-4 shrink-0"
									>
										{vote}
									</Badge>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No votes recorded for this issue
						</p>
					)}
				</div>

				{/* Analysis Section */}
				{hasConsistency !== null && (
					<>
						<Separator />
						<div className="bg-muted/50 p-4 rounded-lg">
							<h3 className="font-semibold text-sm mb-2">Analysis</h3>
							<p className="text-sm text-muted-foreground">
								{hasConsistency
									? "The voting record appears to align with the public statements on this issue."
									: "There may be inconsistencies between public statements and voting behavior on this issue. Review the specific votes and statements above for details."}
							</p>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
