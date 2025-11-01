/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * After receiving the presigned URL, you need to make a PUT request to that URL with the file content.
 * Example using fetch:
 * ```javascript
 * const response = await fetch(presignedUrl, {
     * method: 'PUT',
     * headers: {
         * 'Content-Type': contentType
         * },
         * body: fileData // The actual file content
         * });
         *
         * if (response.ok) {
             * // File uploaded successfully
             * // You can now access the file at realFileUrl
             * }
             * ```
             */
            export type PresignedUrlUsage = Record<string, any>;
