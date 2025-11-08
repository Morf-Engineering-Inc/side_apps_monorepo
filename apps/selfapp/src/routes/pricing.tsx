import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Crown, Lock, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/pricing")({
	component: PricingPage,
});

interface PricingTier {
	id: string;
	name: string;
	price: string;
	period: string;
	description: string;
	features: string[];
	icon: React.ReactNode;
	highlighted?: boolean;
	badge?: string;
	stripePriceId?: string;
}

const pricingTiers: PricingTier[] = [
	{
		id: "free",
		name: "Free",
		price: "$0",
		period: "Forever free",
		description: "Perfect for getting started with personal tracking",
		icon: <Sparkles className="h-6 w-6" />,
		features: [
			"Daily Log access",
			"Basic insights",
			"Reflection tracking",
			"Community support",
		],
	},
	{
		id: "monthly",
		name: "Premium Monthly",
		price: "$4.99",
		period: "per month",
		description: "Full access to all features",
		icon: <Zap className="h-6 w-6" />,
		stripePriceId: "price_monthly",
		features: [
			"Everything in Free",
			"Full dashboard access",
			"Advanced analytics",
			"All tracking modules",
			"Progress reports",
			"Priority support",
		],
	},
	{
		id: "yearly",
		name: "Premium Yearly",
		price: "$44",
		period: "per year",
		description: "Best value - Save over $15/year",
		icon: <Crown className="h-6 w-6" />,
		highlighted: true,
		badge: "BEST VALUE",
		stripePriceId: "price_yearly",
		features: [
			"Everything in Monthly",
			"Save 26% annually",
			"Premium insights",
			"Custom goals",
			"Data export",
			"VIP support",
		],
	},
	{
		id: "lifetime",
		name: "Lifetime Access",
		price: "$175",
		period: "one-time payment",
		description: "Lifetime access to all features",
		icon: <Crown className="h-6 w-6" />,
		stripePriceId: "price_lifetime",
		features: [
			"Everything in Yearly",
			"Lifetime access",
			"All future features",
			"Early access to updates",
			"Lifetime VIP support",
			"Best value ever!",
		],
	},
];

function PricingPage() {
	const { subscription, isPremium } = useSubscription();
	const navigate = useNavigate();

	const handleSelectPlan = async (tier: PricingTier) => {
		if (tier.id === "free") {
			// Navigate to dashboard for free tier
			navigate({ to: "/" });
			return;
		}

		// For paid plans, redirect to Stripe Checkout
		try {
			// TODO: Replace with actual Stripe checkout integration
			// const response = await fetch('/api/stripe/create-checkout', {
			//   method: 'POST',
			//   headers: {
			//     'Content-Type': 'application/json',
			//     'Authorization': `Bearer ${token}`,
			//   },
			//   body: JSON.stringify({
			//     priceId: tier.stripePriceId,
			//     planType: tier.id,
			//     successUrl: `${window.location.origin}/?payment=success`,
			//     cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
			//   }),
			// });
			// const { sessionId } = await response.json();
			// await stripe.redirectToCheckout({ sessionId });

			// For now, just simulate the upgrade
			localStorage.setItem("subscriptionTier", tier.id);
			navigate({ to: "/?payment=success" });
		} catch (error) {
			console.error("Error creating checkout session:", error);
		}
	};

	return (
		<div className="container mx-auto px-4 py-12 max-w-7xl">
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
				<p className="text-xl text-muted-foreground">
					Start your transformation journey today
				</p>
			</div>

			{isPremium && (
				<Card className="mb-8 border-primary bg-primary/5">
					<CardContent className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
							<Crown className="h-8 w-8 text-primary" />
							<div>
								<h3 className="font-semibold">Current Plan: {subscription.tier}</h3>
								<p className="text-sm text-muted-foreground">
									Thank you for being a premium member!
								</p>
							</div>
						</div>
						<Button variant="outline" onClick={() => navigate({ to: "/" })}>
							Go to Dashboard
						</Button>
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{pricingTiers.map((tier) => (
					<Card
						key={tier.id}
						className={`relative flex flex-col ${
							tier.highlighted
								? "border-primary shadow-lg shadow-primary/20 scale-105"
								: ""
						}`}
					>
						{tier.badge && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2">
								<span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
									{tier.badge}
								</span>
							</div>
						)}

						<CardHeader>
							<div className="flex items-center gap-2 mb-2">
								<div
									className={`p-2 rounded-lg ${
										tier.id === "free"
											? "bg-green-500/10"
											: "bg-primary/10"
									}`}
								>
									{tier.icon}
								</div>
								<CardTitle className="text-xl">{tier.name}</CardTitle>
							</div>
							<div className="mb-2">
								<span className="text-4xl font-bold">{tier.price}</span>
								<span className="text-muted-foreground ml-2">{tier.period}</span>
							</div>
							<CardDescription>{tier.description}</CardDescription>
						</CardHeader>

						<CardContent className="flex-grow">
							<ul className="space-y-3">
								{tier.features.map((feature, index) => (
									<li key={index} className="flex items-start gap-2">
										<Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
										<span className="text-sm">{feature}</span>
									</li>
								))}
							</ul>
						</CardContent>

						<CardFooter>
							<Button
								className="w-full"
								variant={tier.highlighted ? "default" : "outline"}
								onClick={() => handleSelectPlan(tier)}
								disabled={subscription.tier === tier.id}
							>
								{subscription.tier === tier.id
									? "Current Plan"
									: tier.id === "free"
									? "Get Started Free"
									: `Get ${tier.name}`}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>

			<Card className="mt-12 border-muted">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Secure Payment with Stripe
					</CardTitle>
					<CardDescription>
						All payments are processed securely through Stripe. We never store your
						payment information.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Cancel anytime for monthly and yearly plans. 30-day money-back guarantee
						for all paid plans.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
