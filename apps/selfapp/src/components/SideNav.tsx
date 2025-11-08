import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	BookOpen,
	Brain,
	Calendar,
	CreditCard,
	Lock,
	Shield,
	Sparkles,
	Target,
	User,
	UserCircle,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

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
	premium?: boolean; // Mark premium features
}[] = [
	{
		id: "log",
		label: "Daily Log",
		icon: <Calendar className="h-4 w-4" />,
		path: "/",
		premium: false, // Free tier
	},
	{
		id: "dashboard",
		label: "Dashboard",
		icon: <BarChart3 className="h-4 w-4" />,
		path: "/",
		premium: false, // Free tier (basic insights)
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
		premium: true, // Premium only
	},
	{
		id: "identity",
		label: "Manage Identity",
		icon: <UserCircle className="h-4 w-4" />,
		path: "/identity",
		premium: true, // Premium only
	},
	{
		id: "success",
		label: "Define Success",
		icon: <Target className="h-4 w-4" />,
		path: "/success",
		premium: true, // Premium only
	},
	{
		id: "letgod",
		label: "Let God Prevail",
		icon: <Sparkles className="h-4 w-4" />,
		path: "/letgod",
		premium: true, // Premium only
	},
	{
		id: "selfreg",
		label: "Self-Reg",
		icon: <User className="h-4 w-4" />,
		path: "/selfreg",
		premium: true, // Premium only
	},
	{
		id: "insights",
		label: "Insights",
		icon: <Brain className="h-4 w-4" />,
		path: "/",
		premium: true, // Premium only
	},
	{
		id: "profile",
		label: "Profile",
		icon: <User className="h-4 w-4" />,
		path: "/profile",
		premium: false, // Free tier
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
	const { isPremium, isAdmin } = useSubscription();
	const [showPaywall, setShowPaywall] = useState(false);

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
		// Check if premium feature and user doesn't have access
		if (item.premium && !isPremium && !isAdmin) {
			setShowPaywall(true);
			return;
		}

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
							const isLocked = it.premium && !isPremium && !isAdmin;
							return (
								<li key={it.id}>
									<button
										type="button"
										onClick={() => handleClick(it)}
										className={`flex items-center w-full gap-3 px-3 py-2 rounded-md text-left transition-colors text-sm font-medium ${
											isActive
												? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow"
												: "app-text-strong hover:app-bg-surface-alt"
										} ${isLocked ? "opacity-70" : ""}`}
									>
										<span className="opacity-90">{it.icon}</span>
										<span className="flex-1">{it.label}</span>
										{isLocked && (
											<Lock className="h-3 w-3 text-muted-foreground" />
										)}
									</button>
								</li>
							);
						})}
						<li>
							<button
								type="button"
								onClick={() => navigate({ to: "/pricing" })}
								className="flex items-center w-full gap-3 px-3 py-2 rounded-md text-left transition-colors text-sm font-medium app-text-strong hover:app-bg-surface-alt border border-primary/30"
							>
								<CreditCard className="h-4 w-4 opacity-90" />
								<span className="flex-1">Pricing</span>
							</button>
						</li>
					</ul>

					<div className="mt-6 px-3">
						<p className="text-xs app-text-subtle font-medium">Quick tip</p>
						<p className="text-xs app-text-subtle mt-1">
							Log a moment in under 15s — review weekly patterns.
						</p>
					</div>
				</div>
			</nav>

			{/* Paywall Dialog */}
			<Dialog open={showPaywall} onOpenChange={setShowPaywall}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Lock className="h-5 w-5" />
							Premium Feature
						</DialogTitle>
						<DialogDescription>
							Upgrade to Premium to unlock advanced features like identity management,
							success tracking, and more!
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col sm:flex-row gap-2">
						<Button variant="outline" onClick={() => setShowPaywall(false)}>
							Maybe Later
						</Button>
						<Button
							onClick={() => {
								setShowPaywall(false);
								navigate({ to: "/pricing" });
							}}
						>
							View Pricing
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
