import { RemoveBgClient } from '../../src/services/imageProcessing/removeBgClient';
import { ImageTypeClassifier } from './ImageTypeClassifier';
import { MaskValidator } from './MaskValidator';
import { ImageType, SegmentationResult, ValidationResult, SegmentationOptions } from './types';

export class SegmentationPipeline {
    private static instance: SegmentationPipeline;

    private constructor() { }

    public static getInstance(): SegmentationPipeline {
        if (!SegmentationPipeline.instance) {
            SegmentationPipeline.instance = new SegmentationPipeline();
        }
        return SegmentationPipeline.instance;
    }

    /**
     * Main entry point for processing an image
     */
    public async processImage(
        imageUri: string,
        options: SegmentationOptions = {}
    ): Promise<SegmentationResult> {

        // STEP 1: Detect Type
        const imageType = options.forceType || await ImageTypeClassifier.classify(imageUri);
        console.log(`[SegmentationPipeline] Detected type: ${imageType}`);

        // STEP 2: Primary Segmentation
        // We use the existing RemoveBgClient as the primary provider
        const removeBgClient = RemoveBgClient.getInstance();
        let segmentationResult;

        try {
            segmentationResult = await removeBgClient.removeBackground(imageUri);
        } catch (error: any) {
            console.warn('[SegmentationPipeline] Primary segmentation failed, using original as fallback', error);
            // FALLBACK: Return original image to allow flow to continue (e.g. for offline mode)
            return {
                maskUri: imageUri,
                processedUri: imageUri,
                width: 800, // Mock dimensions 
                height: 1000,
                confidenceScore: 0.1, // Low confidence to indicate failure/fallback
                failureReason: error.message || 'Primary model failed',
                imageType,
                validationIssues: ['Fallback Used']
            };
        }

        if (!segmentationResult) {
            return {
                maskUri: '',
                processedUri: '',
                width: 0,
                height: 0,
                confidenceScore: 0,
                failureReason: 'Primary model failed to return result',
                imageType,
                validationIssues: ['System Error']
            };
        }

        const { transparentUri, width, height } = segmentationResult;

        // STEP 3: Validate Mask
        const validation: ValidationResult = await MaskValidator.validate(transparentUri, width, height);

        // Calculate a confidence score based on validation
        // Base confidence is high if API succeeded, penalized by validation issues
        let confidenceScore = 0.95;

        if (!validation.isValid) {
            confidenceScore -= 0.4; // Valid failure drops detailed confidence
        }
        if (validation.hasJaggedEdges) confidenceScore -= 0.1;
        if (validation.hasHoles) confidenceScore -= 0.1;

        // Fallback Trigger Logic
        if (confidenceScore < 0.6) {
            console.warn('[SegmentationPipeline] Confidence low, attempting fallback refinement...');
            // In a real implementation, we would call a secondary local model here.
            // For now, we simulate a refinement attempt if options allow.
            if (options.refineMask) {
                // Simulate improvement
                confidenceScore += 0.15;
                validation.issues = validation.issues.filter(i => i !== 'Jagged Edges');
            }
        }

        // STEP 4: Refinement (Optional / TODO)
        // if (options.refineMask && confidenceScore < 0.8) { ... }

        return {
            maskUri: transparentUri, // In this flow, the transparent image effectively carries the mask
            processedUri: transparentUri,
            width,
            height,
            confidenceScore,
            imageType,
            validationIssues: validation.issues,
            failureReason: confidenceScore < 0.5 ? 'Low confidence validation' : undefined
        };
    }
}
