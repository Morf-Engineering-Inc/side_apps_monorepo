import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame, Sparkles, Target } from "lucide-react";

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
		<div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0f1e] to-[#0f0a1a] text-zinc-100">
			{/* Animated fire glow background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
				<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
			</div>

			<header className="relative container mx-auto px-4 py-6 flex justify-between items-center">
				<div className="flex items-center gap-2">
					<div className="relative">
						<Flame className="h-6 w-6 text-amber-400" />
						<div className="absolute inset-0 blur-md bg-amber-400/30" />
					</div>
					<h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-orange-300 to-amber-200 bg-clip-text text-transparent">
						TrueOrient
					</h1>
				</div>
				<Button
					onClick={() => navigate({ to: "/login" })}
					className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
				>
					Begin Your Journey
				</Button>
			</header>

			<main className="relative container mx-auto px-4 py-24 text-center">
				<div className="max-w-4xl mx-auto">
					<div className="inline-block mb-6 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/5">
						<span className="text-sm text-amber-300">
							Align your heart to love
						</span>
					</div>

					<h2 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
						<span className="bg-gradient-to-br from-white via-amber-100 to-orange-200 bg-clip-text text-transparent">
							Your heart points
							<br />
							somewhere
						</span>
					</h2>

					<p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
						That direction determines who you become. TrueOrient helps you
						discover your{" "}
						<span className="text-amber-300 font-semibold">true why</span> — not
						just any motivation, but the one that transforms you.
					</p>

					<Button
						size="lg"
						onClick={() => navigate({ to: "/login" })}
						className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 text-lg px-8 py-6 shadow-[0_0_30px_rgba(251,146,60,0.3)] hover:shadow-[0_0_40px_rgba(251,146,60,0.5)] transition-all"
					>
						Start Orienting
					</Button>
				</div>
			</main>

			{/* Testimonials Section - Refined Fire Theme */}
			<section className="relative py-32 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/10 to-transparent" />

				<div className="relative container mx-auto px-4">
					<div className="text-center mb-16">
						<h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
							Refined Through Fire
						</h3>
						<p className="text-zinc-500">Words that shaped the journey</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
						{/* Card 1 - Stone */}
						<div className="group relative">
							<div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
							<div className="relative bg-zinc-900/50 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/40 transition-all">
								<div className="flex items-start gap-4 mb-6">
									<div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
										<Target className="h-6 w-6 text-amber-400" />
									</div>
								</div>
								<blockquote className="text-zinc-300 leading-relaxed mb-4 italic">
									"I am like a huge, rough stone rolling down from a high
									mountain, and the only polishing I get is when some corner
									gets rubbed off... thus I will become a smooth and polished
									shaft."
								</blockquote>
								<cite className="text-sm text-amber-400/80 not-italic">
									— Joseph Smith
								</cite>
							</div>
						</div>

						{/* Card 2 - Judgment */}
						<div className="group relative">
							<div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
							<div className="relative bg-zinc-900/50 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 hover:border-orange-500/40 transition-all">
								<div className="flex items-start gap-4 mb-6">
									<div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
										<Sparkles className="h-6 w-6 text-orange-400" />
									</div>
								</div>
								<blockquote className="text-zinc-300 leading-relaxed mb-4 italic">
									"The Final Judgment is not just an evaluation of good and evil
									acts — what we have done. It is an acknowledgment of the final
									effect of our acts and thoughts — what we have become."
								</blockquote>
								<cite className="text-sm text-orange-400/80 not-italic">
									— Dallin H. Oaks
								</cite>
							</div>
						</div>

						{/* Card 3 - Love */}
						<div className="group relative">
							<div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-amber-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
							<div className="relative bg-zinc-900/50 backdrop-blur-sm border border-rose-500/20 rounded-2xl p-8 hover:border-rose-500/40 transition-all">
								<div className="flex items-start gap-4 mb-6">
									<div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20">
										<Flame className="h-6 w-6 text-rose-400" />
									</div>
								</div>
								<blockquote className="text-zinc-300 leading-relaxed mb-4 italic">
									"Bridle all your passions, that ye may be filled with love."
								</blockquote>
								<cite className="text-sm text-rose-400/80 not-italic">
									— Alma 38:12
								</cite>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="relative py-20">
				<div className="container mx-auto px-4">
					<div className="grid md:grid-cols-3 gap-12 text-center max-w-6xl mx-auto">
						<div className="group">
							<div className="relative inline-block mb-6">
								<div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/30 transition-all" />
								<div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 rounded-2xl border border-amber-500/20">
									<Target className="h-10 w-10 text-amber-400 mx-auto" />
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-3 text-amber-100">
								Discover Your True Why
							</h3>
							<p className="text-zinc-400 leading-relaxed">
								Move beyond surface motivations. Find the direction that aligns
								your heart with love and purpose.
							</p>
						</div>

						<div className="group">
							<div className="relative inline-block mb-6">
								<div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full group-hover:bg-orange-500/30 transition-all" />
								<div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-2xl border border-orange-500/20">
									<Flame className="h-10 w-10 text-orange-400 mx-auto" />
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-3 text-orange-100">
								Refine Through Practice
							</h3>
							<p className="text-zinc-400 leading-relaxed">
								Like silver in the refiner's fire, each moment of reflection
								purifies your intentions and strengthens your character.
							</p>
						</div>

						<div className="group">
							<div className="relative inline-block mb-6">
								<div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full group-hover:bg-rose-500/30 transition-all" />
								<div className="relative bg-gradient-to-br from-rose-500/10 to-amber-500/10 p-6 rounded-2xl border border-rose-500/20">
									<Sparkles className="h-10 w-10 text-rose-400 mx-auto" />
								</div>
							</div>
							<h3 className="text-xl font-semibold mb-3 text-rose-100">
								Become Who You're Meant to Be
							</h3>
							<p className="text-zinc-400 leading-relaxed">
								Not just achieving goals, but transformation. Track how each
								choice shapes the person you're becoming.
							</p>
						</div>
					</div>
				</div>
			</section>

			<footer className="relative container mx-auto px-4 py-12 text-center border-t border-zinc-800">
				<div className="flex items-center justify-center gap-2 mb-4">
					<Flame className="h-4 w-4 text-amber-500/50" />
					<p className="text-zinc-600">TrueOrient</p>
				</div>
				<p className="text-zinc-700 text-sm">
					&copy; 2025 TrueOrient. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
