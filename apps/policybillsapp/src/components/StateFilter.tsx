import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type USState, US_STATES } from "@/types";
import { X } from "lucide-react";

interface StateFilterProps {
	value?: USState;
	onValueChange: (state: USState | undefined) => void;
	placeholder?: string;
}

export function StateFilter({
	value,
	onValueChange,
	placeholder = "National",
}: StateFilterProps) {
	return (
		<div className="flex items-center gap-2">
			<Select
				value={value || ""}
				onValueChange={(val) => onValueChange(val as USState)}
			>
				<SelectTrigger className="w-[200px] border-2 border-blue-300 bg-white hover:border-blue-500 focus:border-blue-600 dark:border-blue-700 dark:bg-slate-900 dark:hover:border-blue-600">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{US_STATES.map((state) => (
						<SelectItem key={state.value} value={state.value}>
							{state.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{value && (
				<Button
					variant="outline"
					size="icon"
					onClick={() => onValueChange(undefined)}
					className="border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-500 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
					title="Clear filter - Show all states"
				>
					<X className="size-4" />
				</Button>
			)}
		</div>
	);
}
