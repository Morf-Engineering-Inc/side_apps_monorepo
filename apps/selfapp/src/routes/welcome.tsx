import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/welcome")({
	component: WelcomePage,
});

function WelcomePage() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		navigate({ to: "/" });
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
			<header className="container mx-auto px-4 py-6 flex justify-between items-center">
				<h1 className="text-2xl font-bold">Become</h1>
				<Button onClick={() => navigate({ to: "/login" })}>
					Login or Sign Up
				</Button>
			</header>

			<main className="container mx-auto px-4 py-16 text-center">
				<h2 className="text-5xl font-extrabold mb-4">
					Let Your Work Shape Who You Become
				</h2>
				<p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-8">
					This isn't just another task manager. It's a tool for personal
					transformation. We help you set intentional goals, not just to get
					things done, but to become the person you want to be.
				</p>
				<Button size="lg" onClick={() => navigate({ to: "/login" })}>
					Start Your Journey
				</Button>
			</main>

			<section className="bg-white dark:bg-zinc-900 py-20">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-3 gap-12 text-center">
						<div className="flex flex-col items-center">
							<div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full mb-4">
								<Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Set Intentional Goals
							</h3>
							<p className="text-zinc-600 dark:text-zinc-400">
								Define not just what you want to do, but who you want to become
								through your work.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4">
								<TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Track Your Progress
							</h3>
							<p className="text-zinc-600 dark:text-zinc-400">
								Log your daily performance and reflections to see patterns in
								your growth over time.
							</p>
						</div>
						<div className="flex flex-col items-center">
							<div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-full mb-4">
								<CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
							</div>
							<h3 className="text-xl font-semibold mb-2">
								Achieve Transformation
							</h3>
							<p className="text-zinc-600 dark:text-zinc-400">
								Use insights from your journey to make consistent improvements
								and shape your character.
							</p>
						</div>
					</div>
				</div>
			</section>

			<footer className="container mx-auto px-4 py-8 text-center text-zinc-500">
				<p>&copy; 2025 Become, Inc. All rights reserved.</p>
			</footer>
		</div>
	);
}
