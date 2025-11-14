import { X } from "lucide-react";
import { Button } from "./ui/button";

interface TagProps {
	tagKey: string;
	tagValue: string;
	onRemove?: () => void;
	onClick?: () => void;
	variant?: "default" | "priority-high" | "priority-medium" | "priority-low";
}

export function Tag({
	tagKey,
	tagValue,
	onRemove,
	onClick,
	variant = "default",
}: TagProps) {
	const getTagStyles = () => {
		// Color coding based on tag type
		if (tagKey === "priority") {
			if (tagValue === "high")
				return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
			if (tagValue === "medium")
				return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
			if (tagValue === "low")
				return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
		}
		if (tagKey === "impact") {
			if (tagValue === "critical")
				return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
			if (tagValue === "high")
				return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
		}
		if (tagKey === "time") {
			return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
		}
		if (tagKey === "category") {
			return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
		}
		return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
	};

	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getTagStyles()} ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
			onClick={onClick}
		>
			<span className="font-semibold">{tagKey}:</span>
			<span>{tagValue}</span>
			{onRemove && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5"
				>
					<X className="h-3 w-3" />
				</button>
			)}
		</span>
	);
}

interface TagListProps {
	tags: Array<{ key: string; value: string }>;
	onRemoveTag?: (index: number) => void;
}

export function TagList({ tags, onRemoveTag }: TagListProps) {
	if (tags.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-1.5 mt-2">
			{tags.map((tag, index) => (
				<Tag
					key={`${tag.key}-${tag.value}-${index}`}
					tagKey={tag.key}
					tagValue={tag.value}
					onRemove={onRemoveTag ? () => onRemoveTag(index) : undefined}
				/>
			))}
		</div>
	);
}
