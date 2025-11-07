/**
 * Utility functions for UI state management
 */

/**
 * Determine if a message represents an error state
 */
export function isErrorMessage(message: string): boolean {
	if (!message) return false;

	const errorKeywords = [
		"failed",
		"error",
		"unable",
		"cannot",
		"could not",
		"unsuccessful",
	];

	const lowerMessage = message.toLowerCase();
	return errorKeywords.some((keyword) => lowerMessage.includes(keyword));
}

/**
 * Get CSS class for a message based on whether it's an error
 */
export function getMessageClassName(
	message: string,
	baseClass = "text-sm text-center",
	errorClass = "text-red-600",
	successClass = "text-green-600",
): string {
	if (!message) return baseClass;
	return `${baseClass} ${isErrorMessage(message) ? errorClass : successClass}`;
}
