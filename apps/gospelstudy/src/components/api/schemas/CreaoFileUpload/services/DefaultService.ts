/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Generate presigned URL for S3 upload
     * Creates a presigned URL that allows direct upload to S3 bucket.
     * After getting the presigned URL, you must make a separate PUT request to that URL with the file content to complete the upload.
     * @param requestBody
     * @param xCreaoApiName API name identifier
     * @param xCreaoApiPath API path identifier
     * @param xCreaoApiId API ID identifier
     * @returns any Presigned URL generated successfully
     * @throws ApiError
     */
    public postMainOfficialApiPresignS3Upload(
        requestBody: {
            /**
             * Name of the file to be uploaded
             */
            fileName: string;
            /**
             * MIME type of the file
             */
            contentType: string;
        },
        xCreaoApiName: string = 'CreaoFileUpload',
        xCreaoApiPath: string = '/main/official-api/presign-s3-upload',
        xCreaoApiId: string = '68b68b97ac476c8df7efbeaf',
    ): CancelablePromise<{
        success?: boolean;
        /**
         * URL to upload the file to using a PUT request
         */
        presignedUrl?: string;
        /**
         * The permanent URL where the file will be accessible after upload
         */
        realFileUrl?: string;
        /**
         * The key (path) of the file in S3
         */
        fileKey?: string;
        /**
         * Expiration time of the presigned URL in seconds
         */
        expiresIn?: number;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/main/official-api/presign-s3-upload',
            headers: {
                'X-CREAO-API-NAME': xCreaoApiName,
                'X-CREAO-API-PATH': xCreaoApiPath,
                'X-CREAO-API-ID': xCreaoApiId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Unauthorized`,
                500: `Server error`,
            },
        });
    }
}
