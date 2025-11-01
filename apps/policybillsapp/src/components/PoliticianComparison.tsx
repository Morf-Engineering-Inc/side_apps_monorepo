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
import type { PoliticianComparison as PoliticianComparisonType } from "@/types";
import { CheckCircle, MinusCircle, Users, XCircle } from "lucide-react";

interface PoliticianComparisonProps {
	comparison: PoliticianComparisonType;
}

function getVoteIcon(vote: string) {
	switch (vote) {
		case "Yes":
			return <CheckCircle className="size-4 text-green-600" />;
		case "No":
			return <XCircle className="size-4 text-red-600" />;
		case "Present":
			return <MinusCircle className="size-4 text-yellow-600" />;
		default:
			return <MinusCircle className="size-4 text-gray-400" />;
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

export function PoliticianComparison({
	comparison,
}: PoliticianComparisonProps) {
	const { politician1, politician2, comparedBills, agreementPercentage } =
		comparison;

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-2xl">
						<Users className="size-6" />
						Side-by-Side Comparison
					</CardTitle>
					<CardDescription>
						Comparing voting records between two members of Congress
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-8 mb-6">
						{/* Politician 1 */}
						<div className="space-y-2">
							<h3 className="text-xl font-semibold">{politician1.name}</h3>
							<div className="flex items-center gap-2">
								<Badge variant={getPartyColor(politician1.party)}>
									{politician1.party}
								</Badge>
								<span className="text-sm text-muted-foreground">
									{politician1.role} • {politician1.state}
								</span>
							</div>
							<div className="text-sm text-muted-foreground">
								{politician1.yearsOfService} years of service
							</div>
						</div>

						{/* Politician 2 */}
						<div className="space-y-2">
							<h3 className="text-xl font-semibold">{politician2.name}</h3>
							<div className="flex items-center gap-2">
								<Badge variant={getPartyColor(politician2.party)}>
									{politician2.party}
								</Badge>
								<span className="text-sm text-muted-foreground">
									{politician2.role} • {politician2.state}
								</span>
							</div>
							<div className="text-sm text-muted-foreground">
								{politician2.yearsOfService} years of service
							</div>
						</div>
					</div>

					{/* Agreement Percentage */}
					<div className="bg-muted/50 p-4 rounded-lg mb-6">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="font-semibold">Voting Agreement</h4>
								<p className="text-sm text-muted-foreground">
									Based on {comparedBills.length} shared votes
								</p>
							</div>
							<div className="text-4xl font-bold text-blue-600">
								{agreementPercentage.toFixed(1)}%
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Comparison Table */}
			<Card>
				<CardHeader>
					<CardTitle>Vote-by-Vote Comparison</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Bill</TableHead>
								<TableHead>Year</TableHead>
								<TableHead className="text-center">
									{politician1.name.split(" ").pop()}
								</TableHead>
								<TableHead className="text-center">
									{politician2.name.split(" ").pop()}
								</TableHead>
								<TableHead className="text-center">Agreement</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{comparedBills.map(({ bill, vote1, vote2, agreement }) => (
								<TableRow
									key={bill.id}
									className={
										agreement
											? "bg-green-50 dark:bg-green-950/20"
											: "bg-red-50 dark:bg-red-950/20"
									}
								>
									<TableCell className="max-w-md">
										<div className="font-medium">{bill.number}</div>
										<div className="text-sm text-muted-foreground line-clamp-2">
											{bill.title}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{bill.issueCategory}
										</div>
									</TableCell>
									<TableCell className="font-medium">{bill.year}</TableCell>
									<TableCell className="text-center">
										<div className="flex items-center justify-center gap-2">
											{getVoteIcon(vote1)}
											<span className="text-sm font-medium">{vote1}</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										<div className="flex items-center justify-center gap-2">
											{getVoteIcon(vote2)}
											<span className="text-sm font-medium">{vote2}</span>
										</div>
									</TableCell>
									<TableCell className="text-center">
										{agreement ? (
											<Badge variant="default" className="bg-green-600">
												Agree
											</Badge>
										) : (
											<Badge variant="destructive">Disagree</Badge>
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
