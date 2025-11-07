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
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/forgot-password")({
	component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
	const navigate = useNavigate();
	const { forgotPassword, confirmForgotPassword } = useAuth();
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState<"email" | "reset">("email");

	const handleSendCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		const result = await forgotPassword(email);
		if (result.success) {
			setSuccess("Reset code sent to your email. Please check your inbox.");
			setStep("reset");
		} else {
			setError(result.error || "Failed to send reset code");
		}
		setLoading(false);
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);

		const result = await confirmForgotPassword(email, code, newPassword);
		if (result.success) {
			setSuccess("Password reset successfully! Redirecting to login...");
			setTimeout(() => {
				navigate({ to: "/login" });
			}, 2000);
		} else {
			setError(result.error || "Failed to reset password");
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
						<KeyRound className="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
						Reset Password
					</h1>
					<p className="text-zinc-700 dark:text-zinc-300">
						{step === "email"
							? "Enter your email to receive a reset code"
							: "Enter the code and your new password"}
					</p>
				</div>

				{step === "email" ? (
					<Card>
						<CardHeader>
							<CardTitle>Forgot Password</CardTitle>
							<CardDescription>
								We'll send a verification code to your email
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSendCode} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										placeholder="you@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
								{error && (
									<p className="text-sm text-red-600 dark:text-red-400">
										{error}
									</p>
								)}
								{success && (
									<p className="text-sm text-green-600 dark:text-green-400">
										{success}
									</p>
								)}
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? "Sending..." : "Send Reset Code"}
								</Button>
								<Button
									type="button"
									variant="ghost"
									className="w-full"
									onClick={() => navigate({ to: "/login" })}
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Login
								</Button>
							</form>
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Reset Your Password</CardTitle>
							<CardDescription>Enter the code sent to {email}</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleResetPassword} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="code">Verification Code</Label>
									<Input
										id="code"
										type="text"
										placeholder="123456"
										value={code}
										onChange={(e) => setCode(e.target.value)}
										maxLength={6}
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
										At least 8 characters (additional complexity requirements may apply)
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirm-password">Confirm Password</Label>
									<Input
										id="confirm-password"
										type="password"
										placeholder="••••••••"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
								</div>
								{error && (
									<p className="text-sm text-red-600 dark:text-red-400">
										{error}
									</p>
								)}
								{success && (
									<p className="text-sm text-green-600 dark:text-green-400">
										{success}
									</p>
								)}
								<Button type="submit" className="w-full" disabled={loading}>
									{loading ? "Resetting..." : "Reset Password"}
								</Button>
								<Button
									type="button"
									variant="ghost"
									className="w-full"
									onClick={() => {
										setStep("email");
										setCode("");
										setNewPassword("");
										setConfirmPassword("");
										setError("");
										setSuccess("");
									}}
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back
								</Button>
							</form>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
