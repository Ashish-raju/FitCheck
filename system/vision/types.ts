
export enum ImageType {
    FLAT_LAY = 'FLAT_LAY',
    WORN = 'WORN',
    SHOES_ACCESSORIES = 'SHOES_ACCESSORIES',
    UNKNOWN = 'UNKNOWN',
}

export interface SegmentationResult {
    maskUri: string;
    processedUri: string; // The final image with bg removed
    confidenceScore: number; // 0-1
    failureReason?: string;
    imageType: ImageType;
    validationIssues?: string[];
    width: number;
    height: number;
}

export interface ValidationResult {
    isValid: boolean;
    foregroundRatio: number;
    hasJaggedEdges: boolean;
    hasHoles: boolean;
    touchesBorders: boolean;
    issues: string[];
}

export interface SegmentationOptions {
    forceType?: ImageType;
    refineMask?: boolean;
}
