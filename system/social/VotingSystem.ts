export type VoteType = 'GOOD' | 'BAD';

export interface VoteRecord {
    outfitId: string;
    voterId: string;
    vote: VoteType;
    timestamp: number;
}

export class VotingSystem {
    private static instance: VotingSystem;
    private votes: VoteRecord[] = [];

    private constructor() { }

    public static getInstance(): VotingSystem {
        if (!VotingSystem.instance) {
            VotingSystem.instance = new VotingSystem();
        }
        return VotingSystem.instance;
    }

    public castVote(outfitId: string, voterId: string, vote: VoteType): void {
        console.log(`[VotingSystem] Cast ${vote} for ${outfitId} by ${voterId}`);

        // Remove existing vote by this user for this outfit if it exists
        this.votes = this.votes.filter(v => !(v.outfitId === outfitId && v.voterId === voterId));

        this.votes.push({
            outfitId,
            voterId,
            vote,
            timestamp: Date.now()
        });
    }

    public getScores(outfitId: string): { good: number, bad: number } {
        const outfitVotes = this.votes.filter(v => v.outfitId === outfitId);
        return {
            good: outfitVotes.filter(v => v.vote === 'GOOD').length,
            bad: outfitVotes.filter(v => v.vote === 'BAD').length
        };
    }
}
