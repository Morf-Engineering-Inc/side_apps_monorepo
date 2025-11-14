import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tag } from "@/types/tags";
import { Plus } from "lucide-react";
import { useState } from "react";

interface TagManagementModalProps {
	onAddTag: (tag: Tag) => void;
	trigger?: React.ReactNode;
}

export function TagManagementModal({
	onAddTag,
	trigger,
}: TagManagementModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [tagKey, setTagKey] = useState("");
	const [tagValue, setTagValue] = useState("");

	const handleAddTag = () => {
		if (tagKey.trim() && tagValue.trim()) {
			onAddTag({
				key: tagKey.trim().toLowerCase(),
				value: tagValue.trim().toLowerCase(),
			});
			setTagKey("");
			setTagValue("");
			setIsOpen(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleAddTag();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm" className="h-8 gap-1.5">
						<Plus className="h-3.5 w-3.5" />
						Add New
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Custom Tag</DialogTitle>
					<DialogDescription>
						Add a custom tag to track your work goals. Tags work like AWS tags
						with key-value pairs.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="tag-key">Tag Key</Label>
						<Input
							id="tag-key"
							placeholder="e.g., project, client, type"
							value={tagKey}
							onChange={(e) => setTagKey(e.target.value)}
							onKeyPress={handleKeyPress}
						/>
						<p className="text-xs text-muted-foreground">
							The category or type of the tag
						</p>
					</div>
					<div className="space-y-2">
						<Label htmlFor="tag-value">Tag Value</Label>
						<Input
							id="tag-value"
							placeholder="e.g., website, acme-corp, urgent"
							value={tagValue}
							onChange={(e) => setTagValue(e.target.value)}
							onKeyPress={handleKeyPress}
						/>
						<p className="text-xs text-muted-foreground">
							The specific value for this tag
						</p>
					</div>
					<div className="rounded-lg bg-muted p-3">
						<p className="text-xs text-muted-foreground mb-2">Preview:</p>
						<div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
							<span className="font-semibold">{tagKey || "key"}:</span>
							<span>{tagValue || "value"}</span>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<Button
						onClick={handleAddTag}
						disabled={!tagKey.trim() || !tagValue.trim()}
					>
						Add Tag
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
