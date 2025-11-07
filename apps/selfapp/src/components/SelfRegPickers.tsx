import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import emotionsData from "@/data/emotions_list.json";
import triggerData from "@/data/trigger_taxonomy.json";

interface EmotionFamilyPickerProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

export function EmotionFamilyPicker({
	value,
	onChange,
	disabled,
}: EmotionFamilyPickerProps) {
	return (
		<div>
			<Label>What did this stir up in you?</Label>
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="Choose a general feeling..." />
				</SelectTrigger>
				<SelectContent>
					{emotionsData.emotion_families.map((family) => (
						<SelectItem key={family.family} value={family.family}>
							{family.family}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-xs app-text-muted mt-1">
				You don't need to analyze — just name the feeling.
			</p>
		</div>
	);
}

interface EmotionTermPickerProps {
	emotionFamily: string;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

export function EmotionTermPicker({
	emotionFamily,
	value,
	onChange,
	disabled,
}: EmotionTermPickerProps) {
	const family = emotionsData.emotion_families.find(
		(f) => f.family === emotionFamily,
	);

	if (!family) {
		// This is expected behavior when no emotion family is selected yet
		if (emotionFamily) {
			console.warn(
				`EmotionTermPicker: Unknown emotion family "${emotionFamily}"`,
			);
		}
		return null;
	}

	return (
		<div>
			<Label>Can you name it a little more precisely?</Label>
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="Which word fits best?" />
				</SelectTrigger>
				<SelectContent>
					{family.terms.map((term) => (
						<SelectItem key={term} value={term}>
							{term}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-xs app-text-muted mt-1">
				Naming builds awareness. Awareness builds agency.
			</p>
		</div>
	);
}

interface TriggerPickerProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

export function TriggerPicker({
	value,
	onChange,
	disabled,
}: TriggerPickerProps) {
	return (
		<div>
			<Label>What set this off?</Label>
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="Choose a trigger..." />
				</SelectTrigger>
				<SelectContent className="max-h-[400px]">
					{triggerData.trigger_taxonomy.map((category) => (
						<SelectGroup key={category.category}>
							<SelectLabel>{category.category}</SelectLabel>
							{category.triggers.map((trigger) => (
								<SelectItem key={trigger.id} value={trigger.id}>
									{trigger.label}
								</SelectItem>
							))}
						</SelectGroup>
					))}
				</SelectContent>
			</Select>
			<p className="text-xs app-text-muted mt-1">
				You don't need to analyze — just name the cue.
			</p>
		</div>
	);
}

interface ImpulsePickerProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

export function ImpulsePicker({
	value,
	onChange,
	disabled,
}: ImpulsePickerProps) {
	return (
		<div>
			<Label>What did you WANT to do next?</Label>
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="Choose the impulse..." />
				</SelectTrigger>
				<SelectContent>
					{triggerData.impulse_taxonomy.map((impulse) => (
						<SelectItem key={impulse.id} value={impulse.id}>
							{impulse.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-xs app-text-muted mt-1">We name it without shame.</p>
		</div>
	);
}
