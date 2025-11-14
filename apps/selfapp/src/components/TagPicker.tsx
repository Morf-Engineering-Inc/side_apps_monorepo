import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_TAG_CATEGORIES, type Tag } from "@/types/tags";
import { Plus, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { Tag as TagComponent } from "./Tag";

interface TagPickerProps {
	onSelectTag: (tag: Tag) => void;
	existingTags?: Tag[];
}

const RECENT_TAGS_KEY = "selfapp_recent_tags";
const MAX_RECENT_TAGS = 10;

export function TagPicker({ onSelectTag, existingTags = [] }: TagPickerProps) {
	const [recentTags, setRecentTags] = useState<Tag[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Load recent tags from localStorage
		const stored = localStorage.getItem(RECENT_TAGS_KEY);
		if (stored) {
			try {
				setRecentTags(JSON.parse(stored));
			} catch (e) {
				console.error("Failed to parse recent tags:", e);
			}
		}
	}, []);

	const handleSelectTag = (tag: Tag) => {
		onSelectTag(tag);

		// Update recent tags
		const updatedRecent = [
			tag,
			...recentTags.filter(
				(t) => !(t.key === tag.key && t.value === tag.value),
			),
		].slice(0, MAX_RECENT_TAGS);
		setRecentTags(updatedRecent);
		localStorage.setItem(RECENT_TAGS_KEY, JSON.stringify(updatedRecent));

		setIsOpen(false);
	};

	const isTagAlreadyAdded = (tag: Tag) => {
		return existingTags.some((t) => t.key === tag.key && t.value === tag.value);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 gap-1.5">
					<Tags className="h-3.5 w-3.5" />
					Add Tag
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="start">
				<Tabs defaultValue={recentTags.length > 0 ? "recent" : "categories"}>
					<div className="border-b px-3 py-2">
						<h4 className="font-semibold text-sm">Select Tag</h4>
					</div>
					<TabsList className="w-full grid grid-cols-2 rounded-none border-b h-10">
						<TabsTrigger value="recent" disabled={recentTags.length === 0}>
							Recent
						</TabsTrigger>
						<TabsTrigger value="categories">Categories</TabsTrigger>
					</TabsList>

					<TabsContent value="recent" className="p-3 m-0 space-y-2">
						<div className="flex flex-wrap gap-1.5">
							{recentTags.map((tag, index) => {
								const alreadyAdded = isTagAlreadyAdded(tag);
								return (
									<button
										key={`${tag.key}-${tag.value}-${index}`}
										onClick={() => !alreadyAdded && handleSelectTag(tag)}
										disabled={alreadyAdded}
										className="disabled:opacity-50 disabled:cursor-not-allowed"
										type="button"
									>
										<TagComponent
											tagKey={tag.key}
											tagValue={tag.value}
											onClick={
												!alreadyAdded ? () => handleSelectTag(tag) : undefined
											}
										/>
									</button>
								);
							})}
						</div>
					</TabsContent>

					<TabsContent
						value="categories"
						className="p-3 m-0 space-y-3 max-h-96 overflow-y-auto"
					>
						{DEFAULT_TAG_CATEGORIES.map((category) => (
							<div key={category.name} className="space-y-2">
								<h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
									{category.name}
								</h5>
								<div className="flex flex-wrap gap-1.5">
									{category.tags.map((tag, index) => {
										const alreadyAdded = isTagAlreadyAdded(tag);
										return (
											<button
												key={`${tag.key}-${tag.value}-${index}`}
												onClick={() => !alreadyAdded && handleSelectTag(tag)}
												disabled={alreadyAdded}
												className="disabled:opacity-50 disabled:cursor-not-allowed"
												type="button"
											>
												<TagComponent
													tagKey={tag.key}
													tagValue={tag.value}
													onClick={
														!alreadyAdded
															? () => handleSelectTag(tag)
															: undefined
													}
												/>
											</button>
										);
									})}
								</div>
							</div>
						))}
					</TabsContent>
				</Tabs>
			</PopoverContent>
		</Popover>
	);
}
