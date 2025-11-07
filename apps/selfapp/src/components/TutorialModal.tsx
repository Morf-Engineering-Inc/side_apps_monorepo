import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, CheckCircle, Target, TrendingUp } from "lucide-react";

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
					<DialogTitle>Performance Tracker - How to Use</DialogTitle>
					<DialogDescription>
						A quick guide to help you get the most out of your tracking
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<Target className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
							<div>
								<h3 className="font-semibold mb-1">Set Your Daily Goals</h3>
								<p className="text-sm text-muted-foreground">
									Navigate to the dashboard to create and track your daily
									performance goals. Set specific targets for different areas of
									your life.
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
									View your progress over time with visual charts and insights.
									Identify trends and patterns to improve consistently.
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
									Be consistent - daily logging helps you spot patterns and stay
									accountable
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
									"Day by day, hour by hour, man builds the character that will
									determine his place and standing among his associates
									throughout the ages. More important than riches, more enduring
									than fame, more precious than happiness is the possession of a
									noble character. Truly it has been said that the grand aim of
									man's creation is the development of a grand character, and
									grand character is by its very nature the product of a
									probationary discipline."
								</p>
							</blockquote>
							<blockquote className="pl-4 border-l-2 border-purple-500">
								<p className="text-sm text-muted-foreground italic">
									"What is the crowning glory of man in this earth so far as his
									individual achievement is concerned? It is character—character
									developed through obedience to the laws of life as revealed
									through the Gospel of Jesus Christ, who came that we might
									have life and have it more abundantly. Man's chief concern in
									life should not be the acquiring of gold nor fame nor material
									possessions. It should not be the development of physical
									prowess nor of intellectual strength, but his aim, the highest
									in life, should be the development of a Christlike character."
								</p>
							</blockquote>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
