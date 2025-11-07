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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { isCognitoConfigured } from "@/lib/auth-integration";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { login, signup, confirmSignup, resendCode, isAuthenticated } =
		useAuth();
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [signupName, setSignupName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [cognitoConfigured, setCognitoConfigured] = useState(false);
	const [needsVerification, setNeedsVerification] = useState(false);
	const [verificationUsername, setVerificationUsername] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [verificationLoading, setVerificationLoading] = useState(false);
	const [verificationError, setVerificationError] = useState("");
	const [resendSuccess, setResendSuccess] = useState(false);

	useEffect(() => {
		setCognitoConfigured(isCognitoConfigured());
	}, []);

	if (isAuthenticated) {
		navigate({ to: "/" });
		return null;
	}

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const result = await login(loginEmail, loginPassword);
		if (result.success) {
			navigate({ to: "/" });
		} else {
			setError(result.error || "Invalid email or password");
		}
		setLoading(false);
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (signupPassword.length < 8) {
			setError("Password must be at least 8 characters");
			setLoading(false);
			return;
		}

		const result = await signup(signupEmail, signupPassword, signupName);
		if (result.success) {
			if (result.needsVerification) {
				// Show verification UI
				setNeedsVerification(true);
				setVerificationUsername(result.username || signupEmail);
				setError("");
			} else {
				// Auto-logged in, redirect
				navigate({ to: "/" });
			}
		} else {
			setError(result.error || "Email already exists or signup failed");
		}
		setLoading(false);
	};

	const handleVerification = async (e: React.FormEvent) => {
		e.preventDefault();
		setVerificationError("");
		setVerificationLoading(true);
		setResendSuccess(false);

		const result = await confirmSignup(verificationUsername, verificationCode);
		if (result.success) {
			// Verification successful - redirect to login tab
			setVerificationError("Email verified successfully! You can now sign in.");
			setTimeout(() => {
				setNeedsVerification(false);
				setVerificationCode("");
				setVerificationError("");
				// Pre-fill login email for convenience
				setLoginEmail(verificationUsername);
			}, 2000);
		} else {
			setVerificationError(result.error || "Verification failed");
		}
		setVerificationLoading(false);
	};

	const handleResendCode = async () => {
		setVerificationError("");
		setResendSuccess(false);
		setVerificationLoading(true);

		const result = await resendCode(verificationUsername);
		if (result.success) {
			setResendSuccess(true);
			setTimeout(() => setResendSuccess(false), 5000);
		} else {
			setVerificationError(result.error || "Failed to resend code");
		}
		setVerificationLoading(false);
	};

	// Show verification UI if needed
	if (needsVerification) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
							Verify Your Email
						</h1>
						<p className="text-zinc-700 dark:text-zinc-300">
							We've sent a verification code to {verificationUsername}
						</p>
					</div>
					<Card>
						<CardHeader>
							<CardTitle>Enter Verification Code</CardTitle>
							<CardDescription>
								Check your email for the 6-digit code
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleVerification} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="verification-code">Verification Code</Label>
									<Input
										id="verification-code"
										type="text"
										placeholder="123456"
										value={verificationCode}
										onChange={(e) => setVerificationCode(e.target.value)}
										maxLength={6}
										required
									/>
								</div>
								{verificationError && (
									<p
										className={`text-sm ${verificationError.includes("successfully") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
									>
										{verificationError}
									</p>
								)}
								{resendSuccess && (
									<p className="text-sm text-green-600 dark:text-green-400">
										Code resent successfully!
									</p>
								)}
								<Button
									type="submit"
									className="w-full"
									disabled={verificationLoading}
								>
									{verificationLoading ? "Verifying..." : "Verify Email"}
								</Button>
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={handleResendCode}
									disabled={verificationLoading}
								>
									Resend Code
								</Button>
								<Button
									type="button"
									variant="ghost"
									className="w-full"
									onClick={() => {
										setNeedsVerification(false);
										setVerificationCode("");
										setVerificationError("");
									}}
								>
									Back to Sign Up
								</Button>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
						Performance Tracker
					</h1>
					<p className="text-zinc-700 dark:text-zinc-300">
						Track your progress, achieve your goals
					</p>
				</div>{" "}
				<Tabs defaultValue="login">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="login">
							<LogIn className="mr-2 h-4 w-4" />
							Login
						</TabsTrigger>
						<TabsTrigger value="signup">
							<UserPlus className="mr-2 h-4 w-4" />
							Sign Up
						</TabsTrigger>
					</TabsList>

					<TabsContent value="login">
						<Card>
							<CardHeader>
								<CardTitle>Welcome Back</CardTitle>
								<CardDescription>
									Enter your credentials to access your account
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleLogin} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="login-email">Email</Label>
										<Input
											id="login-email"
											type="email"
											placeholder="you@example.com"
											value={loginEmail}
											onChange={(e) => setLoginEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="login-password">Password</Label>
										<Input
											id="login-password"
											type="password"
											placeholder="••••••••"
											value={loginPassword}
											onChange={(e) => setLoginPassword(e.target.value)}
											required
										/>
									</div>
									{error && (
										<p className="text-sm text-red-600 dark:text-red-400">
											{error}
										</p>
									)}
									<Button type="submit" className="w-full" disabled={loading}>
										{loading ? "Logging in..." : "Login"}
									</Button>
									<button
										type="button"
										onClick={() => navigate({ to: "/forgot-password" })}
										className="w-full text-sm app-text-muted hover:underline mt-2"
									>
										Forgot Password?
									</button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="signup">
						<Card>
							<CardHeader>
								<CardTitle>Create Account</CardTitle>
								<CardDescription>
									Sign up to start tracking your performance
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSignup} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="signup-name">Name</Label>
										<Input
											id="signup-name"
											type="text"
											placeholder="John Doe"
											value={signupName}
											onChange={(e) => setSignupName(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="signup-email">Email</Label>
										<Input
											id="signup-email"
											type="email"
											placeholder="you@example.com"
											value={signupEmail}
											onChange={(e) => setSignupEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="signup-password">Password</Label>
										<Input
											id="signup-password"
											type="password"
											placeholder="••••••••"
											value={signupPassword}
											onChange={(e) => setSignupPassword(e.target.value)}
											required
										/>
										<p className="text-xs app-text-muted">
											Must be at least 8 characters with uppercase, lowercase,
											numbers, and symbols
										</p>
									</div>
									{error && (
										<p className="text-sm text-red-600 dark:text-red-400">
											{error}
										</p>
									)}
									<Button type="submit" className="w-full" disabled={loading}>
										{loading ? "Creating account..." : "Sign Up"}
									</Button>
								</form>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
