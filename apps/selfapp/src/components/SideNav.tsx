import { useLocation, useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	BookOpen,
	Brain,
	Calendar,
	Sparkles,
	Target,
	User,
} from "lucide-react";
import type React from "react";

type Props = {
	active?: string;
	onChange?: (v: string) => void;
};

const items: {
	id: string;
	label: string;
	icon: React.ReactNode;
	path: string;
}[] = [
	{
		id: "log",
		label: "Daily Log",
		icon: <Calendar className="h-4 w-4" />,
		path: "/",
	},
	{
		id: "dashboard",
		label: "Dashboard",
		icon: <BarChart3 className="h-4 w-4" />,
		path: "/",
	},
	{
		id: "become",
		label: "Become",
		icon: <BookOpen className="h-4 w-4" />,
		path: "/become",
	},
	{
		id: "success",
		label: "Define Success",
		icon: <Target className="h-4 w-4" />,
		path: "/success",
	},
	{
		id: "letgod",
		label: "Let God Prevail",
		icon: <Sparkles className="h-4 w-4" />,
		path: "/letgod",
	},
	{
		id: "selfreg",
		label: "Self-Reg",
		icon: <User className="h-4 w-4" />,
		path: "/selfreg",
	},
	{
		id: "insights",
		label: "Insights",
		icon: <Brain className="h-4 w-4" />,
		path: "/",
	},
	{
		id: "profile",
		label: "Profile",
		icon: <User className="h-4 w-4" />,
		path: "/profile",
	},
];

export default function SideNav({ active, onChange }: Props) {
	const location = useLocation();
	const navigate = useNavigate();

	const getActive = () => {
		if (location.pathname === "/become") return "become";
		if (location.pathname === "/success") return "success";
		if (location.pathname === "/selfreg") return "selfreg";
		if (location.pathname === "/letgod") return "letgod";
		if (location.pathname === "/profile") return "profile";
		if (location.pathname === "/") {
			// Check URL params for tab state
			const urlParams = new URLSearchParams(window.location.search);
			const tabParam = urlParams.get("tab");
			return tabParam || active || "log";
		}
		return "";
	};

	const currentActive = getActive();

	const handleClick = (item: (typeof items)[0]) => {
		if (item.path === "/") {
			// For main page tabs (log, dashboard, insights)
			if (onChange) {
				onChange(item.id);
			}
			// Also call the global tab handler if available
			if ((window as any).__setMainTab) {
				(window as any).__setMainTab(item.id);
			}
			if (location.pathname !== "/") {
				navigate({ to: `/?tab=${item.id}` });
			} else {
				// Update URL with tab parameter
				const url = new URL(window.location.href);
				url.searchParams.set("tab", item.id);
				window.history.replaceState({}, "", url.toString());
			}
		} else {
			navigate({ to: item.path as any });
		}
	};

	return (
		<nav className="hidden md:block pr-6">
			<div className="sticky top-6">
				<div className="mb-6 px-3">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
						Journal
					</h2>
					<p className="text-xs text-zinc-600 dark:text-zinc-300">
						Moments that shape who you are
					</p>
				</div>

				<ul className="space-y-2">
					{items.map((it) => {
						const isActive = currentActive === it.id;
						return (
							<li key={it.id}>
								<button
									onClick={() => handleClick(it)}
									className={`flex items-center w-full gap-3 px-3 py-2 rounded-md text-left transition-colors text-sm font-medium ${
										isActive
											? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow"
											: "text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700"
									}`}
								>
									<span className="opacity-90">{it.icon}</span>
									<span className="flex-1">{it.label}</span>
								</button>
							</li>
						);
					})}
				</ul>

				<div className="mt-6 px-3">
					<p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
						Quick tip
					</p>
					<p className="text-xs text-zinc-700 dark:text-zinc-200 mt-1">
						Log a moment in under 15s — review weekly patterns.
					</p>
				</div>
			</div>
		</nav>
	);
}
