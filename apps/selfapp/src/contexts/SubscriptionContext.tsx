import { getSubscriptionStatus } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-integration";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

export type SubscriptionTier =
	| "free"
	| "monthly"
	| "yearly"
	| "lifetime"
	| "admin";

export interface SubscriptionStatus {
	tier: SubscriptionTier;
	status: "active" | "cancelled" | "expired";
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	currentPeriodEnd?: string;
}

interface SubscriptionContextType {
	subscription: SubscriptionStatus;
	loading: boolean;
	refreshSubscription: () => Promise<void>;
	isPremium: boolean;
	isAdmin: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
	undefined,
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
	const [subscription, setSubscription] = useState<SubscriptionStatus>({
		tier: "free",
		status: "active",
	});
	const [loading, setLoading] = useState(true);

	const refreshSubscription = async () => {
		try {
			setLoading(true);

			// Check if user is authenticated
			const token = getAuthToken();
			if (
				!token ||
				token === "local-fallback-token" ||
				token === "local-dev-token"
			) {
				// For local dev, check localStorage
				const storedTier = localStorage.getItem(
					"subscriptionTier",
				) as SubscriptionTier | null;
				if (storedTier) {
					setSubscription({
						tier: storedTier,
						status: "active",
					});
				}
				return;
			}

			// Fetch subscription from API
			const response = await getSubscriptionStatus();

			if (response.success) {
				setSubscription({
					tier: response.subscriptionType as SubscriptionTier,
					status: response.status as "active" | "cancelled" | "expired",
					stripeCustomerId: response.stripeCustomerId,
					stripeSubscriptionId: response.stripeSubscriptionId,
					currentPeriodEnd: response.currentPeriodEnd,
				});
			}
		} catch (error) {
			console.error("Error fetching subscription:", error);
			// Fall back to localStorage or default to free
			const storedTier = localStorage.getItem(
				"subscriptionTier",
			) as SubscriptionTier | null;
			setSubscription({
				tier: storedTier || "free",
				status: "active",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		refreshSubscription();
	}, []);

	const isPremium = ["monthly", "yearly", "lifetime", "admin"].includes(
		subscription.tier,
	);
	const isAdmin = subscription.tier === "admin";

	return (
		<SubscriptionContext.Provider
			value={{
				subscription,
				loading,
				refreshSubscription,
				isPremium,
				isAdmin,
			}}
		>
			{children}
		</SubscriptionContext.Provider>
	);
}

export function useSubscription() {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error(
			"useSubscription must be used within a SubscriptionProvider",
		);
	}
	return context;
}
