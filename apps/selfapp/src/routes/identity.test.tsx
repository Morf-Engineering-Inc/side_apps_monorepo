import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import RouteComponent from "./identity";

describe("Identity Route", () => {
	it("should render the main heading", () => {
		render(<RouteComponent />);
		expect(screen.getByText("Manage Your Identity")).toBeInTheDocument();
	});

	it("should render Tony Robbins principles section", () => {
		render(<RouteComponent />);
		expect(
			screen.getByText("Tony Robbins: The Power of Identity"),
		).toBeInTheDocument();
	});

	it("should render identity statements section", () => {
		render(<RouteComponent />);
		expect(screen.getByText("Your Identity Statements")).toBeInTheDocument();
	});

	it("should render massive action commitments section", () => {
		render(<RouteComponent />);
		expect(screen.getByText("Massive Action Commitments")).toBeInTheDocument();
	});

	it("should render default identity statements", () => {
		render(<RouteComponent />);
		expect(
			screen.getByText("I am someone who values personal growth"),
		).toBeInTheDocument();
		expect(
			screen.getByText("I am disciplined and take consistent action"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Integrity and authenticity guide my choices"),
		).toBeInTheDocument();
	});

	it("should render default action commitments", () => {
		render(<RouteComponent />);
		expect(
			screen.getByText("Practice gratitude journaling daily"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Exercise 30 minutes to embody health"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Read for personal development"),
		).toBeInTheDocument();
	});
});
