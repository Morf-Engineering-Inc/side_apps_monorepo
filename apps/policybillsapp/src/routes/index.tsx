import { IssueDeepDive } from "@/components/IssueDeepDive";
import { PartyCaucusInsights } from "@/components/PartyCaucusInsights";
import { PoliticianCard } from "@/components/PoliticianCard";
import { PoliticianComparison } from "@/components/PoliticianComparison";
import { RhetoricVsRecord } from "@/components/RhetoricVsRecord";
import { StateFilter } from "@/components/StateFilter";
import { Top50Bills } from "@/components/Top50Bills";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	type Bill,
	ISSUE_CATEGORIES,
	type IssueCategory,
	type PoliticianComparison as PoliticianComparisonType,
	type PoliticianVotingScorecard,
	type RhetoricsStatement,
	type USState,
	US_STATES,
} from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, MapPin, Scale, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
	component: App,
});

// Mock data for demonstration - in production, this would come from the data layer
const mockPoliticians: PoliticianVotingScorecard[] = [
	{
		politician: {
			id: "1",
			name: "Senator Jane Smith",
			party: "Democrat",
			state: "CA",
			role: "Senator",
			yearsOfService: 12,
			website: "https://example.com",
			phone: "(202) 555-0100",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "Yes",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 1, noVotes: 0 },
			},
		},
	},
	{
		politician: {
			id: "2",
			name: "Senator John Doe",
			party: "Republican",
			state: "TX",
			role: "Senator",
			yearsOfService: 8,
			website: "https://example.com",
			phone: "(202) 555-0101",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "No",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 0, noVotes: 1 },
			},
		},
	},
	{
		politician: {
			id: "3",
			name: "Senator Mike Lee",
			party: "Republican",
			state: "UT",
			role: "Senator",
			yearsOfService: 14,
			website: "https://example.com",
			phone: "(202) 555-0102",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "No",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 0, noVotes: 1 },
			},
		},
	},
	{
		politician: {
			id: "4",
			name: "Senator Mitt Romney",
			party: "Republican",
			state: "UT",
			role: "Senator",
			yearsOfService: 6,
			website: "https://example.com",
			phone: "(202) 555-0103",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "No",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 0, noVotes: 1 },
			},
		},
	},
	{
		politician: {
			id: "5",
			name: "Representative Blake Moore",
			party: "Republican",
			state: "UT",
			role: "Representative",
			yearsOfService: 4,
			website: "https://example.com",
			phone: "(202) 555-0104",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "No",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 0, noVotes: 1 },
			},
		},
	},
	{
		politician: {
			id: "6",
			name: "Senator Elizabeth Warren",
			party: "Democrat",
			state: "MA",
			role: "Senator",
			yearsOfService: 11,
			website: "https://example.com",
			phone: "(202) 555-0105",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "Yes",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 1, noVotes: 0 },
			},
		},
	},
	{
		politician: {
			id: "7",
			name: "Representative Nancy Pelosi",
			party: "Democrat",
			state: "CA",
			role: "Representative",
			yearsOfService: 37,
			website: "https://example.com",
			phone: "(202) 555-0106",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "Yes",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 1, noVotes: 0 },
			},
		},
	},
	{
		politician: {
			id: "8",
			name: "Senator Ted Cruz",
			party: "Republican",
			state: "TX",
			role: "Senator",
			yearsOfService: 12,
			website: "https://example.com",
			phone: "(202) 555-0107",
		},
		votesByIssue: {
			Healthcare: {
				bills: [
					{
						bill: {
							id: "b1",
							title: "Affordable Care Act",
							number: "H.R. 3590",
							congress: 111,
							chamber: "House",
							issueCategory: "Healthcare",
							description:
								"Comprehensive health care reform to increase coverage and reduce costs",
							year: 2010,
							introducedDate: "2009-09-17",
							status: "Enacted",
							yesVotes: 219,
							noVotes: 212,
							presentVotes: 0,
							notVotingCount: 4,
							result: "Passed",
							impactRank: 1,
						},
						vote: "No",
						date: "2010-03-21",
					},
				],
				summary: { totalVotes: 1, yesVotes: 0, noVotes: 1 },
			},
		},
	},
];

const mockPolitician1 = mockPoliticians[0];
const mockPolitician2 = mockPoliticians[1];

const mockComparison: PoliticianComparisonType = {
	politician1: mockPolitician1.politician,
	politician2: mockPolitician2.politician,
	comparedBills: [
		{
			bill: {
				id: "b1",
				title: "Affordable Care Act",
				number: "H.R. 3590",
				congress: 111,
				chamber: "House",
				issueCategory: "Healthcare",
				description:
					"Comprehensive health care reform to increase coverage and reduce costs",
				year: 2010,
				introducedDate: "2009-09-17",
				status: "Enacted",
				yesVotes: 219,
				noVotes: 212,
				presentVotes: 0,
				notVotingCount: 4,
				result: "Passed",
				impactRank: 1,
			},
			vote1: "Yes",
			vote2: "No",
			agreement: false,
		},
	],
	agreementPercentage: 0,
};

const mockStatements: RhetoricsStatement[] = [
	{
		id: "s1",
		politicianId: "1",
		issueCategory: "Healthcare",
		quote:
			"Healthcare is a right, not a privilege. Every American deserves access to affordable, quality healthcare.",
		source: "Senate Floor Speech",
		date: "2009-12-15",
		url: "https://example.com",
	},
];

const mockBills: Bill[] = [
	{
		id: "b1",
		title: "Affordable Care Act",
		shortTitle: "ACA",
		number: "H.R. 3590",
		congress: 111,
		chamber: "House",
		issueCategory: "Healthcare",
		description:
			"Comprehensive health care reform legislation aimed at increasing health insurance coverage and reducing healthcare costs",
		year: 2010,
		introducedDate: "2009-09-17",
		status: "Enacted",
		yesVotes: 219,
		noVotes: 212,
		presentVotes: 0,
		notVotingCount: 4,
		result: "Passed and Enacted",
		impactRank: 1,
	},
	{
		id: "b2",
		title: "American Clean Energy and Security Act",
		number: "H.R. 2454",
		congress: 111,
		chamber: "House",
		issueCategory: "Climate Change",
		description:
			"Cap-and-trade system to reduce greenhouse gas emissions and promote clean energy",
		year: 2009,
		introducedDate: "2009-05-15",
		status: "Passed House",
		yesVotes: 219,
		noVotes: 212,
		presentVotes: 0,
		notVotingCount: 4,
		result: "Passed House",
		impactRank: 12,
	},
	{
		id: "b3",
		title: "Tax Cuts and Jobs Act",
		number: "H.R. 1",
		congress: 115,
		chamber: "House",
		issueCategory: "National Debt",
		description:
			"Major tax reform legislation reducing corporate and individual tax rates",
		year: 2017,
		introducedDate: "2017-11-02",
		status: "Enacted",
		yesVotes: 227,
		noVotes: 203,
		presentVotes: 0,
		notVotingCount: 5,
		result: "Passed and Enacted",
		impactRank: 3,
	},
];

function App() {
	const [selectedState, setSelectedState] = useState<USState | undefined>(
		undefined,
	);
	const [activeView, setActiveView] = useState<
		| "home"
		| "politician"
		| "comparison"
		| "issue"
		| "top50"
		| "party-insights"
		| "population"
		| "urban-rural"
	>("home");
	const [detailDialog, setDetailDialog] = useState<
		"members" | "bills" | "categories" | null
	>(null);

	// Filter politicians based on selected state
	const filteredPoliticians = selectedState
		? mockPoliticians.filter((p) => p.politician.state === selectedState)
		: mockPoliticians;

	// Calculate stats based on filtered data
	const totalMembers = filteredPoliticians.length;
	const uniqueStates = new Set(
		filteredPoliticians.map((p) => p.politician.state),
	).size;

	// Get state name for display
	const selectedStateName = selectedState
		? US_STATES.find((s) => s.value === selectedState)?.label
		: undefined;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
			{/* Header */}
			<header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Building2 className="size-8 text-blue-700 dark:text-blue-400" />
							<div>
								<h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-slate-700 to-blue-600 bg-clip-text text-transparent dark:from-red-400 dark:via-white dark:to-blue-400">
									Congressional Voting Records
								</h1>
								<p className="text-sm text-slate-600 dark:text-slate-400">
									Rhetoric vs. Reality
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<StateFilter
								value={selectedState}
								onValueChange={setSelectedState}
								placeholder="Filter by state"
							/>
							<Button
								variant="outline"
								onClick={() => setActiveView("home")}
								className="border-2 border-blue-400 text-blue-700 hover:bg-blue-50 hover:border-blue-600 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
							>
								Home
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-4 py-8">
				{activeView === "home" && (
					<div className="space-y-8">
						{/* Hero Section */}
						<Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-red-950/30 dark:border-blue-700">
							<CardHeader>
								<CardTitle className="text-3xl bg-gradient-to-r from-red-700 via-slate-800 to-blue-700 bg-clip-text text-transparent dark:from-red-400 dark:via-white dark:to-blue-400">
									Compare Political Rhetoric with Actual Votes
								</CardTitle>
								<CardDescription className="text-base">
									Track how U.S. Senators and Representatives vote on major
									legislation across Immigration, Healthcare, Climate Change,
									and more. Hold your representatives accountable.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-7 gap-4">
									<Button
										onClick={() => setActiveView("politician")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-700 dark:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 text-white"
									>
										<Users className="size-6" />
										<span className="font-semibold">Politician Profiles</span>
										<span className="text-xs opacity-90">
											View voting records by state
										</span>
									</Button>
									<Button
										onClick={() => setActiveView("comparison")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 text-white"
									>
										<Scale className="size-6" />
										<span className="font-semibold">Compare Politicians</span>
										<span className="text-xs opacity-90">
											Side-by-side vote analysis
										</span>
									</Button>
									<Button
										onClick={() => setActiveView("party-insights")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-white to-slate-100 hover:from-slate-100 hover:to-slate-200 dark:from-slate-200 dark:to-slate-300 dark:hover:from-slate-100 dark:hover:to-slate-200 text-slate-900 border-2 border-slate-300"
									>
										<Users className="size-6" />
										<span className="font-semibold">Party Insights</span>
										<span className="text-xs opacity-90">
											Understand party positions
										</span>
									</Button>
									<Button
										onClick={() => setActiveView("issue")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white"
									>
										<Building2 className="size-6" />
										<span className="font-semibold">Issue Deep-Dive</span>
										<span className="text-xs opacity-90">
											Explore bills by topic
										</span>
									</Button>
									<Button
										onClick={() => setActiveView("population")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white"
									>
										<Users className="size-6" />
										<span className="font-semibold">Population View</span>
										<span className="text-xs opacity-90">
											State demographics & reps
										</span>
									</Button>
									<Button
										onClick={() => setActiveView("urban-rural")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-700 dark:to-green-800 dark:hover:from-green-600 dark:hover:to-green-700 text-white"
									>
										<MapPin className="size-6" />
										<span className="font-semibold">Urban vs Rural</span>
										<span className="text-xs opacity-90">
											Political divide analysis
										</span>
									</Button>
									<Button
										onClick={() => setActiveView("top50")}
										className="h-auto py-4 flex-col gap-2 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 dark:from-red-700 dark:to-red-800 dark:hover:from-red-600 dark:hover:to-red-700 text-white"
									>
										<TrendingUp className="size-6" />
										<span className="font-semibold">Top 50 Bills</span>
										<span className="text-xs opacity-90">
											Most pivotal legislation
										</span>
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Issue Categories Grid */}
						<Card>
							<CardHeader>
								<CardTitle>Browse by Issue Category</CardTitle>
								<CardDescription>
									Explore voting records across 10 major policy areas
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
									{ISSUE_CATEGORIES.map((category) => (
										<Button
											key={category}
											variant="outline"
											className="h-auto py-4 border-2 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 dark:hover:border-slate-600"
											onClick={() => setActiveView("issue")}
										>
											<span className="font-medium text-sm text-center">
												{category}
											</span>
										</Button>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Quick Stats */}
						{selectedState && (
							<Card className="border-2 border-blue-400 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30">
								<CardHeader>
									<CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
										Viewing {selectedStateName} Representatives
									</CardTitle>
									<CardDescription className="text-blue-600 dark:text-blue-500">
										Showing {totalMembers} member{totalMembers !== 1 ? "s" : ""}{" "}
										from {selectedStateName}
									</CardDescription>
								</CardHeader>
							</Card>
						)}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card
								className="border-2 border-red-400 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 dark:border-red-700 cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-red-600 dark:hover:border-red-500"
								onClick={() => setDetailDialog("members")}
							>
								<CardHeader>
									<CardTitle className="text-4xl font-bold text-red-700 dark:text-red-400">
										{totalMembers}
									</CardTitle>
									<CardDescription className="text-red-600 dark:text-red-500">
										{selectedState
											? `Representatives from ${selectedStateName}`
											: "Members of Congress Tracked"}
									</CardDescription>
									<p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
										Click to view details →
									</p>
								</CardHeader>
							</Card>
							<Card
								className="border-2 border-white shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 dark:border-slate-600 cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-slate-400 dark:hover:border-slate-500"
								onClick={() => setDetailDialog("bills")}
							>
								<CardHeader>
									<CardTitle className="text-4xl font-bold text-slate-700 dark:text-slate-300">
										50
									</CardTitle>
									<CardDescription>Most Pivotal Bills Ranked</CardDescription>
									<p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
										Click to view details →
									</p>
								</CardHeader>
							</Card>
							<Card
								className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 dark:border-blue-700 cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-blue-600 dark:hover:border-blue-500"
								onClick={() => setDetailDialog("categories")}
							>
								<CardHeader>
									<CardTitle className="text-4xl font-bold text-blue-700 dark:text-blue-400">
										{selectedState ? uniqueStates : 10}
									</CardTitle>
									<CardDescription className="text-blue-600 dark:text-blue-500">
										{selectedState
											? "State(s) Shown"
											: "Major Issue Categories"}
									</CardDescription>
									<p className="text-xs text-blue-500 dark:text-blue-400 mt-2 font-medium">
										Click to view details →
									</p>
								</CardHeader>
							</Card>
						</div>
					</div>
				)}

				{activeView === "politician" && (
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-2xl font-bold">Politician Profiles</h2>
							{selectedState && (
								<p className="text-muted-foreground">
									Showing representatives from {selectedState}
								</p>
							)}
						</div>
						<Tabs defaultValue="profile">
							<TabsList>
								<TabsTrigger value="profile">Voting Scorecard</TabsTrigger>
								<TabsTrigger value="rhetoric">Rhetoric vs. Record</TabsTrigger>
							</TabsList>
							<TabsContent value="profile" className="mt-6">
								<PoliticianCard scorecard={mockPolitician1} />
							</TabsContent>
							<TabsContent value="rhetoric" className="mt-6">
								<RhetoricVsRecord
									issueCategory="Healthcare"
									statements={mockStatements}
									votes={mockPolitician1.votesByIssue.Healthcare?.bills || []}
								/>
							</TabsContent>
						</Tabs>
					</div>
				)}

				{activeView === "comparison" && (
					<div className="space-y-6">
						<h2 className="text-2xl font-bold">Politician Comparison</h2>
						<PoliticianComparison comparison={mockComparison} />
					</div>
				)}

				{activeView === "issue" && (
					<div className="space-y-6">
						<h2 className="text-2xl font-bold">Issue Deep-Dive</h2>
						<IssueDeepDive issueCategory="Healthcare" bills={mockBills} />
					</div>
				)}

				{activeView === "top50" && (
					<div className="space-y-6">
						<Top50Bills bills={mockBills} />
					</div>
				)}

				{activeView === "party-insights" && (
					<div className="space-y-6">
						<PartyCaucusInsights bills={mockBills} />
					</div>
				)}

				{activeView === "urban-rural" && (
					<div className="space-y-6">
						{/* Hero Section */}
						<Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950/30 dark:via-slate-900 dark:to-blue-950/30 dark:border-green-700">
							<CardHeader>
								<CardTitle className="text-3xl bg-gradient-to-r from-green-700 via-slate-800 to-blue-700 bg-clip-text text-transparent dark:from-green-400 dark:via-white dark:to-blue-400">
									Understanding the Urban-Rural Political Divide Through Data
									and Evidence
								</CardTitle>
								<CardDescription className="text-base">
									Interactive Data-Driven Analysis of Voting Patterns, Policies,
									Crime Stats, and Social Issues
								</CardDescription>
							</CardHeader>
						</Card>

						{/* Quick Stats Overview */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 dark:border-blue-700 cursor-pointer transition-all hover:shadow-xl hover:scale-105">
								<CardHeader>
									<CardTitle className="text-4xl font-bold text-blue-700 dark:text-blue-400">
										75%
									</CardTitle>
									<CardDescription className="text-blue-600 dark:text-blue-500">
										Democrat Support in Dense Urban Areas (&gt; 1,000/sq mi)
									</CardDescription>
									<p className="text-xs text-blue-500 dark:text-blue-400 mt-2 font-medium">
										Click to explore →
									</p>
								</CardHeader>
							</Card>
							<Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-slate-900 dark:border-green-700 cursor-pointer transition-all hover:shadow-xl hover:scale-105">
								<CardHeader>
									<CardTitle className="text-4xl font-bold text-green-700 dark:text-green-400">
										6
									</CardTitle>
									<CardDescription className="text-green-600 dark:text-green-500">
										Major Policy Areas Compared
									</CardDescription>
									<p className="text-xs text-green-500 dark:text-green-400 mt-2 font-medium">
										Click to explore →
									</p>
								</CardHeader>
							</Card>
							<Card className="border-2 border-red-400 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 dark:border-red-700 cursor-pointer transition-all hover:shadow-xl hover:scale-105">
								<CardHeader>
									<CardTitle className="text-4xl font-bold text-red-700 dark:text-red-400">
										2x
									</CardTitle>
									<CardDescription className="text-red-600 dark:text-red-500">
										Higher Violent Crime Rate in Urban Areas (34 vs 16.7 per
										1,000)
									</CardDescription>
									<p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
										Click to explore →
									</p>
								</CardHeader>
							</Card>
						</div>

						{/* Why The Divide Section */}
						<Card className="border-2 border-slate-300 dark:border-slate-700">
							<CardHeader>
								<CardTitle className="text-2xl">
									Why Do Dense Counties Vote Democrat?
								</CardTitle>
								<CardDescription>
									Counties with &gt; 1,000 people/sq mi gave Biden 70-80% in
									2020
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
									<div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-800">
										<div className="text-3xl mb-3">🌍</div>
										<h3 className="font-bold text-lg mb-2 text-purple-900 dark:text-purple-300">
											Diversity
										</h3>
										<p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
											<strong>Urban:</strong> More immigrants, minorities, young
											people
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											<strong>Rural:</strong> Older, white, married, religious
										</p>
									</div>

									<div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-800">
										<div className="text-3xl mb-3">🎓</div>
										<h3 className="font-bold text-lg mb-2 text-blue-900 dark:text-blue-300">
											Education
										</h3>
										<p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
											<strong>Urban:</strong> College towns and cities lean blue
											by 15-20 points
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											<strong>Rural:</strong> Less college education
										</p>
									</div>

									<div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg border-2 border-green-300 dark:border-green-800">
										<div className="text-3xl mb-3">💼</div>
										<h3 className="font-bold text-lg mb-2 text-green-900 dark:text-green-300">
											Economy
										</h3>
										<p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
											<strong>Urban:</strong> Tech, service, creative jobs
											benefit from Democratic infrastructure
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											<strong>Rural:</strong> Agriculture, manufacturing prefer
											deregulation
										</p>
									</div>

									<div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 rounded-lg border-2 border-orange-300 dark:border-orange-800">
										<div className="text-3xl mb-3">🏛️</div>
										<h3 className="font-bold text-lg mb-2 text-orange-900 dark:text-orange-300">
											Culture
										</h3>
										<p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
											<strong>Urban:</strong> Living close together builds
											support for collective solutions
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											<strong>Rural:</strong> Self-reliance, individualism,
											limited government
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Voting Patterns Comparison */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<Card className="border-2 border-blue-300 dark:border-blue-800">
								<CardHeader>
									<CardTitle className="text-xl text-blue-700 dark:text-blue-400">
										Urban (Blue) Areas
									</CardTitle>
									<CardDescription>
										Characteristics and voting patterns
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{[
											{
												label: "Demographics",
												value: "Dense, young, diverse, educated",
											},
											{ label: "Economy", value: "Tech jobs, public transit" },
											{
												label: "Policy Focus",
												value: "Build housing, innovation focus",
											},
											{
												label: "Social Issues",
												value: "Support abortion/trans rights (73-81%)",
											},
											{ label: "Crime", value: "Higher crime per capita" },
											{
												label: "Voting Pattern",
												value: "Vote 70-90% Democrat",
											},
										].map((item) => (
											<div
												key={item.label}
												className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900"
											>
												<div className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-1">
													{item.label}
												</div>
												<div className="text-sm text-slate-700 dark:text-slate-300">
													{item.value}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card className="border-2 border-red-300 dark:border-red-800">
								<CardHeader>
									<CardTitle className="text-xl text-red-700 dark:text-red-400">
										Rural (Red) Areas
									</CardTitle>
									<CardDescription>
										Characteristics and voting patterns
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{[
											{
												label: "Demographics",
												value: "Sparse, older, white, married, religious",
											},
											{
												label: "Economy",
												value: "Farms, small towns, manufacturing",
											},
											{
												label: "Policy Focus",
												value: "Fix housing, preserve traditions",
											},
											{
												label: "Social Issues",
												value: "Restrict abortion/trans rights (34-41%)",
											},
											{ label: "Crime", value: "Lower crime per capita" },
											{
												label: "Voting Pattern",
												value: "Vote 60-80% Republican",
											},
										].map((item) => (
											<div
												key={item.label}
												className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900"
											>
												<div className="font-semibold text-sm text-red-900 dark:text-red-300 mb-1">
													{item.label}
												</div>
												<div className="text-sm text-slate-700 dark:text-slate-300">
													{item.value}
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Policy Comparison */}
						<Card className="border-2 border-slate-300 dark:border-slate-700">
							<CardHeader>
								<CardTitle className="text-2xl">
									Major Policy Areas Compared
								</CardTitle>
								<CardDescription>
									How urban and rural areas differ on key policy issues
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{[
										{
											title: "Housing & Development",
											urban:
												"Pro-density zoning, public housing, transit-oriented development",
											rural:
												"Property rights, low-density preservation, limited regulations",
										},
										{
											title: "Healthcare",
											urban:
												"Universal healthcare, Medicaid expansion, reproductive rights",
											rural:
												"Healthcare access challenges, opposition to ACA mandates",
										},
										{
											title: "Environment & Energy",
											urban:
												"Climate action, renewable energy, emissions regulations",
											rural:
												"Energy independence, fossil fuel jobs, cost concerns",
										},
										{
											title: "Gun Policy",
											urban:
												"Stricter gun control, assault weapon bans, background checks",
											rural:
												"Second Amendment rights, hunting culture, self-defense",
										},
										{
											title: "Immigration",
											urban:
												"Sanctuary policies, pathway to citizenship, diversity support",
											rural:
												"Border security, enforcement, local impact concerns",
										},
										{
											title: "Social Issues",
											urban:
												"LGBTQ+ rights, abortion access, progressive social policy",
											rural:
												"Traditional values, religious freedom, parental rights",
										},
									].map((policy, idx) => (
										<div
											key={policy.title}
											className="p-4 bg-gradient-to-r from-blue-50 via-white to-red-50 dark:from-blue-950/10 dark:via-slate-900 dark:to-red-950/10 rounded-lg border-2 border-slate-200 dark:border-slate-800"
										>
											<h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-slate-100">
												{idx + 1}. {policy.title}
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="p-3 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
													<div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">
														🏙️ URBAN VIEW
													</div>
													<p className="text-sm text-slate-800 dark:text-slate-200">
														{policy.urban}
													</p>
												</div>
												<div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
													<div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
														🌾 RURAL VIEW
													</div>
													<p className="text-sm text-slate-800 dark:text-slate-200">
														{policy.rural}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Crime Statistics */}
						<Card className="border-2 border-orange-300 dark:border-orange-800">
							<CardHeader>
								<CardTitle className="text-2xl">
									Crime Statistics Analysis
								</CardTitle>
								<CardDescription>
									Urban vs rural crime rates per 1,000 residents
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 rounded-lg border-2 border-red-300 dark:border-red-800">
										<h3 className="font-bold text-xl mb-4 text-red-900 dark:text-red-300">
											Urban Areas
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-slate-700 dark:text-slate-300">
													Violent Crime:
												</span>
												<span className="font-bold text-lg text-red-700 dark:text-red-400">
													34.0 / 1,000
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-slate-700 dark:text-slate-300">
													Property Crime:
												</span>
												<span className="font-bold text-lg text-red-700 dark:text-red-400">
													Higher
												</span>
											</div>
											<div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
												Higher population density correlates with increased
												crime rates. Contributing factors include poverty
												concentration, gang activity, and anonymity.
											</div>
										</div>
									</div>

									<div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg border-2 border-green-300 dark:border-green-800">
										<h3 className="font-bold text-xl mb-4 text-green-900 dark:text-green-300">
											Rural Areas
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-slate-700 dark:text-slate-300">
													Violent Crime:
												</span>
												<span className="font-bold text-lg text-green-700 dark:text-green-400">
													16.7 / 1,000
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-slate-700 dark:text-slate-300">
													Property Crime:
												</span>
												<span className="font-bold text-lg text-green-700 dark:text-green-400">
													Lower
												</span>
											</div>
											<div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
												Lower population density and tighter-knit communities
												contribute to lower crime rates. However, challenges
												include opioid crisis and domestic violence.
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Key Insights */}
						<Card className="border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
							<CardHeader>
								<CardTitle className="text-2xl">Key Insights Summary</CardTitle>
								<CardDescription>
									Understanding the data behind the divide
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-900">
										<div className="flex-shrink-0 size-8 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white font-bold">
											1
										</div>
										<div>
											<div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
												Density drives Democratic voting
											</div>
											<div className="text-sm text-slate-600 dark:text-slate-400">
												Counties with over 1,000 people per square mile gave
												Biden 70-80% of votes in 2020. Urban living creates
												support for collective solutions, public services, and
												government programs.
											</div>
										</div>
									</div>
									<div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-900">
										<div className="flex-shrink-0 size-8 rounded-full bg-green-600 dark:bg-green-700 flex items-center justify-center text-white font-bold">
											2
										</div>
										<div>
											<div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
												Economic structures shape political preferences
											</div>
											<div className="text-sm text-slate-600 dark:text-slate-400">
												Urban economies centered on technology, services, and
												creative industries align with Democratic policies.
												Rural economies focused on agriculture and manufacturing
												prefer Republican deregulation approaches.
											</div>
										</div>
									</div>
									<div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-900">
										<div className="flex-shrink-0 size-8 rounded-full bg-purple-600 dark:bg-purple-700 flex items-center justify-center text-white font-bold">
											3
										</div>
										<div>
											<div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
												Cultural values reflect different lifestyles
											</div>
											<div className="text-sm text-slate-600 dark:text-slate-400">
												Urban diversity and education correlate with progressive
												social values. Rural areas maintain traditional values,
												religious communities, and emphasis on individualism and
												self-reliance.
											</div>
										</div>
									</div>
									<div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-900">
										<div className="flex-shrink-0 size-8 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center text-white font-bold">
											4
										</div>
										<div>
											<div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
												Crime statistics tell a complex story
											</div>
											<div className="text-sm text-slate-600 dark:text-slate-400">
												While urban areas have 2x higher violent crime rates,
												both face unique challenges. Cities deal with gang
												violence and property crime; rural areas struggle with
												opioid crisis and limited law enforcement resources.
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{activeView === "population" && (
					<div className="space-y-6">
						<Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/30 dark:border-blue-700">
							<CardHeader>
								<CardTitle className="text-3xl bg-gradient-to-r from-blue-700 via-slate-800 to-red-700 bg-clip-text text-transparent dark:from-blue-400 dark:via-white dark:to-red-400">
									State Population & Representation Analysis
								</CardTitle>
								<CardDescription className="text-base">
									Explore how states are represented in Congress relative to
									their populations, demographics, and voting power
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Population Stats Card */}
									<Card className="border-2 border-blue-300 dark:border-blue-800">
										<CardHeader>
											<CardTitle className="text-xl text-blue-700 dark:text-blue-400">
												Top 10 States by Population
											</CardTitle>
											<CardDescription>
												2023 U.S. Census Bureau estimates
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												{[
													{
														state: "California",
														abbr: "CA",
														pop: "39,029,342",
														reps: 52,
														senators: 2,
													},
													{
														state: "Texas",
														abbr: "TX",
														pop: "30,029,572",
														reps: 38,
														senators: 2,
													},
													{
														state: "Florida",
														abbr: "FL",
														pop: "22,244,823",
														reps: 28,
														senators: 2,
													},
													{
														state: "New York",
														abbr: "NY",
														pop: "19,677,151",
														reps: 26,
														senators: 2,
													},
													{
														state: "Pennsylvania",
														abbr: "PA",
														pop: "12,972,008",
														reps: 17,
														senators: 2,
													},
													{
														state: "Illinois",
														abbr: "IL",
														pop: "12,582,032",
														reps: 17,
														senators: 2,
													},
													{
														state: "Ohio",
														abbr: "OH",
														pop: "11,756,058",
														reps: 15,
														senators: 2,
													},
													{
														state: "Georgia",
														abbr: "GA",
														pop: "10,912,876",
														reps: 14,
														senators: 2,
													},
													{
														state: "North Carolina",
														abbr: "NC",
														pop: "10,698,973",
														reps: 14,
														senators: 2,
													},
													{
														state: "Michigan",
														abbr: "MI",
														pop: "10,034,113",
														reps: 13,
														senators: 2,
													},
												].map((item, idx) => (
													<div
														key={item.abbr}
														className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
													>
														<div className="flex items-center gap-3">
															<div className="flex items-center justify-center size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm">
																{idx + 1}
															</div>
															<div>
																<div className="font-semibold text-slate-900 dark:text-slate-100">
																	{item.state} ({item.abbr})
																</div>
																<div className="text-xs text-slate-600 dark:text-slate-400">
																	Population: {item.pop}
																</div>
															</div>
														</div>
														<div className="text-right">
															<div className="text-sm font-semibold text-blue-700 dark:text-blue-400">
																{item.reps + item.senators} Total
															</div>
															<div className="text-xs text-slate-600 dark:text-slate-400">
																{item.reps} House + {item.senators} Senate
															</div>
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>

									{/* Representation Analysis Card */}
									<Card className="border-2 border-red-300 dark:border-red-800">
										<CardHeader>
											<CardTitle className="text-xl text-red-700 dark:text-red-400">
												Representation per Capita
											</CardTitle>
											<CardDescription>
												Number of residents per House representative
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												{[
													{
														state: "Wyoming",
														abbr: "WY",
														pop: "581,381",
														reps: 1,
														perRep: "581,381",
													},
													{
														state: "Vermont",
														abbr: "VT",
														pop: "647,064",
														reps: 1,
														perRep: "647,064",
													},
													{
														state: "Alaska",
														abbr: "AK",
														pop: "733,583",
														reps: 1,
														perRep: "733,583",
													},
													{
														state: "North Dakota",
														abbr: "ND",
														pop: "779,261",
														reps: 1,
														perRep: "779,261",
													},
													{
														state: "South Dakota",
														abbr: "SD",
														pop: "909,824",
														reps: 1,
														perRep: "909,824",
													},
													{
														state: "Delaware",
														abbr: "DE",
														pop: "1,018,396",
														reps: 1,
														perRep: "1,018,396",
													},
													{
														state: "Rhode Island",
														abbr: "RI",
														pop: "1,093,734",
														reps: 2,
														perRep: "546,867",
													},
													{
														state: "Montana",
														abbr: "MT",
														pop: "1,122,867",
														reps: 2,
														perRep: "561,434",
													},
													{
														state: "Maine",
														abbr: "ME",
														pop: "1,395,722",
														reps: 2,
														perRep: "697,861",
													},
													{
														state: "New Hampshire",
														abbr: "NH",
														pop: "1,395,231",
														reps: 2,
														perRep: "697,616",
													},
												].map((item, idx) => (
													<div
														key={item.abbr}
														className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-600 transition-colors"
													>
														<div className="flex items-center gap-3">
															<div className="flex items-center justify-center size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold text-sm">
																{idx + 1}
															</div>
															<div>
																<div className="font-semibold text-slate-900 dark:text-slate-100">
																	{item.state} ({item.abbr})
																</div>
																<div className="text-xs text-slate-600 dark:text-slate-400">
																	{item.reps} Rep{item.reps > 1 ? "s" : ""}
																</div>
															</div>
														</div>
														<div className="text-right">
															<div className="text-sm font-semibold text-red-700 dark:text-red-400">
																{item.perRep}
															</div>
															<div className="text-xs text-slate-600 dark:text-slate-400">
																per representative
															</div>
														</div>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Congressional Breakdown */}
								<Card className="mt-6 border-2 border-slate-300 dark:border-slate-700">
									<CardHeader>
										<CardTitle className="text-xl">
											Congressional Representation Overview
										</CardTitle>
										<CardDescription>
											How the 435 House seats and 100 Senate seats are
											distributed
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-800">
												<div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
													435
												</div>
												<div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
													House Representatives
												</div>
												<div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
													Distributed by state population (decennial census)
												</div>
											</div>
											<div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 rounded-lg border-2 border-red-300 dark:border-red-800">
												<div className="text-3xl font-bold text-red-700 dark:text-red-400 mb-2">
													100
												</div>
												<div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
													U.S. Senators
												</div>
												<div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
													2 per state (equal representation)
												</div>
											</div>
											<div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border-2 border-slate-300 dark:border-slate-700">
												<div className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">
													~761K
												</div>
												<div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
													Average District Size
												</div>
												<div className="text-xs text-slate-600 dark:text-slate-400 mt-2">
													Average residents per House representative
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Key Insights */}
								<Card className="mt-6 border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
									<CardHeader>
										<CardTitle className="text-xl">Key Insights</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											<div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
												<div className="flex-shrink-0 size-6 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white text-xs font-bold">
													1
												</div>
												<div>
													<div className="font-semibold text-slate-900 dark:text-slate-100">
														Senate provides equal state representation
													</div>
													<div className="text-sm text-slate-600 dark:text-slate-400">
														Every state gets 2 senators regardless of
														population, giving smaller states proportionally
														more power in the Senate
													</div>
												</div>
											</div>
											<div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
												<div className="flex-shrink-0 size-6 rounded-full bg-red-600 dark:bg-red-700 flex items-center justify-center text-white text-xs font-bold">
													2
												</div>
												<div>
													<div className="font-semibold text-slate-900 dark:text-slate-100">
														House seats reapportioned every 10 years
													</div>
													<div className="text-sm text-slate-600 dark:text-slate-400">
														Based on U.S. Census data, states gain or lose
														representatives as populations shift
													</div>
												</div>
											</div>
											<div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
												<div className="flex-shrink-0 size-6 rounded-full bg-slate-600 dark:bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
													3
												</div>
												<div>
													<div className="font-semibold text-slate-900 dark:text-slate-100">
														Representation varies dramatically
													</div>
													<div className="text-sm text-slate-600 dark:text-slate-400">
														Wyoming has 1 rep per 581K residents, while larger
														states may have 1 rep per 750K+ residents
													</div>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</CardContent>
						</Card>
					</div>
				)}
			</main>

			{/* Detail Dialogs */}
			<Dialog
				open={detailDialog === "members"}
				onOpenChange={() => setDetailDialog(null)}
			>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-2xl text-red-700 dark:text-red-400">
							{selectedState
								? `${selectedStateName} Representatives`
								: "All Members of Congress"}
						</DialogTitle>
						<DialogDescription>
							Detailed information about {totalMembers} representative
							{totalMembers !== 1 ? "s" : ""}
							{selectedState
								? ` from ${selectedStateName}`
								: " tracked in our database"}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 mt-4">
						{filteredPoliticians.map((scorecard) => (
							<Card
								key={scorecard.politician.id}
								className="border-2 border-red-200 dark:border-red-900"
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">
												{scorecard.politician.name}
											</CardTitle>
											<CardDescription>
												{scorecard.politician.role} •{" "}
												{scorecard.politician.party} •{" "}
												{scorecard.politician.state}
											</CardDescription>
										</div>
										<div className="text-right text-sm text-muted-foreground">
											{scorecard.politician.yearsOfService} years
										</div>
									</div>
								</CardHeader>
							</Card>
						))}
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={detailDialog === "bills"}
				onOpenChange={() => setDetailDialog(null)}
			>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-2xl text-slate-700 dark:text-slate-300">
							Top 50 Most Pivotal Bills
						</DialogTitle>
						<DialogDescription>
							The most impactful legislation ranked by historical significance
							and policy impact
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 mt-4">
						{mockBills.map((bill) => (
							<Card
								key={bill.id}
								className="border-2 border-slate-200 dark:border-slate-800"
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<CardTitle className="text-lg">{bill.title}</CardTitle>
												{bill.impactRank && (
													<span className="text-xs font-bold text-amber-600 dark:text-amber-400">
														#{bill.impactRank}
													</span>
												)}
											</div>
											<CardDescription className="mb-2">
												{bill.number} • {bill.year} • {bill.chamber}
											</CardDescription>
											<p className="text-sm">{bill.description}</p>
										</div>
									</div>
								</CardHeader>
							</Card>
						))}
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={detailDialog === "categories"}
				onOpenChange={() => setDetailDialog(null)}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-2xl text-blue-700 dark:text-blue-400">
							{selectedState
								? "State Filtering Active"
								: "Major Issue Categories"}
						</DialogTitle>
						<DialogDescription>
							{selectedState
								? `Currently filtering by ${selectedStateName}. You can browse all 10 issue categories.`
								: "Explore congressional voting records across these 10 major policy areas"}
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-3 mt-4">
						{ISSUE_CATEGORIES.map((category) => (
							<Card
								key={category}
								className="border-2 border-blue-200 dark:border-blue-900 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
								onClick={() => {
									setDetailDialog(null);
									setActiveView("issue");
								}}
							>
								<CardHeader className="pb-3">
									<CardTitle className="text-base">{category}</CardTitle>
									<CardDescription className="text-xs">
										View bills and voting records
									</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</DialogContent>
			</Dialog>

			{/* Footer */}
			<footer className="border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm mt-16">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center text-sm text-muted-foreground">
						<p>
							Data sourced from GovTrack.us, Congress.gov, and ProPublica
							Congress API
						</p>
						<p className="mt-2">
							Built to promote transparency and accountability in government
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
