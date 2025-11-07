import {
	authenticateWithPassword,
	changePassword,
	confirmForgotPassword,
	confirmSignUp,
	forgotPassword,
	getAuthTokenAsync,
	handleCognitoCallback,
	initializeAuthIntegration,
	isCognitoConfigured,
	loginWithCognito,
	resendConfirmationCode,
	setAuthTokenAsync,
	signUpWithPassword,
} from "@/lib/auth-integration";
import { decodeJWT } from "@/lib/jwt-utils";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthContextType {
	user: User | null;
	login: (
		email: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>;
	signup: (
		email: string,
		password: string,
		name: string,
	) => Promise<{
		success: boolean;
		error?: string;
		needsVerification?: boolean;
		username?: string;
	}>;
	confirmSignup: (
		username: string,
		code: string,
	) => Promise<{ success: boolean; error?: string }>;
	resendCode: (
		username: string,
	) => Promise<{ success: boolean; error?: string }>;
	forgotPassword: (
		username: string,
	) => Promise<{ success: boolean; error?: string }>;
	confirmForgotPassword: (
		username: string,
		code: string,
		newPassword: string,
	) => Promise<{ success: boolean; error?: string }>;
	changePassword: (
		oldPassword: string,
		newPassword: string,
	) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
	isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(() => {
		const savedUser =
			typeof window !== "undefined" ? localStorage.getItem("user") : null;
		return savedUser ? JSON.parse(savedUser) : null;
	});
	const [cognitoEnabled, setCognitoEnabled] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			await initializeAuthIntegration();
			const cognito = isCognitoConfigured();
			setCognitoEnabled(cognito);

			if (cognito) {
				// If tokens present in URL from hosted UI, parse and persist them
				const success = await handleCognitoCallback();
				console.log("Cognito callback handled:", success);
				const token = await getAuthTokenAsync();
				if (token) {
					try {
						const payload = decodeJWT(token);
						console.log("Decoded JWT payload:", payload);
						if (payload) {
							const newUser: User = {
								id: payload.sub || payload.username || payload.user_id || "",
								email:
									payload.email ||
									payload.username ||
									payload["cognito:username"] ||
									"",
								name:
									payload.name ||
									payload.given_name ||
									payload.email ||
									payload["cognito:username"] ||
									"",
							};
							setUser(newUser);
							localStorage.setItem("user", JSON.stringify(newUser));
						}
					} catch (e) {
						// ignore parse errors
						console.error("Failed to parse JWT payload", e);
					}
				}
			}
		})();
	}, []);

	const login = async (
		email: string,
		password: string,
	): Promise<{ success: boolean; error?: string }> => {
		// If Cognito is configured, use password authentication API
		if (cognitoEnabled) {
			const result = await authenticateWithPassword(email, password);
			if (result?.error) {
				return { success: false, error: result.error };
			}
			if (result && (result.idToken || result.accessToken)) {
				const token = result.idToken || result.accessToken;
				await setAuthTokenAsync(token as string);

				// Decode token and set user
				// Security Note: User profile data (id, email, name) is stored in localStorage
				// for session persistence. The actual JWT tokens are stored separately.
				// For higher security requirements, consider using httpOnly cookies with a backend.
				try {
					const payload = decodeJWT(token as string);
					if (payload) {
						const newUser: User = {
							id: payload.sub || payload.username || payload.user_id || "",
							email:
								payload.email ||
								payload.username ||
								payload["cognito:username"] ||
								"",
							name:
								payload.name ||
								payload.given_name ||
								payload.email ||
								payload["cognito:username"] ||
								"",
						};
						setUser(newUser);
						localStorage.setItem("user", JSON.stringify(newUser));
					}
				} catch (e) {
					console.error("Failed to parse JWT payload", e);
				}

				return { success: true };
			}
			// Return false on error - the error message is handled in the login component
			return { success: false, error: "Login failed. Please try again" };
		}

		// Local fallback (existing behavior)
		const users = JSON.parse(localStorage.getItem("users") || "[]");
		const foundUser = users.find(
			(u: User & { password: string }) =>
				u.email === email && u.password === password,
		);

		if (foundUser) {
			// remove password before storing
			// @ts-ignore
			const { password: _, ...userWithoutPassword } = foundUser;
			setUser(userWithoutPassword);
			localStorage.setItem("user", JSON.stringify(userWithoutPassword));
			await setAuthTokenAsync("local-fallback-token");
			return { success: true };
		}
		return { success: false, error: "Invalid email or password" };
	};

	const signup = async (
		email: string,
		password: string,
		name: string,
	): Promise<{
		success: boolean;
		error?: string;
		needsVerification?: boolean;
		username?: string;
	}> => {
		if (cognitoEnabled) {
			// Use Cognito signup API
			const result = await signUpWithPassword(email, password, name);
			if (!result.success) {
				return { success: false, error: result.error };
			}

			// If verification is needed, return early without auto-login
			if (result.needsVerification) {
				return {
					success: true,
					needsVerification: true,
					username: result.username,
				};
			}

			// If auto-confirmed, attempt login
			const loginResult = await login(email, password);
			if (!loginResult.success) {
				// Signup succeeded but login failed
				console.log(
					"Signup successful but login failed - email confirmation may be required",
				);
				return {
					success: true,
					needsVerification: true,
					username: email,
				};
			}
			return { success: true };
		}

		const users = JSON.parse(localStorage.getItem("users") || "[]");
		if (users.find((u: User) => u.email === email)) {
			return {
				success: false,
				error: "An account with this email already exists",
			};
		}

		const newUser = {
			id: crypto.randomUUID(),
			email,
			password,
			name,
		};
		users.push(newUser);
		localStorage.setItem("users", JSON.stringify(users));
		// @ts-ignore
		const { password: _, ...userWithoutPassword } = newUser;
		setUser(userWithoutPassword);
		localStorage.setItem("user", JSON.stringify(userWithoutPassword));
		await setAuthTokenAsync("local-fallback-token");
		return { success: true };
	};

	const confirmSignup = async (
		username: string,
		code: string,
	): Promise<{ success: boolean; error?: string }> => {
		return await confirmSignUp(username, code);
	};

	const resendCode = async (
		username: string,
	): Promise<{ success: boolean; error?: string }> => {
		return await resendConfirmationCode(username);
	};

	const handleForgotPassword = async (
		username: string,
	): Promise<{ success: boolean; error?: string }> => {
		if (cognitoEnabled) {
			return await forgotPassword(username);
		}
		// For local mode, simulate success
		return { success: true };
	};

	const handleConfirmForgotPassword = async (
		username: string,
		code: string,
		newPassword: string,
	): Promise<{ success: boolean; error?: string }> => {
		if (cognitoEnabled) {
			return await confirmForgotPassword(username, code, newPassword);
		}
		// For local mode, update the password in localStorage
		const users = JSON.parse(localStorage.getItem("users") || "[]");
		const userIndex = users.findIndex(
			(u: User & { password: string }) => u.email === username,
		);
		if (userIndex !== -1) {
			users[userIndex].password = newPassword;
			localStorage.setItem("users", JSON.stringify(users));
			return { success: true };
		}
		return { success: false, error: "User not found" };
	};

	const handleChangePassword = async (
		oldPassword: string,
		newPassword: string,
	): Promise<{ success: boolean; error?: string }> => {
		if (cognitoEnabled) {
			return await changePassword(oldPassword, newPassword);
		}
		// For local mode, verify old password and update
		if (!user) {
			return { success: false, error: "Not authenticated" };
		}
		const users = JSON.parse(localStorage.getItem("users") || "[]");
		const userIndex = users.findIndex(
			(u: User & { password: string }) => u.email === user.email,
		);
		if (userIndex !== -1) {
			if (users[userIndex].password !== oldPassword) {
				return { success: false, error: "Current password is incorrect" };
			}
			users[userIndex].password = newPassword;
			localStorage.setItem("users", JSON.stringify(users));
			return { success: true };
		}
		return { success: false, error: "User not found" };
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
		setAuthTokenAsync(null);
		// If Cognito configured, redirect to Cognito logout endpoint if configured
		try {
			const cfg =
				(window as any).__SELFAPP_COGNITO__ || (window as any).AWS_CONFIG || {};
			const domain = cfg.cognitoDomain || cfg.cognito_domain || cfg.domain;
			const clientId =
				cfg.cognitoClientId || cfg.cognito_client_id || cfg.clientId;
			// Use redirectSignOut if available, otherwise default to origin root
			const logoutUri =
				cfg.redirectSignOut || cfg.logout_uri || `${window.location.origin}/`;
			if (domain && clientId && logoutUri) {
				const url = new URL(`https://${domain}/logout`);
				url.searchParams.set("client_id", clientId);
				url.searchParams.set("logout_uri", logoutUri);
				console.log("Redirecting to Cognito logout:", url.toString());
				window.location.href = url.toString();
			}
		} catch (e) {
			console.error("Error during logout redirect:", e);
			// Still clear local state even if redirect fails
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				signup,
				confirmSignup,
				resendCode,
				forgotPassword: handleForgotPassword,
				confirmForgotPassword: handleConfirmForgotPassword,
				changePassword: handleChangePassword,
				logout,
				isAuthenticated: !!user,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
