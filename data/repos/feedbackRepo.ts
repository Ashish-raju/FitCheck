/**
 * FeedbackRepo - Analytics and event logging
 * 
 * Analytics and event logging repository.
 * Can be enhanced with Firebase Analytics or custom event collection.
 */

export interface AnalyticsEvent {
    type: 'outfit_generated' | 'outfit_sealed' | 'garment_uploaded' | 'favorite_toggled' | 'outfit_created' | 'outfit_deleted' | 'profile_updated' | 'custom';
    userId: string;
    metadata?: Record<string, any>;
    timestamp?: number;
}

export class FeedbackRepo {

    /**
     * Log an analytics event
     */
    static async logEvent(userId: string, event: AnalyticsEvent): Promise<void> {
        try {
            // Add userId and timestamp if not provided
            const enrichedEvent = {
                ...event,
                userId,
                timestamp: event.timestamp || Date.now()
            };

            // Log to console for now (can be enhanced with Firebase Analytics later)
            console.log('[FeedbackRepo] Event logged:', enrichedEvent.type, enrichedEvent.metadata);

            // TODO: Integrate with Firebase Analytics or custom events collection
            // await FIREBASE_DB.collection('events').add(enrichedEvent);
        } catch (error) {
            console.error('[FeedbackRepo] Failed to log event:', error);
            // Don't throw - analytics failures shouldn't break app flow
        }
    }

    /**
     * Log outfit generation
     */
    static async logOutfitGeneration(userId: string, outfitCount: number, context?: any): Promise<void> {
        await this.logEvent(userId, {
            type: 'outfit_generated',
            userId,
            metadata: {
                outfitCount,
                ...context
            }
        });
    }

    /**
     * Log outfit sealed
     */
    static async logOutfitSealed(userId: string, outfitId: string, score?: number): Promise<void> {
        await this.logEvent(userId, {
            type: 'outfit_sealed',
            userId,
            metadata: {
                outfitId,
                score
            }
        });
    }

    /**
     * Log garment upload
     */
    static async logGarmentUploaded(userId: string, garmentId: string, category?: string): Promise<void> {
        await this.logEvent(userId, {
            type: 'garment_uploaded',
            userId,
            metadata: {
                garmentId,
                category
            }
        });
    }
}
