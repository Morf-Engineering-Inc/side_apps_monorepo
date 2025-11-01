/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type WebPages = {
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

