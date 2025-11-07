import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BookOpen,
	CheckCircle,
	Sparkles,
	Target,
	TrendingUp,
} from "lucide-react";

export function TutorialModal() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<BookOpen className="mr-2 h-4 w-4" />
					Tutorial
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Performance Tracker Guide</DialogTitle>
					<DialogDescription>
						Discover how to use this app and understand its deeper purpose
					</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="howto" className="py-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="howto">How to Use</TabsTrigger>
						<TabsTrigger value="magic">
							<Sparkles className="mr-2 h-4 w-4" />
							The Magic Moment
						</TabsTrigger>
					</TabsList>
					<TabsContent value="howto" className="space-y-6 py-4">
						<div className="space-y-3">
							<div className="flex items-start gap-3">
								<Target className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
								<div>
									<h3 className="font-semibold mb-1">Set Your Daily Goals</h3>
									<p className="text-sm text-muted-foreground">
										Navigate to the dashboard to create and track your daily
										performance goals. Set specific targets for different areas
										of your life.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
								<div>
									<h3 className="font-semibold mb-1">Log Daily Entries</h3>
									<p className="text-sm text-muted-foreground">
										Record your daily progress, achievements, and reflections.
										Keep track of what's working and what needs adjustment.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<TrendingUp className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
								<div>
									<h3 className="font-semibold mb-1">Analyze Your Patterns</h3>
									<p className="text-sm text-muted-foreground">
										View your progress over time with visual charts and
										insights. Identify trends and patterns to improve
										consistently.
									</p>
								</div>
							</div>
						</div>

						<div className="pt-4 border-t">
							<h3 className="font-semibold mb-2">Quick Tips</h3>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>
										Be consistent - daily logging helps you spot patterns and
										stay accountable
									</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>
										Start small - focus on a few key goals rather than trying to
										track everything
									</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>
										Review regularly - take time each week to reflect on your
										progress and adjust
									</span>
								</li>
							</ul>
						</div>

						<div className="pt-4 border-t">
							<h3 className="font-semibold mb-2">The Power of Character</h3>
							<div className="space-y-3">
								<blockquote className="pl-4 border-l-2 border-blue-500">
									<p className="text-sm text-muted-foreground italic mb-2">
										"Day by day, hour by hour, man builds the character that
										will determine his place and standing among his associates
										throughout the ages. More important than riches, more
										enduring than fame, more precious than happiness is the
										possession of a noble character. Truly it has been said that
										the grand aim of man's creation is the development of a
										grand character, and grand character is by its very nature
										the product of a probationary discipline."
									</p>
								</blockquote>
								<blockquote className="pl-4 border-l-2 border-purple-500">
									<p className="text-sm text-muted-foreground italic">
										"What is the crowning glory of man in this earth so far as
										his individual achievement is concerned? It is
										character—character developed through obedience to the laws
										of life as revealed through the Gospel of Jesus Christ, who
										came that we might have life and have it more abundantly.
										Man's chief concern in life should not be the acquiring of
										gold nor fame nor material possessions. It should not be the
										development of physical prowess nor of intellectual
										strength, but his aim, the highest in life, should be the
										development of a Christlike character."
									</p>
								</blockquote>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="magic" className="space-y-6 py-4">
						<div className="space-y-4">
							<div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
								<h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
									<Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
									The Magic Moment = The Divine Misalignment Reveal
								</h3>
								<p className="text-sm text-muted-foreground">
									"You're managing your day like <em>you're</em> in control. But
									the pattern shows God is trying to move you toward something
									else."
								</p>
							</div>

							<div className="space-y-3">
								<h4 className="font-semibold">The Three-Layer Gap:</h4>
								<div className="space-y-2 pl-4 border-l-2 border-blue-500">
									<div>
										<div className="text-sm font-medium">1. What I planned</div>
										<div className="text-xs text-muted-foreground">
											Daily Goals - my agenda
										</div>
									</div>
									<div>
										<div className="text-sm font-medium">
											2. What I actually did
										</div>
										<div className="text-xs text-muted-foreground">
											Execution Notes - reality
										</div>
									</div>
									<div>
										<div className="text-sm font-medium">
											3. What I'm becoming
										</div>
										<div className="text-xs text-muted-foreground">
											Pattern over time - God's agenda?
										</div>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
								<h4 className="font-semibold mb-3">The "AH YES" moment:</h4>
								<p className="text-sm text-muted-foreground mb-2">
									After 2 weeks of logging, Insights shows:
								</p>
								<blockquote className="pl-4 border-l-2 border-purple-500 space-y-2 text-sm">
									<p className="italic">
										"You set 'Close deal with Client X' as Goal 1 for 12
										straight days.
									</p>
									<p className="italic">
										Your execution notes show you kept getting 'interrupted' by
										conversations with struggling team members.
									</p>
									<p className="italic">
										Your Self-Reg scores are <strong>highest</strong> on days
										when you 'failed' your #1 goal but helped someone.
									</p>
									<p className="italic font-semibold text-purple-700 dark:text-purple-300">
										Pattern: You're becoming a shepherd, not a closer. Is this
										what God wants?"
									</p>
								</blockquote>
							</div>

							<div className="space-y-3">
								<h4 className="font-semibold">
									Why this solves their problem:
								</h4>
								<ul className="space-y-2 text-sm">
									<li className="flex items-start gap-2">
										<span className="text-emerald-500 font-bold">•</span>
										<div>
											<strong>Emotional management</strong> - The frustration of
											"failed goals" reframes as "divine redirection"
										</div>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-blue-500 font-bold">•</span>
										<div>
											<strong>Self-awareness</strong> - "Why am I stressed?" →
											"Because I'm fighting who I'm becoming"
										</div>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-purple-500 font-bold">•</span>
										<div>
											<strong>Spiritual alignment</strong> - Not just "what did
											I do" but "what is God doing <em>through</em> my actual
											behavior?"
										</div>
									</li>
								</ul>
							</div>

							<div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
								<h4 className="font-semibold mb-3">
									The "Divine Tension" Dashboard:
								</h4>
								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<span className="font-medium">My Plan</span>
										<span className="text-muted-foreground">
											(what I said I'd do)
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-medium">My Reality</span>
										<span className="text-muted-foreground">
											(what I actually did)
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-medium">My Becoming</span>
										<span className="text-muted-foreground">
											(what the pattern suggests)
										</span>
									</div>
									<div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-700">
										<span className="font-medium italic">The Question</span>
										<span className="text-muted-foreground">
											{" "}
											- "Is the gap sin... or surrender?"
										</span>
									</div>
								</div>
							</div>

							<div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
								<h4 className="font-semibold mb-2">
									The key insight TrueOrient provides:
								</h4>
								<p className="text-sm text-muted-foreground mb-3">
									Most productivity apps assume <em>you</em> should win the
									battle against yourself. TrueOrient asks:
								</p>
								<p className="text-base font-semibold text-center text-amber-900 dark:text-amber-100 py-2">
									"What if losing the battle is winning the war?"
								</p>
								<p className="text-sm text-muted-foreground mt-3">
									When your goals fail but your spirit strengthens—that's data.
									That's God moving.
								</p>
							</div>

							<div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-300 dark:border-purple-700">
								<p className="text-sm font-medium italic">
									The magic moment is when the app says:
								</p>
								<p className="text-base font-semibold mt-2 text-purple-700 dark:text-purple-300">
									"Stop fighting this pattern. Maybe it's not weakness. Maybe
									it's calling."
								</p>
							</div>

							<div className="pt-4 border-t space-y-2">
								<p className="text-sm text-muted-foreground">
									This app helps you distinguish between:
								</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
									<div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
										<div className="font-semibold text-red-700 dark:text-red-300">
											Discipline failure
										</div>
										<div className="text-xs text-muted-foreground">
											(fix it)
										</div>
									</div>
									<div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
										<div className="font-semibold text-emerald-700 dark:text-emerald-300">
											Divine redirection
										</div>
										<div className="text-xs text-muted-foreground">
											(follow it)
										</div>
									</div>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
