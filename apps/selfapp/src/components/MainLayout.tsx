import SideNav from "@/components/SideNav";
import { useAuth } from "@/contexts/AuthContext";
import { mockLogs } from "@/data/mockLogs";
import { DailyLogEntryORM } from "@/data/orm/DailyLogEntryORM";
import { Outlet } from "@tanstack/react-router";
import React from "react";
import { Button } from "./ui/button";

export function MainLayout() {
	const { user, logout } = useAuth();

	const handleLoadMockData = async () => {
		const orm = DailyLogEntryORM.getInstance();
		await orm.insertDailyLogEntry(mockLogs as any);
		alert("Mock data loaded. Refresh to see dashboard.");
	};

	const handleRemoveMockData = async () => {
		const orm = DailyLogEntryORM.getInstance();
		await orm.clearAll();
		alert("All data cleared. Refresh to see changes.");
	};

	return (
		<div className="min-h-screen bg-[var(--bg-app)] p-4 md:p-8">
			<div className="bg-grid min-h-screen">
				<div className="max-w-6xl mx-auto">
					<header className="flex justify-between items-center py-4 mb-6">
						<div>
							<h1 className="text-2xl font-bold app-text-strong">
								Performance Tracker
							</h1>
							<p className="text-sm app-text-muted">
								Track daily goals, analyze patterns, and improve consistently
							</p>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm app-text-subtle">{user?.name}</span>
							<Button variant="outline" size="sm" onClick={handleLoadMockData}>
								Load Mock
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={handleRemoveMockData}
							>
								Remove Mock
							</Button>
							<Button variant="ghost" size="sm" onClick={logout}>
								Logout
							</Button>
						</div>
					</header>
					<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
						<div className="md:col-span-3">
							<SideNav />
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
