import SideNav from "@/components/SideNav";
import { useAuth } from "@/contexts/AuthContext";
import { Outlet } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";
import { TutorialModal } from "./TutorialModal";
import { Button } from "./ui/button";

export function MainLayout() {
	const { user, logout } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen bg-[var(--bg-app)] p-4 md:p-8">
			<div className="bg-grid min-h-screen">
				<div className="max-w-6xl mx-auto">
					<header className="flex justify-between items-center py-4 mb-6">
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
								aria-label="Toggle menu"
							>
								{mobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</button>
							<div>
								<h1 className="text-xl md:text-2xl font-bold app-text-strong">
									Performance Tracker
								</h1>
								<p className="text-xs md:text-sm app-text-muted hidden sm:block">
									Track daily goals, analyze patterns, and improve consistently
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 md:gap-4">
							<span className="text-xs md:text-sm app-text-subtle hidden sm:inline">
								{user?.name}
							</span>
							<TutorialModal />
							<Button variant="ghost" size="sm" onClick={logout}>
								Logout
							</Button>
						</div>
					</header>
					<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
						<div className="md:col-span-3">
							<SideNav
								mobileMenuOpen={mobileMenuOpen}
								onMobileMenuClose={() => setMobileMenuOpen(false)}
							/>
						</div>
						<main className="md:col-span-9">
							<Outlet />
						</main>
					</div>
				</div>
			</div>
		</div>
	);
}
