/**
 * Type definitions for the Item Image Processing Engine
 */

export interface ProcessingOptions {
    /** Whether to generate white background version (default: true) */
    whiteBg?: boolean;
    /** Target thumbnail width in pixels (default: 384) */
    thumbnailWidth?: number;
    /** Whether to keep transparent PNG (default: true) */
    keepTransparent?: boolean;
    /** Max file size before compression in MB (default: 6) */
    maxFileSizeMB?: number;
    /** JPG quality for final output (default: 0.85) */
    jpgQuality?: number;
}

export interface ProcessingResult {
    /** URI of final processed image with white background (JPG) */
    processedUri: string;
    /** URI of thumbnail image */
    thumbUri: string;
    /** URI of transparent PNG from remove.bg (optional) */
    transparentUri?: string;
    /** Image dimensions */
    width: number;
    height: number;
    /** File size in bytes */
    fileSize: number;
    /** Total processing time in milliseconds */
    /** Total processing time in milliseconds */
    processingTimeMs: number;
    /** Confidence score of the segmentation (0-1) */
    confidenceScore?: number;
    /** List of validation issues if any */
    validationIssues?: string[];
    /** Detected image type */
    imageType?: string;
}

export type ProcessingProgress =
    | 'preparing'
    | 'removingBackground'
    | 'finishing'
    | 'saving'
    | 'complete';

export interface ProcessingError extends Error {
    code:
    | 'INVALID_INPUT'
    | 'FILE_NOT_FOUND'
    | 'FILE_TOO_LARGE'
    | 'API_KEY_INVALID'
    | 'API_RATE_LIMIT'
    | 'API_NETWORK_ERROR'
    | 'API_UNKNOWN_FOREGROUND'
    | 'PROCESSING_FAILED'
    | 'CANCELLED'
    | 'UPLOAD_FAILED';
    originalError?: any;
}

export interface RemoveBgResponse {
    /** Local URI of the transparent PNG */
    transparentUri: string;
    /** Image dimensions */
    width: number;
    height: number;
}

export interface ThumbnailResult {
    uri: string;
    width: number;
    height: number;
}
