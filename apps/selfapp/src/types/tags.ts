export interface Tag {
	key: string;
	value: string;
}

export interface GoalWithTags {
	text: string;
	tags: Tag[];
}

export interface TagCategory {
	name: string;
	icon?: string;
	tags: Tag[];
}

export const DEFAULT_TAG_CATEGORIES: TagCategory[] = [
	{
		name: "Priority",
		tags: [
			{ key: "priority", value: "high" },
			{ key: "priority", value: "medium" },
			{ key: "priority", value: "low" },
		],
	},
	{
		name: "Time Budget",
		tags: [
			{ key: "time", value: "30min" },
			{ key: "time", value: "1hr" },
			{ key: "time", value: "2hr" },
			{ key: "time", value: "4hr" },
			{ key: "time", value: "full-day" },
		],
	},
	{
		name: "Category",
		tags: [
			{ key: "category", value: "development" },
			{ key: "category", value: "research" },
			{ key: "category", value: "meetings" },
			{ key: "category", value: "planning" },
			{ key: "category", value: "review" },
			{ key: "category", value: "learning" },
		],
	},
	{
		name: "Impact",
		tags: [
			{ key: "impact", value: "critical" },
			{ key: "impact", value: "high" },
			{ key: "impact", value: "medium" },
			{ key: "impact", value: "low" },
		],
	},
];
