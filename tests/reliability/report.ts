
import * as fs from 'fs';
import * as path from 'path';

export class ReliabilityReporter {
    private stats = {
        total: 0,
        pass: 0,
        fail: 0,
        warn: 0
    };

    private failures: any[] = [];
    private reportPath = path.join(process.cwd(), 'FAILURE_REPORT.md');

    logResult(result: { passed: boolean; level: string; details?: any; seed: number; context: any }) {
        this.stats.total++;
        if (result.level === 'FAIL') {
            this.stats.fail++;
            this.failures.push(result);
        } else if (result.level === 'WARN') {
            this.stats.warn++;
        } else {
            this.stats.pass++;
        }
    }

    writeReport() {
        const summary = `
# Reliability Test Report
**Timestamp**: ${new Date().toISOString()}

## Summary
- **Total Cases**: ${this.stats.total}
- **Passed**: ${this.stats.pass}
- **Failed**: ${this.stats.fail} ❌
- **Warnings**: ${this.stats.warn} ⚠️

## Failure Analysis
${this.failures.slice(0, 50).map(f => `
### [${f.details?.code || 'UNKNOWN'}] Seed: ${f.seed}
- **Invariant**: ${f.details?.message}
- **Context**: \`${JSON.stringify(f.context)}\`
- **Output IDs**: ${f.details?.outfitIds || 'N/A'}
`).join('\n')}

${this.failures.length > 50 ? `\n... and ${this.failures.length - 50} more failures truncated.` : ''}
`;

        fs.writeFileSync(this.reportPath, summary);
        console.log(`Report written to ${this.reportPath}`);
    }

    getFailureCount() {
        return this.stats.fail;
    }
}
