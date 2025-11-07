import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import {
	EmotionFamilyPicker,
	EmotionTermPicker,
	ImpulsePicker,
	TriggerPicker,
} from "./SelfRegPickers";

describe("SelfRegPickers", () => {
	describe("EmotionFamilyPicker", () => {
		it("should render emotion family picker", () => {
			const onChange = vi.fn();
			render(
				<EmotionFamilyPicker value="" onChange={onChange} disabled={false} />,
			);
			expect(
				screen.getByText("What did this stir up in you?"),
			).toBeInTheDocument();
		});
	});

	describe("TriggerPicker", () => {
		it("should render trigger picker", () => {
			const onChange = vi.fn();
			render(<TriggerPicker value="" onChange={onChange} disabled={false} />);
			expect(screen.getByText("What set this off?")).toBeInTheDocument();
		});
	});

	describe("ImpulsePicker", () => {
		it("should render impulse picker", () => {
			const onChange = vi.fn();
			render(<ImpulsePicker value="" onChange={onChange} disabled={false} />);
			expect(
				screen.getByText("What did you WANT to do next?"),
			).toBeInTheDocument();
		});
	});

	describe("EmotionTermPicker", () => {
		it("should render emotion term picker when family is selected", () => {
			const onChange = vi.fn();
			render(
				<EmotionTermPicker
					emotionFamily="Joy"
					value=""
					onChange={onChange}
					disabled={false}
				/>,
			);
			expect(
				screen.getByText("Can you name it a little more precisely?"),
			).toBeInTheDocument();
		});

		it("should not render when no emotion family is selected", () => {
			const onChange = vi.fn();
			const { container } = render(
				<EmotionTermPicker
					emotionFamily=""
					value=""
					onChange={onChange}
					disabled={false}
				/>,
			);
			expect(container.firstChild).toBeNull();
		});
	});
});
