import {
	authenticateWithPassword,
	getAuthTokenAsync,
	handleCognitoCallback,
	initializeAuthIntegration,
	isCognitoConfigured,
	loginWithCognito,
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
	login: (email: string, password: string) => Promise<boolean>;
	signup: (email: string, password: string, name: string) => Promise<boolean>;
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
									payload.email || payload.username || payload["cognito:username"] || "",
								name:
									payload.name ||
									payload.given_name ||
									payload.email ||
									payload["cognito:username"] ||
									"",
							};
							console.log("Setting authenticated user:", newUser);
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

	const login = async (email: string, password: string): Promise<boolean> => {
		// If Cognito is configured, use password authentication API
		if (cognitoEnabled) {
			const tokens = await authenticateWithPassword(email, password);
			if (tokens && (tokens.idToken || tokens.accessToken)) {
				const token = tokens.idToken || tokens.accessToken;
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

				return true;
			}
			return false;
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
			return true;
		}
		return false;
	};

	const signup = async (
		email: string,
		password: string,
		name: string,
	): Promise<boolean> => {
		if (cognitoEnabled) {
			// Use Cognito signup API
			const success = await signUpWithPassword(email, password, name);
			if (success) {
				// Note: After signup, the user may need to confirm their email
				// If auto-verification is disabled, login will fail until confirmed
				// For better UX, you should check the signup response and show
				// a confirmation screen instead of auto-login
				// For now, we'll attempt login which will work if auto-verification is enabled
				const loginSuccess = await login(email, password);
				if (!loginSuccess) {
					// Signup succeeded but login failed - likely needs email confirmation
					console.log(
						"Signup successful but login failed - email confirmation may be required",
					);
					// In a production app, show a "Please check your email" message
				}
				return loginSuccess;
			}
			return false;
		}

		const users = JSON.parse(localStorage.getItem("users") || "[]");
		if (users.find((u: User) => u.email === email)) return false;

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
		return true;
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
			const redirectUri =
				cfg.redirectUri || window.location.origin + window.location.pathname;
			if (domain && clientId) {
				const url = new URL(`https://${domain}/logout`);
				url.searchParams.set("client_id", clientId);
				url.searchParams.set("logout_uri", redirectUri);
				window.location.href = url.toString();
			}
		} catch (e) {
			// ignore
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				signup,
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
