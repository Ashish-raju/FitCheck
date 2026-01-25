import { SegmentationPipeline } from '../SegmentationPipeline';
import { TestImageConfig, TestResult, ReliabilityReport } from './types';

export class BackgroundRemovalTestHarness {
    private pipeline: SegmentationPipeline;

    constructor() {
        this.pipeline = SegmentationPipeline.getInstance();
    }

    /**
     * Run a batch of test configurations
     */
    public async runSuite(configs: TestImageConfig[]): Promise<ReliabilityReport> {
        const results: TestResult[] = [];
        let totalTime = 0;
        let totalConfidence = 0;

        console.log(`[TestHarness] Starting suite with ${configs.length} cases...`);

        for (const config of configs) {
            console.log(`[TestHarness] Running case: ${config.id} (${config.category})`);

            try {
                const startTime = Date.now();
                const result = await this.pipeline.processImage(config.uri, { refineMask: true });
                const endTime = Date.now();

                const timeMs = endTime - startTime;
                totalTime += timeMs;
                totalConfidence += result.confidenceScore;

                // Determine pass/fail based on expectation
                // If we expected success, we need high confidence & no validation errors
                // If we expected failure (e.g. low quality), we expect low confidence OR a graceful rejection

                let isSuccess = false;

                if (config.expectedSuccess) {
                    isSuccess = result.confidenceScore >= 0.8 && (!result.validationIssues || result.validationIssues.length === 0);
                } else {
                    // We expected it to fail/be rejected
                    // Success here means the SYSTEM correctly identified it as bad (low confidence)
                    isSuccess = result.confidenceScore < 0.8 || !!result.failureReason;
                }

                results.push({
                    configId: config.id,
                    success: isSuccess,
                    confidenceScore: result.confidenceScore,
                    processingTimeMs: timeMs,
                    failureReason: result.failureReason,
                    maskUri: result.maskUri,
                    validationIssues: result.validationIssues || []
                });

            } catch (error: any) {
                console.error(`[TestHarness] Crash in case ${config.id}`, error);
                results.push({
                    configId: config.id,
                    success: false, // Crashes are always failures
                    confidenceScore: 0,
                    processingTimeMs: 0,
                    failureReason: `CRASH: ${error.message}`,
                    validationIssues: ['CRASH']
                });
            }
        }

        return this.generateReport(results, totalTime, totalConfidence);
    }

    private generateReport(results: TestResult[], totalTime: number, totalConfidence: number): ReliabilityReport {
        const total = results.length;
        const passed = results.filter(r => r.success).length;
        const failed = total - passed;

        // Calculate category stats to find weakest link
        const categoryFailures: Record<string, number> = {};
        // (Note: In a real impl we would map configId back to category, assuming simple map here)

        return {
            timestamp: Date.now(),
            totalTests: total,
            passCount: passed,
            failCount: failed,
            averageConfidence: total > 0 ? totalConfidence / total : 0,
            averageTimeMs: total > 0 ? totalTime / total : 0,
            weakestCategory: 'Unknown', // Placeholder logic
            failures: results.filter(r => !r.success)
        };
    }
}
