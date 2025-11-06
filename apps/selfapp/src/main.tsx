import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import reportWebVitals from "./reportWebVitals.ts";
import "./styles.css";

import { AuthProvider } from "@/contexts/AuthContext";
// Import and initialize auth integration (standalone mode)
import { initializeAuthIntegration } from "@/lib/auth-integration";

// Simplified app config for standalone mode
interface GlobalAppConfig {
	mode: "standalone";
	baseUrl: string;
}

// Set up configuration for standalone mode
const appConfig: GlobalAppConfig = {
	mode: "standalone",
	baseUrl: window.location.origin,
};

// Add to window global object for easy access
declare global {
	interface Window {
		APP_CONFIG: GlobalAppConfig;
	}
}

window.APP_CONFIG = appConfig;

// Also export for module imports
export const APP_CONFIG = appConfig;

// Log the configuration
console.log("Self - Running in standalone mode");
console.log("App Configuration:", appConfig);

// Initialize auth integration
initializeAuthIntegration();

// Create a QueryClient instance
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: {},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
	basepath: import.meta.env.TENANT_ID ? `/${import.meta.env.TENANT_ID}` : "/",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<RouterProvider router={router} />
				</AuthProvider>
			</QueryClientProvider>
		</StrictMode>,
	);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
