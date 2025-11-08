import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'monthly' | 'yearly' | 'lifetime' | 'admin';

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
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

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    tier: 'free',
    status: 'active',
  });
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call to get subscription status
      // const response = await fetch('/api/user/subscription', {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const data = await response.json();
      
      // For now, check localStorage for demo purposes
      const storedTier = localStorage.getItem('subscriptionTier') as SubscriptionTier | null;
      if (storedTier) {
        setSubscription({
          tier: storedTier,
          status: 'active',
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Default to free on error
      setSubscription({
        tier: 'free',
        status: 'active',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  const isPremium = ['monthly', 'yearly', 'lifetime', 'admin'].includes(subscription.tier);
  const isAdmin = subscription.tier === 'admin';

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
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
