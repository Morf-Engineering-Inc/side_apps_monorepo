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
import { createStripeCheckoutSession } from "@/lib/api-client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Crown, Lock, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";

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

// NOTE: Replace these with your actual Stripe Price IDs from your Stripe Dashboard
// These should be in the format: price_1xxxxxxxxxxxxxxxxxxxxxxxxx
// Priority: 1. Runtime config from AWS, 2. Environment variables, 3. Fallback values
const getStripePriceId = (tier: "monthly" | "yearly" | "lifetime"): string => {
	const config = (window as any).AWS_CONFIG;

	switch (tier) {
		case "monthly":
			return (
				config?.stripePriceMonthly ||
				import.meta.env.VITE_STRIPE_PRICE_MONTHLY ||
				"price_monthly"
			);
		case "yearly":
			return (
				config?.stripePriceYearly ||
				import.meta.env.VITE_STRIPE_PRICE_YEARLY ||
				"price_yearly"
			);
		case "lifetime":
			return (
				config?.stripePriceLifetime ||
				import.meta.env.VITE_STRIPE_PRICE_LIFETIME ||
				"price_lifetime"
			);
		default:
			return "";
	}
};

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
		stripePriceId: getStripePriceId("monthly"),
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
		stripePriceId: getStripePriceId("yearly"),
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
		stripePriceId: getStripePriceId("lifetime"),
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
	const { subscription, isPremium, refreshSubscription } = useSubscription();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSelectPlan = async (tier: PricingTier) => {
		if (tier.id === "free") {
			// Navigate to dashboard for free tier
			navigate({ to: "/" });
			return;
		}

		// For paid plans, redirect to Stripe Checkout
		try {
			setLoading(true);
			setError(null);

			const response = await createStripeCheckoutSession({
				priceId: tier.stripePriceId!,
				planType: tier.id,
				successUrl: `${window.location.origin}/?payment=success`,
				cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
			});

			if (response.success && response.url) {
				// Redirect to Stripe Checkout
				window.location.href = response.url;
			} else {
				setError(
					response.error ||
						response.message ||
						"Failed to create checkout session",
				);
			}
		} catch (err) {
			console.error("Error creating checkout session:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to create checkout session",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		navigate({ to: "/" });
	};

	return (
		<div className="container mx-auto px-4 py-12 max-w-7xl relative">
			{/* Close button for mobile */}
			<button
				onClick={handleClose}
				className="fixed top-4 right-4 z-50 md:hidden p-2 bg-background border border-border rounded-full shadow-lg hover:bg-accent transition-colors"
				aria-label="Close pricing"
			>
				<X className="h-5 w-5" />
			</button>

			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
				<p className="text-xl text-muted-foreground">
					Start your transformation journey today
				</p>
			</div>

			{error && (
				<Card className="mb-8 border-destructive bg-destructive/5">
					<CardContent className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
							<div>
								<h3 className="font-semibold text-destructive">Error</h3>
								<p className="text-sm text-muted-foreground">{error}</p>
							</div>
						</div>
						<Button variant="outline" onClick={() => setError(null)}>
							Dismiss
						</Button>
					</CardContent>
				</Card>
			)}

			<Card
				className={`mb-8 ${isPremium ? "border-primary bg-primary/5" : "border-muted bg-muted/5"}`}
			>
				<CardContent className="flex items-center justify-between p-6">
					<div className="flex items-center gap-4">
						{isPremium ? (
							<Crown className="h-8 w-8 text-primary" />
						) : (
							<Sparkles className="h-8 w-8 text-green-500" />
						)}
						<div>
							<h3 className="font-semibold">
								Current Plan: {subscription.tier}
							</h3>
							<p className="text-sm text-muted-foreground">
								{isPremium
									? "Thank you for being a premium member!"
									: "Welcome! You're on the free plan. Upgrade to unlock all features."}
							</p>
						</div>
					</div>
					<Button variant="outline" onClick={() => navigate({ to: "/" })}>
						Go to Dashboard
					</Button>
				</CardContent>
			</Card>

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
										tier.id === "free" ? "bg-green-500/10" : "bg-primary/10"
									}`}
								>
									{tier.icon}
								</div>
								<CardTitle className="text-xl">{tier.name}</CardTitle>
							</div>
							<div className="mb-2">
								<span className="text-4xl font-bold">{tier.price}</span>
								<span className="text-muted-foreground ml-2">
									{tier.period}
								</span>
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
								disabled={subscription.tier === tier.id || loading}
							>
								{loading
									? "Loading..."
									: subscription.tier === tier.id
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
						All payments are processed securely through Stripe. We never store
						your payment information.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Cancel anytime for monthly and yearly plans. 30-day money-back
						guarantee for all paid plans.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
