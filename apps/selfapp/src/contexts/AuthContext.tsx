import { type ReactNode, createContext, useContext, useState } from "react";

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
		const savedUser = localStorage.getItem("user");
		return savedUser ? JSON.parse(savedUser) : null;
	});

	const login = async (email: string, password: string): Promise<boolean> => {
		const users = JSON.parse(localStorage.getItem("users") || "[]");
		const foundUser = users.find(
			(u: User & { password: string }) =>
				u.email === email && u.password === password,
		);

		if (foundUser) {
			const { password: _, ...userWithoutPassword } = foundUser;
			setUser(userWithoutPassword);
			localStorage.setItem("user", JSON.stringify(userWithoutPassword));
			return true;
		}
		return false;
	};

	const signup = async (
		email: string,
		password: string,
		name: string,
	): Promise<boolean> => {
		const users = JSON.parse(localStorage.getItem("users") || "[]");

		if (users.find((u: User) => u.email === email)) {
			return false;
		}

		const newUser = {
			id: crypto.randomUUID(),
			email,
			password,
			name,
		};

		users.push(newUser);
		localStorage.setItem("users", JSON.stringify(users));

		const { password: _, ...userWithoutPassword } = newUser;
		setUser(userWithoutPassword);
		localStorage.setItem("user", JSON.stringify(userWithoutPassword));
		return true;
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
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
