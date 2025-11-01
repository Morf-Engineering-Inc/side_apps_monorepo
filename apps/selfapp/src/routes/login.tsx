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
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { login, signup, isAuthenticated } = useAuth();
	const [loginEmail, setLoginEmail] = useState("");
	const [loginPassword, setLoginPassword] = useState("");
	const [signupEmail, setSignupEmail] = useState("");
	const [signupPassword, setSignupPassword] = useState("");
	const [signupName, setSignupName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (isAuthenticated) {
		navigate({ to: "/" });
		return null;
	}

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		const success = await login(loginEmail, loginPassword);
		if (success) {
			navigate({ to: "/" });
		} else {
			setError("Invalid email or password");
		}
		setLoading(false);
	};

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (signupPassword.length < 6) {
			setError("Password must be at least 6 characters");
			setLoading(false);
			return;
		}

		const success = await signup(signupEmail, signupPassword, signupName);
		if (success) {
			navigate({ to: "/" });
		} else {
			setError("Email already exists");
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
						Performance Tracker
					</h1>
					<p className="text-zinc-600 dark:text-zinc-400">
						Track your progress, achieve your goals
					</p>
				</div>

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
										<p className="text-xs text-zinc-500 dark:text-zinc-500">
											Must be at least 6 characters
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
