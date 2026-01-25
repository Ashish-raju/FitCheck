/**
 * Image Processing Module - Main exports
 */

export { ItemImageEngine } from './itemImageEngine';
export { RemoveBgClient } from './removeBgClient';
export { WhiteBackgroundCompositor } from './compositor';
export { ThumbnailGenerator } from './thumbnailGenerator';

export type {
    ProcessingOptions,
    ProcessingResult,
    ProcessingProgress,
    ProcessingError,
    RemoveBgResponse,
    ThumbnailResult,
} from './types';
