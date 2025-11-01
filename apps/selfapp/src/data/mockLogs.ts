import type { DailyLogEntryModel } from "@/components/data/orm/orm_daily_log_entry";
import type { Task } from "@/types/task-tracking";

interface ExtendedDailyLogEntryModel extends DailyLogEntryModel {
	tasks?: Task[] | null;
}

export const mockLogs: Partial<ExtendedDailyLogEntryModel>[] = [
	{
		date: "2025-01-15",
		goals: [
			"Complete project documentation",
			"Review team pull requests",
			"Plan sprint goals for next week",
		],
		execution_notes:
			"Finished all documentation ahead of schedule. Reviewed 5 PRs with detailed feedback. Sprint planning took longer than expected but we aligned on clear objectives.",
		tasks: [
			{
				id: "task-1",
				link: "https://github.com/example/repo/issues/123",
				notes: "Documentation for new API endpoints and integration guide",
				timeEntries: [
					{
						startTime: "2025-01-15T09:00:00.000Z",
						endTime: "2025-01-15T11:30:00.000Z",
						duration: 9000,
					},
					{
						startTime: "2025-01-15T13:00:00.000Z",
						endTime: "2025-01-15T14:15:00.000Z",
						duration: 4500,
					},
				],
			},
			{
				id: "task-2",
				link: "https://github.com/example/repo/pull/456",
				notes: "Code review for authentication refactor PR",
				timeEntries: [
					{
						startTime: "2025-01-15T14:30:00.000Z",
						endTime: "2025-01-15T16:00:00.000Z",
						duration: 5400,
					},
				],
			},
		] as Task[],
		focus_rating: 8,
		energy_rating: 9,
		motivation: 5,
		anxiety: 2,
		confidence: 4,
		difficulties:
			"Had some interruptions during sprint planning, but managed to stay on track overall.",
		performance_score: 9,
		win_lose: true,
		reasoning:
			"Exceeded expectations on documentation and PR reviews. Strong energy throughout the day helped maintain momentum.",
		improvement_notes:
			"Block calendar time for focused work to reduce interruptions.",
		skills: [
			"technical writing",
			"code review",
			"project planning",
			"documentation",
			"planning",
		],
		strengths: ["Communication", "Attention to Detail", "Leadership"],
		scorecard: {
			wins: ["Communication", "Attention to Detail", "Leadership"],
			needs_improvement:
				"Need better time blocking for uninterrupted focus sessions",
		},
	},
	{
		date: "2025-01-14",
		goals: [
			"Debug production issue",
			"Attend stakeholder meeting",
			"Update technical specs",
		],
		execution_notes:
			"Spent most of the morning debugging. Found the root cause by noon. Meeting went well with positive feedback. Specs partially updated.",
		tasks: [
			{
				id: "task-3",
				link: "https://github.com/example/repo/issues/789",
				notes: "Critical production bug - memory leak in API service",
				timeEntries: [
					{
						startTime: "2025-01-14T08:30:00.000Z",
						endTime: "2025-01-14T12:00:00.000Z",
						duration: 12600,
					},
				],
			},
		] as Task[],
		focus_rating: 7,
		energy_rating: 6,
		motivation: 4,
		anxiety: 3,
		confidence: 4,
		difficulties:
			"Low energy in the afternoon made it hard to focus on detailed spec writing. Felt tired after the debugging session.",
		performance_score: 7,
		win_lose: true,
		reasoning:
			"Successfully resolved critical bug and delivered in stakeholder meeting, though didn't complete all planned tasks.",
		improvement_notes:
			"Schedule deep work earlier in the day when energy is higher. Take breaks during intensive debugging.",
		skills: ["debugging", "problem solving", "communication"],
		strengths: ["Persistence", "Analytical Thinking", "Communication"],
		scorecard: {
			wins: ["Persistence", "Analytical Thinking", "Communication"],
			needs_improvement: "Better energy management throughout the day",
		},
	},
	{
		date: "2025-01-13",
		goals: [
			"Implement new feature module",
			"Write unit tests",
			"Code review session",
		],
		execution_notes:
			"Feature implementation went smoothly in the morning. Got distracted by Slack messages and impromptu meetings. Only wrote half the planned tests. Code review was productive.",
		tasks: [
			{
				id: "task-4",
				link: "https://github.com/example/repo/issues/234",
				notes: "User profile enhancement module - adding avatar upload",
				timeEntries: [
					{
						startTime: "2025-01-13T09:00:00.000Z",
						endTime: "2025-01-13T10:45:00.000Z",
						duration: 6300,
					},
					{
						startTime: "2025-01-13T11:30:00.000Z",
						endTime: "2025-01-13T12:30:00.000Z",
						duration: 3600,
					},
				],
			},
			{
				id: "task-5",
				link: "https://github.com/example/repo/pull/567",
				notes: "Code review for payment gateway integration",
				timeEntries: [
					{
						startTime: "2025-01-13T15:00:00.000Z",
						endTime: "2025-01-13T16:00:00.000Z",
						duration: 3600,
					},
				],
			},
		] as Task[],
		focus_rating: 5,
		energy_rating: 7,
		motivation: 3,
		anxiety: 4,
		confidence: 3,
		difficulties:
			"Too many distractions and context switches. Struggled to maintain deep focus on test writing.",
		performance_score: 6,
		win_lose: false,
		reasoning:
			"While I completed the main feature, the lack of focus prevented me from finishing tests, which was a key deliverable.",
		improvement_notes:
			"Use Do Not Disturb mode during coding sessions. Batch Slack check-ins to specific times.",
		skills: ["javascript", "testing", "code review"],
		strengths: ["Adaptability", "Team Collaboration", "Problem Solving"],
		scorecard: {
			wins: ["Adaptability", "Team Collaboration", "Problem Solving"],
			needs_improvement:
				"Better boundary setting to avoid distractions during deep work",
		},
	},
	{
		date: "2025-01-12",
		goals: [
			"Research new technology stack",
			"Prepare presentation slides",
			"Mentoring session with junior dev",
		],
		execution_notes:
			"Research was thorough and enlightening. Created comprehensive slides with demos. Mentoring session was very rewarding - helped unblock junior dev on architecture questions.",
		tasks: [
			{
				id: "task-6",
				link: null,
				notes: "Research on GraphQL federation and Apollo Server v4",
				timeEntries: [
					{
						startTime: "2025-01-12T09:00:00.000Z",
						endTime: "2025-01-12T11:30:00.000Z",
						duration: 9000,
					},
				],
			},
		] as Task[],
		focus_rating: 9,
		energy_rating: 8,
		motivation: 5,
		anxiety: 1,
		confidence: 5,
		difficulties: "None significant - felt in the zone all day.",
		performance_score: 9,
		win_lose: true,
		reasoning:
			"Accomplished all goals with high quality. Great balance between learning, sharing knowledge, and execution.",
		improvement_notes:
			"Replicate this flow state more often - perhaps similar task variety helps maintain engagement.",
		skills: ["research", "presentation", "mentoring"],
		strengths: ["Curiosity", "Teaching", "Leadership"],
		scorecard: {
			wins: ["Curiosity", "Teaching", "Leadership"],
			needs_improvement:
				"Document the research findings better for future reference",
		},
	},
	{
		date: "2025-01-11",
		goals: [
			"Refactor legacy code module",
			"Update API documentation",
			"Team sync meeting",
		],
		execution_notes:
			"Refactoring took longer than anticipated due to unexpected dependencies. Documentation updates were straightforward. Team sync revealed some misalignment that we resolved.",
		tasks: null,
		focus_rating: 6,
		energy_rating: 5,
		motivation: 3,
		anxiety: 4,
		confidence: 2,
		difficulties:
			"Felt overwhelmed by the complexity of the legacy code. Low energy made it harder to push through challenging refactoring work.",
		performance_score: 5,
		win_lose: false,
		reasoning:
			"Didn't complete the refactoring as planned, though made good progress. The complexity was underestimated.",
		improvement_notes:
			"Break down complex refactoring tasks into smaller chunks. Better estimation needed for legacy code work.",
		skills: ["refactoring", "documentation", "communication"],
		strengths: ["Problem Solving", "Adaptability", "Patience"],
		scorecard: {
			wins: ["Problem Solving", "Adaptability", "Patience"],
			needs_improvement:
				"Improve task estimation for complex legacy code projects",
		},
	},
	{
		date: "2025-01-10",
		goals: [
			"Performance optimization sprint",
			"Database query analysis",
			"Load testing",
		],
		execution_notes:
			"Identified and fixed 3 major performance bottlenecks. Query analysis revealed several N+1 problems. Load tests showed 40% improvement in response times.",
		tasks: [
			{
				id: "task-7",
				link: "https://github.com/example/repo/issues/890",
				notes:
					"Database query optimization - fix N+1 queries in user dashboard",
				timeEntries: [
					{
						startTime: "2025-01-10T09:30:00.000Z",
						endTime: "2025-01-10T13:00:00.000Z",
						duration: 12600,
					},
					{
						startTime: "2025-01-10T14:00:00.000Z",
						endTime: "2025-01-10T16:30:00.000Z",
						duration: 9000,
					},
				],
			},
		] as Task[],
		focus_rating: 9,
		energy_rating: 9,
		motivation: 5,
		anxiety: 2,
		confidence: 5,
		difficulties:
			"Initial load test failures were stressful, but pushed through and found solutions.",
		performance_score: 10,
		win_lose: true,
		reasoning:
			"Exceeded all performance targets. Delivered measurable improvements that will impact user experience significantly.",
		improvement_notes:
			"This kind of focused, measurable work is very motivating - seek more optimization opportunities.",
		skills: ["optimization", "database", "testing"],
		strengths: ["Analytical Thinking", "Persistence", "Problem Solving"],
		scorecard: {
			wins: ["Analytical Thinking", "Persistence", "Problem Solving"],
			needs_improvement:
				"Share optimization techniques with team for knowledge transfer",
		},
	},
	{
		date: "2025-01-09",
		goals: [
			"Client demo preparation",
			"Bug fixes from last sprint",
			"Update roadmap",
		],
		execution_notes:
			"Demo prep went smoothly but took more time than expected. Fixed 2 of 3 bugs. Roadmap discussion with product team was productive but lengthy.",
		tasks: null,
		focus_rating: 7,
		energy_rating: 6,
		motivation: 4,
		anxiety: 3,
		confidence: 3,
		difficulties:
			"Procrastination in the morning. Had trouble getting started, which pushed everything back.",
		performance_score: 6,
		win_lose: true,
		reasoning:
			"Completed demo prep and had good discussions, but didn't finish all bug fixes. Mixed results but enough for a win.",
		improvement_notes:
			"Start with a small quick win to build momentum. Morning routine needs improvement.",
		skills: ["presentation", "debugging", "planning"],
		strengths: ["Presentation", "Communication", "Adaptability"],
		scorecard: {
			wins: ["Presentation", "Communication", "Adaptability"],
			needs_improvement:
				"Develop better morning routine to overcome procrastination",
		},
	},
];
