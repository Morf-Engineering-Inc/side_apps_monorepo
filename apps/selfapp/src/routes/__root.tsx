import { MainLayout } from "@/components/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
	Outlet,
	createRootRoute,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

export const Route = createRootRoute({
	component: Root,
});

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/welcome", "/login", "/callback"];

function Root() {
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

		if (!isAuthenticated && !isPublicRoute) {
			navigate({ to: "/welcome" });
		}
	}, [isAuthenticated, navigate, location.pathname]);

	// For public routes, render without MainLayout
	if (PUBLIC_ROUTES.includes(location.pathname)) {
		return (
			<>
				<Outlet />
				<TanStackRouterDevtools position="bottom-right" />
			</>
		);
	}

	// For protected routes, render with MainLayout
	return (
		<>
			<MainLayout />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	);
}
