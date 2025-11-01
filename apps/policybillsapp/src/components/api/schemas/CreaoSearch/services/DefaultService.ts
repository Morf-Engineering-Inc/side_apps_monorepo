/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Search News and Information
     * Performs a search query and returns results in the specified language.
     * @param q Search query (e.g., "weather", "AI agent news")
     * @param xCreaoApiName API name identifier
     * @param xCreaoApiPath API path identifier
     * @param xCreaoApiId API ID identifier
     * @param setLang Language setting for search results
     * @returns any Successful search response
     * @throws ApiError
     */
    public search(
        q: string,
        xCreaoApiName: string = 'CreaoSearch',
        xCreaoApiPath: string = '/search/ZwEDEMkvaTthUZhz/smart',
        xCreaoApiId: string = '689979fee926f36a53ec0042',
        setLang: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' = 'en',
    ): CancelablePromise<{
        queryContext: {
            /**
             * The original search query
             */
            originalQuery: string;
        };
        webPages: {
            /**
             * Array of web page search results
             */
            value: Array<{
                /**
                 * Title of the web page
                 */
                name: string;
                /**
                 * URL of the web page
                 */
                url: string;
                /**
                 * Display-friendly version of the URL
                 */
                displayUrl?: string;
                /**
                 * Brief excerpt or summary of the content
                 */
                snippet?: string;
                /**
                 * When the content was last crawled
                 */
                dateLastCrawled?: string;
                /**
                 * Name of the website
                 */
                siteName?: string;
                /**
                 * When the content was published (optional)
                 */
                datePublished?: string;
                /**
                 * URL of thumbnail image (optional)
                 */
                thumbnailUrl?: string;
            }>;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/search/ZwEDEMkvaTthUZhz/smart',
            headers: {
                'X-CREAO-API-NAME': xCreaoApiName,
                'X-CREAO-API-PATH': xCreaoApiPath,
                'X-CREAO-API-ID': xCreaoApiId,
            },
            query: {
                'q': q,
                'setLang': setLang,
            },
            errors: {
                401: `Unauthorized - Invalid or missing API key`,
            },
        });
    }
}
