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

const gameSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    sessionId: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        default: "Untitled",
        trim: true,
        maxlength: 80,
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'extreme'],
        default: 'medium',
    },
    mistakeCount: {
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
    candidates: {
        type: [[[Number]]],
        default: createEmptyCandidates,
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
    history: {
        type: [historyEntrySchema],
        default: [],
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
    completedAt: Date,
    clientUpdatedAt: {
        type: Date,
        default: Date.now,
    },
}, {timestamps: true});

gameSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const GameSession = mongoose.model("GameSession", gameSessionSchema);

export default GameSession;
