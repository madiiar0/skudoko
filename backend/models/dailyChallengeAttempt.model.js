import mongoose from 'mongoose';

function createEmptyCandidates() {
    return Array.from({ length: 9 }, () => (
        Array.from({ length: 9 }, () => [])
    ));
}

const historyEntrySchema = new mongoose.Schema({
    r: {
        type: Number,
        required: true,
    },
    c: {
        type: Number,
        required: true,
    },
    prev: {
        type: Number,
        required: true,
    },
    next: {
        type: Number,
        required: true,
    },
    at: {
        type: Date,
        default: Date.now,
    },
}, {_id: false});

const tipCellSchema = new mongoose.Schema({
    row: {
        type: Number,
        required: true,
    },
    col: {
        type: Number,
        required: true,
    },
}, {_id: false});

const dailyChallengeAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    challengeId: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'extreme'],
        default: 'medium',
    },
    puzzle: {
        type: [[Number]],
        required: true,
    },
    board: {
        type: [[Number]],
        required: true,
    },
    locked: {
        type: [[Boolean]],
        required: true,
    },
    solution: {
        type: [[Number]],
        required: true,
    },
    candidates: {
        type: [[[Number]]],
        default: createEmptyCandidates,
    },
    history: {
        type: [historyEntrySchema],
        default: [],
    },
    mistakeCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    tipsUsed: {
        type: Number,
        default: 0,
        min: 0,
    },
    tipCells: {
        type: [tipCellSchema],
        default: [],
    },
    tipsRemaining: {
        type: Number,
        default: 3,
        min: 0,
    },
    status: {
        type: String,
        enum: ['unfinished', 'completed'],
        default: 'unfinished',
    },
    elapsedSeconds: {
        type: Number,
        default: 0,
        min: 0,
    },
    finalTimeSeconds: {
        type: Number,
        min: 0,
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
    clientUpdatedAt: {
        type: Date,
        default: Date.now,
    },
}, {timestamps: true});

dailyChallengeAttemptSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
dailyChallengeAttemptSchema.index({ challengeId: 1, status: 1, finalTimeSeconds: 1 });

const DailyChallengeAttempt = mongoose.model("DailyChallengeAttempt", dailyChallengeAttemptSchema);

export default DailyChallengeAttempt;
