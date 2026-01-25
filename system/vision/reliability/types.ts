
export interface TestImageConfig {
    id: string;
    uri: string; // Remote URL or local asset
    expectedType: 'FLAT_LAY' | 'WORN' | 'SHOES_ACCESSORIES';
    expectedSuccess: boolean;
    description: string;
    category: 'VISUAL' | 'STRUCTURAL' | 'HUMAN' | 'CAMERA' | 'PIPELINE' | 'DEVICE';
}

export interface TestResult {
    configId: string;
    success: boolean;
    confidenceScore: number;
    processingTimeMs: number;
    failureReason?: string;
    maskUri?: string;
    validationIssues: string[];
}

export interface ReliabilityReport {
    timestamp: number;
    totalTests: number;
    passCount: number;
    failCount: number;
    averageConfidence: number;
    averageTimeMs: number;
    weakestCategory: string;
    failures: TestResult[];
}
