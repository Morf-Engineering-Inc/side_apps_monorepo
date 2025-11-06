import { APP_CONFIG } from "@/main";

/**
 * Hook to access global app configuration
 * For standalone mode (outside CREAO.ai)
 */
export function useAppConfig() {
	return {
		mode: APP_CONFIG.mode,
		baseUrl: APP_CONFIG.baseUrl,

		// Legacy properties for backward compatibility (null in standalone mode)
		userId: null,
		projectId: null,
		taskId: null,
		workspaceId: null,
		uploadFolder: null,
		isValidBuildUrl: false,

		// Check if we're in standalone mode
		isStandalone: () => APP_CONFIG.mode === "standalone",
		isInBuildEnvironment: () => false, // Always false in standalone
	};
}

// You can also access directly via window.APP_CONFIG if needed
export { APP_CONFIG } from "@/main";
