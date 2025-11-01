import { useDelegatedComponentEventHandler } from "@/lib/report-parent-window";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Card({
	className,
	id,
	name,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
	name?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "card",
		eventType: "click",
		componentInfo: {
			id,
			name,
		},
	}));

	return (
		<div
			data-slot="card"
			id={id}
			data-name={name}
			onClick={handleClick}
			className={cn(
				"relative bg-card/90 text-card-foreground flex flex-col gap-6 rounded-2xl border border-white/10 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_30px_-10px_rgba(0,0,0,0.6)] ring-1 ring-white/5 transition-all duration-300 ease-out hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_-12px_rgba(0,0,0,0.75)] hover:-translate-y-0.5 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-white/10 before:via-white/30 before:to-white/10 before:rounded-t-2xl before:content-['']",
				className,
			)}
			{...props}
		/>
	);
}

function CardHeader({
	className,
	id,
	name,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
	name?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "card-header",
		eventType: "click",
		componentInfo: {
			id,
			name,
		},
	}));
	return (
		<div
			data-slot="card-header"
			id={id}
			data-name={name}
			onClick={handleClick}
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className,
			)}
			{...props}
		/>
	);
}

function CardTitle({
	className,
	id,
	name,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
	name?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "card-title",
		eventType: "click",
		componentInfo: {
			id,
			name,
		},
	}));
	return (
		<div
			data-slot="card-title"
			id={id}
			data-name={name}
			onClick={handleClick}
			className={cn("leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function CardDescription({
	className,
	id,
	name,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
	name?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "card-description",
		eventType: "click",
		componentInfo: {
			id,
			name,
		},
	}));
	return (
		<div
			data-slot="card-description"
			id={id}
			data-name={name}
			onClick={handleClick}
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function CardAction({
	className,
	id,
	name,
	onClick,
	...props
}: React.ComponentProps<"div"> & {
	id?: string;
	name?: string;
}) {
	const handleClick = useDelegatedComponentEventHandler(onClick, () => ({
		componentType: "card-action",
		eventType: "click",
		componentInfo: {
			id,
			name,
		},
	}));
	return (
		<div
			data-slot="card-action"
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className,
			)}
			onClick={handleClick}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardContent,
};
