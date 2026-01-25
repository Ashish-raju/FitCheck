import type { Outfit, Piece } from "../../truth/types";
import type { WardrobeIndex } from "../core/wardrobeIndex";
import { WardrobeIndexBuilder } from "../core/wardrobeIndex";

/**
 * EngineDebugger - Provides visibility into what the engine is actually seeing and using
 */
export class EngineDebugger {
    private static enabled: boolean = true; // Toggle debug mode

    public static setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    /**
     * Log comprehensive wardrobe statistics
     */
    public static logWardrobeStats(index: WardrobeIndex) {
        if (!this.enabled) return;

        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║              WARDROBE ANALYTICS REPORT                       ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        // Total items
        const totalItems = Object.keys(index.itemsById).length;
        console.log(`📊 Total Items: ${totalItems}`);

        // By category
        console.log('\n📂 Items by Category:');
        Object.entries(index.itemsByCategory).forEach(([category, items]) => {
            if (items.length > 0) {
                console.log(`   ${category}: ${items.length}`);
            }
        });

        // Top colors
        console.log('\n🎨 Top 5 Colors:');
        const topColors = WardrobeIndexBuilder.getTopN(index.colorsHistogram, 5);
        topColors.forEach(([color, count], i) => {
            console.log(`   ${i + 1}. ${color}: ${count} items`);
        });

        // Top brands
        console.log('\n🏷️  Top 5 Brands:');
        const topBrands = WardrobeIndexBuilder.getTopN(index.brandsHistogram, 5);
        topBrands.forEach(([brand, count], i) => {
            console.log(`   ${i + 1}. ${brand}: ${count} items`);
        });

        // Top style tags
        console.log('\n✨ Top 5 Style Tags:');
        const topTags = WardrobeIndexBuilder.getTopN(index.tagsHistogram, 5);
        topTags.forEach(([tag, count], i) => {
            console.log(`   ${i + 1}. ${tag}: ${count} items`);
        });

        // Formality distribution
        console.log('\n📈 Formality Distribution:');
        index.formalityDistribution.forEach((count, level) => {
            if (level > 0) {
                const bar = '█'.repeat(Math.ceil(count / 5));
                console.log(`   Level ${level}: ${count} items ${bar}`);
            }
        });

        // Missing fields
        console.log('\n⚠️  Missing Fields Report:');
        const missing = index.missingFieldsSummary;
        const totalMissing = Object.values(missing).reduce((sum, val) => sum + val, 0);
        if (totalMissing === 0) {
            console.log('   ✅ All items have complete data!');
        } else {
            Object.entries(missing).forEach(([field, count]) => {
                if (count > 0) {
                    const pct = ((count / totalItems) * 100).toFixed(1);
                    console.log(`   ${field}: ${count} items (${pct}%)`);
                }
            });
        }

        console.log('\n' + '═'.repeat(64) + '\n');
    }

    /**
     * Show sample items as the engine sees them
     */
    public static logSampleItems(index: WardrobeIndex, count: number = 5) {
        if (!this.enabled) return;

        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║              SAMPLE ITEMS (Engine View)                     ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        const allItems = Object.values(index.itemsById);
        const samples = allItems.slice(0, Math.min(count, allItems.length));

        samples.forEach((item, i) => {
            console.log(`\n[${i + 1}] ${item.name || 'Unnamed'}`);
            console.log(`    ID: ${item.id}`);
            console.log(`    Category: ${item.category}`);
            console.log(`    Brand: ${item.brand || 'N/A'}`);
            console.log(`    Color: ${item.color}`);
            console.log(`    Formality: ${item.formality}/5`);
            console.log(`    Warmth: ${item.warmth}/5`);
            console.log(`    Style Tags: ${item.styleTags?.join(', ') || 'None'}`);
            console.log(`    Material: ${item.material || 'N/A'}`);
            console.log(`    Pattern: ${item.pattern || 'N/A'}`);
            console.log(`    Fit: ${item.fit || 'N/A'}`);
            console.log(`    Season: ${item.season?.join(', ') || 'N/A'}`);
        });

        console.log('\n' + '═'.repeat(64) + '\n');
    }

    /**
     * Log outfit recommendation with full breakdown
     */
    public static logOutfitRecommendation(
        outfit: Outfit,
        breakdown: any,
        rank: number
    ) {
        if (!this.enabled) return;

        console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
        console.log(`║           OUTFIT RECOMMENDATION #${rank}                          ║`);
        console.log(`╚══════════════════════════════════════════════════════════════╝\n`);

        console.log(`🎯 Final Score: ${outfit.score.toFixed(1)}/100`);
        console.log(`🎲 Confidence: ${((outfit.confidence || 0) * 100).toFixed(1)}%`);
        console.log(`🆔 Outfit ID: ${outfit.id}\n`);

        console.log('👕 Items:');
        outfit.pieces.forEach((piece) => {
            console.log(`   ${piece.category}: ${piece.name || 'Unnamed'}`);
            console.log(`      Brand: ${piece.brand || 'N/A'} | Color: ${piece.color} | Formality: ${piece.formality}/5`);
            console.log(`      Tags: ${piece.styleTags?.join(', ') || 'None'}`);
        });

        if (breakdown) {
            console.log('\n📊 Score Breakdown:');
            console.log(`   Color Harmony: ${breakdown.colorHarmony?.toFixed(1) || 0}/30`);
            console.log(`   Formality Alignment: ${breakdown.formalityAlignment?.toFixed(1) || 0}/20`);
            console.log(`   Style Coherence: ${breakdown.styleCoherence?.toFixed(1) || 0}/20`);
            console.log(`   Season Suitability: ${breakdown.seasonSuitability?.toFixed(1) || 0}/15`);
            console.log(`   Pattern Clash Penalty: -${breakdown.patternClash?.toFixed(1) || 0}/10`);
            console.log(`   Material Mismatch Penalty: -${breakdown.materialMismatch?.toFixed(1) || 0}/5`);

            if (breakdown.reasons && breakdown.reasons.length > 0) {
                console.log('\n💡 Reasons:');
                breakdown.reasons.forEach((reason: string) => {
                    console.log(`   • ${reason}`);
                });
            }
        }

        console.log('\n' + '═'.repeat(64) + '\n');
    }

    /**
     * Log generation performance metrics
     */
    public static logPerformanceMetrics(
        totalCombinations: number,
        validOutfits: number,
        timeMs: number
    ) {
        if (!this.enabled) return;

        console.log('\n⚡ Performance Metrics:');
        console.log(`   Total combinations considered: ${totalCombinations}`);
        console.log(`   Valid outfits after filtering: ${validOutfits}`);
        console.log(`   Generation time: ${timeMs.toFixed(2)}ms`);
        console.log(`   Combinations/sec: ${((totalCombinations / timeMs) * 1000).toFixed(0)}`);
    }
}
