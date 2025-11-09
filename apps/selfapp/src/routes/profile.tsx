import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { decodeJWT } from "@/lib/jwt-utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Crown, Key, Lock, Mail, Shield, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

interface TokenInfo {
	sub?: string;
	email?: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	preferred_username?: string;
	email_verified?: boolean;
	[key: string]: unknown;
}

function ProfilePage() {
	const { user, logout, changePassword } = useAuth();
	const { subscription, isPremium, isAdmin } = useSubscription();
	const navigate = useNavigate();
	const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);

	useEffect(() => {
		// Try to get token info from localStorage
		const token = localStorage.getItem("SELFAPP_AUTH_TOKEN");
		if (
			token &&
			token !== "local-fallback-token" &&
			token !== "local-dev-token"
		) {
			try {
				const payload = decodeJWT(token);
				if (payload) {
					setTokenInfo(payload);
				}
			} catch (e) {
				console.error("Failed to parse token:", e);
			}
		}
	}, []);

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError("");
		setPasswordSuccess("");

		if (newPassword.length < 8) {
			setPasswordError("Password must be at least 8 characters");
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		setPasswordLoading(true);

		const result = await changePassword(oldPassword, newPassword);
		if (result.success) {
			setPasswordSuccess("Password changed successfully!");
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => {
				setShowChangePassword(false);
				setPasswordSuccess("");
			}, 2000);
		} else {
			setPasswordError(result.error || "Failed to change password");
		}
		setPasswordLoading(false);
	};

	const getSubscriptionLabel = () => {
		switch (subscription.tier) {
			case 'admin':
				return 'Admin (Lifetime Access)';
			case 'lifetime':
				return 'Lifetime Premium';
			case 'yearly':
				return 'Premium Yearly';
			case 'monthly':
				return 'Premium Monthly';
			case 'free':
			default:
				return 'Free';
		}
	};

	return (
		<div className="space-y-6 max-w-4xl mx-auto">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold app-text-strong">Profile</h1>
					<p className="app-text-muted">
						View your account information and settings
					</p>
				</div>
				<Button variant="destructive" onClick={logout}>
					Logout
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>User Information</CardTitle>
					<CardDescription>
						Your account details from authentication
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid md:grid-cols-2 gap-4">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-app-surface-alt rounded-lg">
								<UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-sm font-medium app-text-subtle">Name</p>
								<p className="text-lg font-semibold app-text-strong">
									{user?.name ||
										tokenInfo?.name ||
										tokenInfo?.given_name ||
										"Not available"}
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="p-2 bg-app-surface-alt rounded-lg">
								<Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-sm font-medium app-text-subtle">Email</p>
								<p className="text-lg font-semibold app-text-strong">
									{user?.email || tokenInfo?.email || "Not available"}
								</p>
								{tokenInfo?.email_verified !== undefined && (
									<p className="text-xs app-text-muted">
										{tokenInfo.email_verified ? "✓ Verified" : "✗ Not verified"}
									</p>
								)}
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
								<Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<p className="text-sm font-medium app-text-subtle">User ID</p>
								<p className="text-sm font-mono app-text-subtle break-all">
									{user?.id || tokenInfo?.sub || "Not available"}
								</p>
							</div>
						</div>

						{tokenInfo?.preferred_username && (
							<div className="flex items-start gap-3">
								<div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
									<UserIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
								</div>
								<div>
									<p className="text-sm font-medium app-text-subtle">
										Username
									</p>
									<p className="text-lg font-semibold app-text-strong">
										{tokenInfo.preferred_username}
									</p>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Subscription Status Card */}
			<Card className={isPremium || isAdmin ? "border-primary" : ""}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Crown className={`h-5 w-5 ${isPremium || isAdmin ? 'text-primary' : 'text-muted-foreground'}`} />
						Subscription Status
					</CardTitle>
					<CardDescription>
						Your current plan and benefits
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start gap-3">
						<div className={`p-2 rounded-lg ${isPremium || isAdmin ? 'bg-primary/10' : 'bg-app-surface-alt'}`}>
							<Crown className={`h-5 w-5 ${isPremium || isAdmin ? 'text-primary' : 'text-muted-foreground'}`} />
						</div>
						<div className="flex-1">
							<p className="text-sm font-medium app-text-subtle">Current Plan</p>
							<p className="text-lg font-semibold app-text-strong">
								{getSubscriptionLabel()}
							</p>
							{subscription.currentPeriodEnd && subscription.currentPeriodEnd !== 'lifetime' && (
								<p className="text-xs app-text-muted mt-1">
									{subscription.status === 'active' ? 'Renews' : 'Expires'} on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
								</p>
							)}
							{(isAdmin || subscription.tier === 'lifetime') && (
								<p className="text-xs app-text-muted mt-1">
									✨ Lifetime access - never expires!
								</p>
							)}
						</div>
					</div>
					<div className="pt-4 border-t app-border-default">
						<Button 
							onClick={() => navigate({ to: '/pricing' })}
							variant={isPremium || isAdmin ? 'outline' : 'default'}
							className="w-full"
						>
							{isPremium || isAdmin ? 'Manage Subscription' : 'Upgrade to Premium'}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Lock className="h-5 w-5" />
						Change Password
					</CardTitle>
					<CardDescription>Update your account password</CardDescription>
				</CardHeader>
				<CardContent>
					{!showChangePassword ? (
						<Button
							onClick={() => setShowChangePassword(true)}
							className="w-full md:w-auto"
						>
							Change Password
						</Button>
					) : (
						<form onSubmit={handleChangePassword} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="old-password">Current Password</Label>
								<Input
									id="old-password"
									type="password"
									placeholder="••••••••"
									value={oldPassword}
									onChange={(e) => setOldPassword(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-password">New Password</Label>
								<Input
									id="new-password"
									type="password"
									placeholder="••••••••"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
								<p className="text-xs app-text-muted">
									At least 8 characters (additional complexity requirements may
									apply)
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirm-new-password">
									Confirm New Password
								</Label>
								<Input
									id="confirm-new-password"
									type="password"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
							</div>
							{passwordError && (
								<p className="text-sm text-red-600 dark:text-red-400">
									{passwordError}
								</p>
							)}
							{passwordSuccess && (
								<p className="text-sm text-green-600 dark:text-green-400">
									{passwordSuccess}
								</p>
							)}
							<div className="flex gap-2">
								<Button type="submit" disabled={passwordLoading}>
									{passwordLoading ? "Changing..." : "Update Password"}
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowChangePassword(false);
										setOldPassword("");
										setNewPassword("");
										setConfirmPassword("");
										setPasswordError("");
										setPasswordSuccess("");
									}}
								>
									Cancel
								</Button>
							</div>
						</form>
					)}
				</CardContent>
			</Card>

			<div className="flex justify-center pt-6 pb-4 border-t app-border-default mt-8">
				<button
					onClick={() => navigate({ to: "/privacy" })}
					className="text-sm app-text-muted hover:app-text-strong transition-colors flex items-center gap-2"
				>
					<Shield className="h-4 w-4" />
					Privacy Policy
				</button>
			</div>
		</div>
	);
}
