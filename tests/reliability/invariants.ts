
import { Piece, PieceID } from '../../truth/types';
import { Context, Outfit } from '../../engine/outfit/models';

export interface InvariantResult {
    pass: boolean;
    level: 'FAIL' | 'WARN' | 'PASS';
    message?: string;
    code: string;
}

export function checkInvariants(ctx: Context, outfit: Outfit, wardrobe: Record<PieceID, Piece>): InvariantResult[] {
    const results: InvariantResult[] = [];
    const items = outfit.items.map(id => wardrobe[id as any]).filter(Boolean); // Cast ID

    // H1. No outfit may include any garment that violates hard veto rules.
    // (Simplistic check for now based on known vetoes: e.g. "Laundry" status)
    for (const item of items) {
        if (item.status === 'Laundry' || item.status === 'Ghost') {
            results.push({
                pass: false,
                level: 'FAIL',
                code: 'H1_VETO_VIOLATION',
                message: `Included item ${item.id} with status ${item.status}`
            });
        }
    }

    // H2. No "double loud patterns": top and bottom cannot both be non-solid/non-stripe?
    // Let's assume "loud" = anything not solid or stripe.
    const top = items.find(i => i.category === 'Top');
    const bottom = items.find(i => i.category === 'Bottom');
    if (top && bottom) {
        // App pieces use "striped", Engine uses "stripe". Generatos use Engine types?
        // Generators use TRUTH types for Piece but Generator code assigns 'stripe' (Engine enum).
        // Let's be loose here or check both.
        const pTop = top.pattern as string;
        const pBot = bottom.pattern as string;

        const isLoudTop = pTop !== 'solid' && pTop !== 'stripe' && pTop !== 'striped';
        const isLoudBottom = pBot !== 'solid' && pBot !== 'stripe' && pBot !== 'striped';

        if (isLoudTop && isLoudBottom) {
            results.push({
                pass: false,
                level: 'FAIL',
                code: 'H2_DOUBLE_LOUD',
                message: `Double loud patterns: ${top.pattern} + ${bottom.pattern}`
            });
        }
    }

    // H3. Office formal: reject neon + graphic + formality < min.
    if (ctx.event === 'office_formal') {
        for (const item of items) {
            const isNeon = item.color.toLowerCase().includes('neon');
            const isGraphic = item.pattern === 'graphic';
            if (isNeon || isGraphic || item.formality < ctx.formalityMin) {
                results.push({
                    pass: false,
                    level: 'FAIL',
                    code: 'H3_OFFICE_FORMAL_VIOLATION',
                    message: `Office formal violation: ${item.id} (neon:${isNeon}, graphic:${isGraphic}, formality:${item.formality})`
                });
            }
        }
    }

    // H4. Temple: reject shorts, above-knee skirts, deep neck, overly revealing types.
    if (ctx.event === 'temple') {
        for (const item of items) {
            // Simplified check based on subcategory/name
            const badTypes = ['shorts', 'skirt_mini', 'tank', 'crop'];
            const lcSub = (item.subcategory || '').toLowerCase();
            if (badTypes.some(t => lcSub.includes(t))) {
                results.push({
                    pass: false,
                    level: 'FAIL',
                    code: 'H4_TEMPLE_VIOLATION',
                    message: `Temple violation: ${item.id} is ${item.subcategory}`
                });
            }
        }
    }

    // H5. Monsoon rainProb > 0.5: reject suede, raw_silk; optionally reject white linen.
    if (ctx.rainProb > 0.5) {
        for (const item of items) {
            const fabric = (item.material || '').toLowerCase();
            if (fabric.includes('suede') || fabric.includes('silk')) { // 'raw_silk' matched by 'silk'
                results.push({
                    pass: false,
                    level: 'FAIL',
                    code: 'H5_MONSOON_FABRIC',
                    message: `Monsoon violation: ${item.id} is ${item.material}`
                });
            }
            // Optional: White linen
            if (fabric.includes('linen') && item.color.toLowerCase().includes('white')) {
                results.push({
                    pass: true,
                    level: 'WARN',
                    code: 'S_MONSOON_WHITE_LINEN',
                    message: `Risky white linen in monsoon: ${item.id}`
                });
            }
        }
    }

    // H6. Outfit must satisfy template slots (top+bottom+footwear etc.) unless wardrobe cannot.
    // Assuming standard 3-piece slot for now
    const hasTop = items.some(i => i.category === 'Top' || i.category === 'Outerwear' || (i as any).type === 'one_piece');
    const hasBottom = items.some(i => i.category === 'Bottom' || (i as any).type === 'one_piece');
    const hasShoes = items.some(i => i.category === 'Shoes');

    // We check if the wardrobe actually HAD these items available. 
    // If wardrobe has at least one top, one bottom, one shoe, the outfit MUST have them.
    // This is hard to check here without knowing full wardrobe availability for this specific run.
    // For reliability test, we assume synthesized wardrobe ALWAYS has basics.
    if (!hasTop || !hasBottom || !hasShoes) {
        results.push({
            pass: false,
            level: 'FAIL',
            code: 'H6_MISSING_SLOTS',
            message: `Missing slots: Top:${hasTop}, Bottom:${hasBottom}, Shoes:${hasShoes}`
        });
    }

    // H7. Output IDs must exist in wardrobe (or in DB) and belong to user.
    // Implicitly checked by 'filter(Boolean)' above, but let's be explicit
    if (items.length !== outfit.items.length) {
        results.push({
            pass: false,
            level: 'FAIL',
            code: 'H7_INVALID_ID',
            message: `Some outfit items do not exist in the provided wardrobe snapshot.`
        });
    }

    return results;
}
