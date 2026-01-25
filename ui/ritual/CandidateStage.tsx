import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { COLORS } from '../tokens/color.tokens';
import { TYPOGRAPHY } from '../tokens';
import { SPACING } from '../tokens/spacing.tokens';
import { SmartImage } from '../primitives/SmartImage';
import { ShiningBorder } from '../primitives/ShiningBorder';
import { LinearGradient } from 'expo-linear-gradient';

import type { Outfit } from '../../truth/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CandidateStageProps {
    outfit: Outfit;
    userId: string;
}

export const CandidateStage: React.FC<CandidateStageProps> = ({ outfit, userId }) => {
    const { pieces, score } = outfit;

    // DEBUG: Log outfit data on mount
    React.useEffect(() => {
        console.log('[CandidateStage] Rendering outfit:', {
            outfitId: outfit.id,
            pieceCount: pieces.length,
            pieces: pieces.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                imageUri: typeof p.imageUri === 'string'
                    ? p.imageUri.substring(0, 60) + '...'
                    : `require(${p.imageUri})`
            }))
        });
    }, [outfit.id]);

    // Derived metadata
    const weatherTag = "OPTIMIZED FOR 12°C // CLEAR";
    const editorialDescription = "A precise configuration of technical shells and obsidian bases, calibrated for high-performance urban navigation.";

    // -------------------------------------------------------------------------
    // DYNAMIC BENTO GRID LOGIC (1-5 ITEMS)
    // -------------------------------------------------------------------------
    const renderBentoGrid = () => {
        const count = pieces.length;
        if (count === 0) return null;

        // 1 ITEM: FEATURE FOCUS
        if (count === 1) {
            return (
                <View style={[styles.heroGrid, { height: 400 }]}>
                    <View style={styles.bentoTall}>
                        <SmartImage source={typeof pieces[0].imageUri === 'number' ? pieces[0].imageUri : { uri: pieces[0].imageUri }} style={styles.fullImage} contentFit="cover" />
                        <View style={styles.bentoLabel}><Text style={styles.bentoLabelText}>PRIMARY</Text></View>
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.4)']} style={styles.cardGradient} />
                    </View>
                </View>
            );
        }

        // 2 ITEMS: BALANCED SPLIT
        if (count === 2) {
            return (
                <View style={styles.heroGrid}>
                    <View style={styles.gridMainCol}>
                        <View style={styles.bentoTall}>
                            <SmartImage source={typeof pieces[0].imageUri === 'number' ? pieces[0].imageUri : { uri: pieces[0].imageUri }} style={styles.fullImage} contentFit="cover" />
                            <View style={styles.bentoLabel}><Text style={styles.bentoLabelText}>PRIMARY</Text></View>
                        </View>
                    </View>
                    <View style={styles.gridSideCol}>
                        <View style={styles.bentoTall}>
                            <SmartImage source={typeof pieces[1].imageUri === 'number' ? pieces[1].imageUri : { uri: pieces[1].imageUri }} style={styles.fullImage} contentFit="cover" />
                            <View style={styles.bentoLabel}><Text style={styles.bentoLabelText}>BASE</Text></View>
                        </View>
                    </View>
                </View>
            );
        }

        // 3 ITEMS: CLASSIC BENTO (WIRE-FRAME STYLE)
        if (count === 3) {
            return (
                <View style={styles.heroGrid}>
                    <View style={styles.gridMainCol}>
                        <View style={styles.bentoTall}>
                            <SmartImage source={typeof pieces[0].imageUri === 'number' ? pieces[0].imageUri : { uri: pieces[0].imageUri }} style={styles.fullImage} contentFit="cover" />
                            <View style={styles.bentoLabel}><Text style={styles.bentoLabelText}>PRIMARY</Text></View>
                        </View>
                    </View>
                    <View style={styles.gridSideCol}>
                        <View style={styles.bentoSquare}>
                            <SmartImage source={typeof pieces[1].imageUri === 'number' ? pieces[1].imageUri : { uri: pieces[1].imageUri }} style={styles.fullImage} contentFit="cover" />
                        </View>
                        <View style={styles.bentoDetail}>
                            <SmartImage source={typeof pieces[2].imageUri === 'number' ? pieces[2].imageUri : { uri: pieces[2].imageUri }} style={styles.fullImage} contentFit="cover" />
                            <View style={styles.gridPill}>
                                <Text style={styles.pillLabel}>{(score * 100).toFixed(0)}%</Text>
                                <View style={styles.pillDot} />
                                <Text style={styles.pillValue}>MATCH</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        // 4 ITEMS: QUAD BENTO
        if (count === 4) {
            return (
                <View style={styles.heroGrid}>
                    <View style={styles.gridMainCol}>
                        <View style={styles.bentoTall}>
                            <SmartImage source={typeof pieces[0].imageUri === 'number' ? pieces[0].imageUri : { uri: pieces[0].imageUri }} style={styles.fullImage} contentFit="cover" />
                            <View style={styles.bentoLabel}><Text style={styles.bentoLabelText}>PRIMARY</Text></View>
                        </View>
                        <View style={styles.bentoSmall}>
                            <SmartImage source={typeof pieces[3].imageUri === 'number' ? pieces[3].imageUri : { uri: pieces[3].imageUri }} style={styles.fullImage} contentFit="cover" />
                        </View>
                    </View>
                    <View style={styles.gridSideCol}>
                        <View style={styles.bentoSquare}>
                            <SmartImage source={typeof pieces[1].imageUri === 'number' ? pieces[1].imageUri : { uri: pieces[1].imageUri }} style={styles.fullImage} contentFit="cover" />
                        </View>
                        <View style={styles.bentoDetail}>
                            <SmartImage source={typeof pieces[2].imageUri === 'number' ? pieces[2].imageUri : { uri: pieces[2].imageUri }} style={styles.fullImage} contentFit="cover" />
                        </View>
                    </View>
                </View>
            );
        }

        // 5+ ITEMS: FULL GRID
        return (
            <View style={styles.heroGrid}>
                <View style={styles.gridMainCol}>
                    <View style={styles.bentoTall}>
                        <SmartImage source={typeof pieces[0].imageUri === 'number' ? pieces[0].imageUri : { uri: pieces[0].imageUri }} style={styles.fullImage} contentFit="cover" />
                        <View style={styles.bentoLabel}><Text style={styles.bentoLabelText}>PRIMARY</Text></View>
                    </View>
                    <View style={styles.bentoSmall}>
                        <SmartImage source={typeof pieces[4].imageUri === 'number' ? pieces[4].imageUri : { uri: pieces[4].imageUri }} style={styles.fullImage} contentFit="cover" />
                    </View>
                </View>
                <View style={styles.gridSideCol}>
                    <View style={styles.bentoSquare}>
                        <SmartImage source={typeof pieces[1].imageUri === 'number' ? pieces[1].imageUri : { uri: pieces[1].imageUri }} style={styles.fullImage} contentFit="cover" />
                        <View style={styles.brandBadge}>
                            <Text style={styles.brandText}>FW-26</Text>
                        </View>
                    </View>
                    <View style={styles.bentoSquare}>
                        <SmartImage source={typeof pieces[2].imageUri === 'number' ? pieces[2].imageUri : { uri: pieces[2].imageUri }} style={styles.fullImage} contentFit="cover" />
                    </View>
                    <View style={[styles.bentoDetail, { flex: 1 }]}>
                        <SmartImage source={typeof pieces[3].imageUri === 'number' ? pieces[3].imageUri : { uri: pieces[3].imageUri }} style={styles.fullImage} contentFit="cover" />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1) CONTEXT HEADER (Moved Above Grid) */}
                <View style={styles.headerSection}>
                    <Text style={styles.kicker}>{weatherTag}</Text>
                    <Text style={styles.title}>Obsidian{'\n'}Command</Text>
                </View>

                {/* 2) HERO BENTO GRID */}
                {renderBentoGrid()}

                {/* 3) DESCRIPTION */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.descriptionText}>
                        {editorialDescription}
                    </Text>
                </View>

                {/* 4) ITEM BREAKDOWN */}
                <View style={styles.breakdownSection}>
                    <Text style={styles.sectionTitle}>COMPONENT ANALYSIS</Text>
                    {pieces.map((piece: any, index: number) => (
                        <ShiningBorder
                            key={`${piece.id}_list_${index}`}
                            style={styles.itemCardWrapper}
                            borderWidth={1}
                            // DUAL BEAM: Restoring user's preferred light source config
                            colors={['transparent', '#FFFFFF', 'transparent', '#FFFFFF', 'transparent']}
                            locations={[0.1, 0.25, 0.5, 0.75, 0.9]}
                            hiddenCorners={['top-right', 'bottom-left']}
                        >
                            <View style={styles.itemCardContent}>
                                <SmartImage
                                    source={typeof piece.imageUri === 'number' ? piece.imageUri : { uri: piece.imageUri }}
                                    style={styles.itemThumb}
                                    contentFit="contain"
                                />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemCategory}>{piece.category?.toUpperCase() || 'ITEM'}</Text>
                                    <Text style={styles.itemName}>{piece.name || `${piece.color} ${piece.category}`}</Text>
                                </View>
                            </View>
                        </ShiningBorder>
                    ))}
                </View>

                {/* Identity Footer */}
                <View style={styles.identitySection}>
                    <Text style={styles.identityLabel}>IDENTITY: AUTH_REQUIRED</Text>
                    <Text style={styles.identityId}>{userId} // SECURE_SYNC</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        paddingTop: 40,
        paddingBottom: 40,
    },
    // BENTO GRID SYSTEM
    heroGrid: {
        flexDirection: 'row',
        height: 480,
        gap: 12,
        paddingHorizontal: SPACING.GUTTER,
        marginBottom: 32,
    },
    gridMainCol: {
        flex: 1.2,
        gap: 12,
    },
    gridSideCol: {
        flex: 1,
        gap: 12,
    },
    bentoTall: {
        flex: 3,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    bentoSmall: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    bentoSquare: {
        flex: 1,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    bentoDetail: {
        flex: 1.5,
        backgroundColor: COLORS.DEEP_OBSIDIAN,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    bentoLabel: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 3,
        paddingHorizontal: 7,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    bentoLabelText: {
        color: COLORS.ASH_GRAY,
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
    },
    gridPill: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
    },
    brandBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        zIndex: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    brandText: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    pillLabel: {
        color: COLORS.RITUAL_WHITE,
        fontSize: 10,
        fontWeight: '700',
    },
    pillDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: COLORS.ELECTRIC_BLUE,
        marginHorizontal: 6,
    },
    pillValue: {
        color: COLORS.KINETIC_SILVER,
        fontSize: 10,
        fontWeight: '600',
    },
    // HEADER
    headerSection: {
        paddingHorizontal: SPACING.GUTTER,
        marginBottom: 24,
    },
    kicker: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.ELECTRIC_BLUE,
        marginBottom: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    title: {
        fontFamily: TYPOGRAPHY.STACKS.DISPLAY,
        fontSize: 32,
        color: COLORS.RITUAL_WHITE,
        lineHeight: 38,
    },
    // DESCRIPTION
    descriptionSection: {
        paddingHorizontal: SPACING.GUTTER,
        marginBottom: 24,
    },
    descriptionText: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.SOFT_WHITE,
        lineHeight: 22,
        opacity: 0.9,
    },
    // BREAKDOWN
    breakdownSection: {
        paddingHorizontal: SPACING.GUTTER,
        marginBottom: 24,
    },
    sectionTitle: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.ASH_GRAY,
        marginBottom: 12,
        letterSpacing: 1,
    },
    itemCardWrapper: {
        marginBottom: 10,
    },
    itemCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#050508',
    },
    itemThumb: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    itemCategory: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 9,
        color: COLORS.ASH_GRAY,
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    itemName: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        fontSize: 14,
        color: COLORS.RITUAL_WHITE,
        fontWeight: '500',
    },
    // IDENTITY
    identitySection: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 40,
    },
    identityLabel: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: COLORS.ELECTRIC_COBALT,
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '700',
        marginBottom: 4,
    },
    identityId: {
        fontFamily: TYPOGRAPHY.STACKS.PRIMARY,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: 1,
    },
});
