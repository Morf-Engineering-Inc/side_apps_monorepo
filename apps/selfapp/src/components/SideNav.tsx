import { useLocation, useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	BookOpen,
	Brain,
	Calendar,
	Shield,
	Sparkles,
	Target,
	User,
	UserCircle,
} from "lucide-react";
import type React from "react";

type Props = {
	active?: string;
	onChange?: (v: string) => void;
	mobileMenuOpen?: boolean;
	onMobileMenuClose?: () => void;
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
		id: "insights",
		label: "Insights",
		icon: <Brain className="h-4 w-4" />,
		path: "/",
	},
	{
		id: "integrity",
		label: "Integrity",
		icon: <Shield className="h-4 w-4" />,
		path: "/",
	},
	{
		id: "become",
		label: "Become",
		icon: <BookOpen className="h-4 w-4" />,
		path: "/become",
	},
	{
		id: "identity",
		label: "Manage Identity",
		icon: <UserCircle className="h-4 w-4" />,
		path: "/identity",
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
		id: "profile",
		label: "Profile",
		icon: <User className="h-4 w-4" />,
		path: "/profile",
	},
];

export default function SideNav({
	active,
	onChange,
	mobileMenuOpen,
	onMobileMenuClose,
}: Props) {
	const location = useLocation();
	const navigate = useNavigate();

	const getActive = () => {
		if (location.pathname === "/become") return "become";
		if (location.pathname === "/identity") return "identity";
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
		// Close mobile menu when navigating
		if (onMobileMenuClose) {
			onMobileMenuClose();
		}

		if (item.path === "/") {
			// For main page tabs (log, dashboard, insights, integrity)
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
		<>
			{/* Mobile Overlay */}
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden"
					onClick={onMobileMenuClose}
					onKeyDown={(e) => {
						if (e.key === "Escape" && onMobileMenuClose) {
							onMobileMenuClose();
						}
					}}
					role="button"
					tabIndex={0}
					aria-label="Close menu"
				/>
			)}

			{/* Navigation Menu */}
			<nav
				className={`
					fixed md:static inset-y-0 left-0 z-50 
					transform transition-transform duration-300 ease-in-out
					md:transform-none
					${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
					w-64 md:w-auto
					bg-[var(--bg-app)] md:bg-transparent
					shadow-xl md:shadow-none
					p-6 md:p-0 md:pr-6
					overflow-y-auto
				`}
			>
				<div className="md:sticky md:top-6">
					<div className="mb-6 px-3">
						<h2 className="text-xl font-semibold app-text-strong">Journal</h2>
						<p className="text-xs app-text-subtle">
							Moments that shape who you are
						</p>
					</div>

					<ul className="space-y-2">
						{items.map((it) => {
							const isActive = currentActive === it.id;
							return (
								<li key={it.id}>
									<button
										type="button"
										onClick={() => handleClick(it)}
										className={`flex items-center w-full gap-3 px-3 py-2 rounded-md text-left transition-colors text-sm font-medium ${
											isActive
												? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow"
												: "app-text-strong hover:app-bg-surface-alt"
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
						<p className="text-xs app-text-subtle font-medium">Quick tip</p>
						<p className="text-xs app-text-subtle mt-1">
							Log a moment in under 15s — review weekly patterns.
						</p>
					</div>
				</div>
			</nav>
		</>
	);
}
