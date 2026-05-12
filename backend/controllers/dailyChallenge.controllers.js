import { readFileSync } from 'node:fs';

import DailyChallengeAttempt from "../models/dailyChallengeAttempt.model.js";

const INITIAL_TIPS_REMAINING = 3;
const MISTAKE_PENALTY_SECONDS = 30;
const TIP_PENALTY_SECONDS = 60;
const challenge = JSON.parse(
    readFileSync(new URL('../data/dailyChallenge.json', import.meta.url), 'utf8')
);

function cloneMatrix(matrix) {
    return matrix.map(row => [...row]);
}

function createEmptyCandidates() {
    return Array.from({ length: 9 }, () => (
        Array.from({ length: 9 }, () => [])
    ));
}

function getLockedBoard(puzzle) {
    return puzzle.map(row => row.map(value => value !== 0));
}

function isValidMatrix(matrix, validator) {
    return Array.isArray(matrix)
        && matrix.length === 9
        && matrix.every(row => Array.isArray(row) && row.length === 9 && row.every(validator));
}

function isValidNumberCell(value) {
    return Number.isInteger(value) && value >= 0 && value <= 9;
}

function sanitizeCount(value) {
    return Math.max(0, Math.floor(Number(value) || 0));
}

function sanitizeHistory(history = []) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(entry => (
            Number.isInteger(entry?.r)
            && Number.isInteger(entry?.c)
            && Number.isInteger(entry?.prev)
            && Number.isInteger(entry?.next)
        ))
        .map(entry => ({
            r: entry.r,
            c: entry.c,
            prev: entry.prev,
            next: entry.next,
            at: entry.at ? new Date(entry.at) : new Date(),
        }));
}

function normalizeTipIndex(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 && number < 9 ? number : null;
}

function sanitizeTipCells(tipCells = []) {
    if (!Array.isArray(tipCells)) {
        return [];
    }

    const seen = new Set();
    const sanitized = [];

    tipCells.forEach(cell => {
        const row = normalizeTipIndex(cell?.row);
        const col = normalizeTipIndex(cell?.col);

        if (row === null || col === null) {
            return;
        }

        const key = `${row}:${col}`;
        if (seen.has(key)) {
            return;
        }

        seen.add(key);
        sanitized.push({ row, col });
    });

    return sanitized;
}

function sanitizeCandidateCell(cell) {
    if (!Array.isArray(cell)) {
        return [];
    }

    return [...new Set(cell
        .map(value => Number(value))
        .filter(value => Number.isInteger(value) && value >= 1 && value <= 9))]
        .sort((a, b) => a - b);
}

function sanitizeCandidates(candidates = [], board = null) {
    if (!Array.isArray(candidates)) {
        return createEmptyCandidates();
    }

    return Array.from({ length: 9 }, (_, row) => (
        Array.from({ length: 9 }, (_, col) => {
            if (Array.isArray(board) && board?.[row]?.[col] !== 0) {
                return [];
            }

            return sanitizeCandidateCell(candidates?.[row]?.[col]);
        })
    ));
}

function isBoardComplete(board, solution) {
    if (!isValidMatrix(board, isValidNumberCell) || !isValidMatrix(solution, isValidNumberCell)) {
        return false;
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] !== solution[row][col]) {
                return false;
            }
        }
    }

    return true;
}

function serializeChallenge() {
    return {
        challengeId: challenge.challengeId,
        difficulty: challenge.difficulty,
        puzzle: cloneMatrix(challenge.puzzle),
        createdAt: challenge.createdAt,
    };
}

function serializeAttempt(attempt) {
    if (!attempt) {
        return null;
    }

    const data = attempt.toObject();
    return {
        ...data,
        sessionId: data.challengeId,
        puzzle: cloneMatrix(data.puzzle),
        board: cloneMatrix(data.board),
        locked: data.locked.map(row => [...row]),
        solution: cloneMatrix(data.solution),
        candidates: sanitizeCandidates(data.candidates, data.board),
        history: sanitizeHistory(data.history),
        mistakeCount: sanitizeCount(data.mistakeCount),
        tipsUsed: sanitizeCount(data.tipsUsed),
        tipCells: sanitizeTipCells(data.tipCells),
        tipsRemaining: sanitizeCount(data.tipsRemaining ?? INITIAL_TIPS_REMAINING),
        elapsedSeconds: sanitizeCount(data.elapsedSeconds),
        finalTimeSeconds: data.finalTimeSeconds === undefined || data.finalTimeSeconds === null
            ? null
            : sanitizeCount(data.finalTimeSeconds),
        id: data._id,
    };
}

function buildAttemptUpdatePayload(body = {}) {
    const board = body.board;

    if (!isValidMatrix(board, isValidNumberCell)) {
        throw new Error("Current board is invalid!");
    }

    return {
        board,
        candidates: sanitizeCandidates(body.candidates, board),
        history: sanitizeHistory(body.history),
        mistakeCount: sanitizeCount(body.mistakeCount),
        tipsUsed: sanitizeCount(body.tipsUsed),
        tipCells: sanitizeTipCells(body.tipCells),
        tipsRemaining: sanitizeCount(body.tipsRemaining ?? INITIAL_TIPS_REMAINING),
        elapsedSeconds: sanitizeCount(body.elapsedSeconds),
        status: 'unfinished',
        clientUpdatedAt: body.clientUpdatedAt ? new Date(body.clientUpdatedAt) : new Date(),
    };
}

async function findAttempt(userId) {
    return DailyChallengeAttempt.findOne({ userId, challengeId: challenge.challengeId });
}

async function createInitialAttempt(userId) {
    const puzzle = cloneMatrix(challenge.puzzle);

    return DailyChallengeAttempt.create({
        userId,
        challengeId: challenge.challengeId,
        difficulty: challenge.difficulty,
        puzzle,
        board: cloneMatrix(puzzle),
        locked: getLockedBoard(puzzle),
        solution: cloneMatrix(challenge.solution),
        candidates: createEmptyCandidates(),
        history: [],
        mistakeCount: 0,
        tipsUsed: 0,
        tipCells: [],
        tipsRemaining: INITIAL_TIPS_REMAINING,
        status: 'unfinished',
        elapsedSeconds: 0,
        startedAt: new Date(),
        clientUpdatedAt: new Date(),
    });
}

export const getCurrentChallenge = async (req, res) => {
    try {
        const attempt = await findAttempt(req.userId);

        res.status(200).json({
            success: true,
            challenge: serializeChallenge(),
            attempt: serializeAttempt(attempt),
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const startChallenge = async (req, res) => {
    try {
        const existingAttempt = await findAttempt(req.userId);

        if (existingAttempt) {
            return res.status(200).json({
                success: true,
                message: "Daily challenge attempt loaded!",
                challenge: serializeChallenge(),
                attempt: serializeAttempt(existingAttempt),
            });
        }

        const attempt = await createInitialAttempt(req.userId);

        res.status(201).json({
            success: true,
            message: "Daily challenge started!",
            challenge: serializeChallenge(),
            attempt: serializeAttempt(attempt),
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateChallengeAttempt = async (req, res) => {
    try {
        const attempt = await findAttempt(req.userId);

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Daily challenge attempt not found!" });
        }

        if (attempt.status === 'completed') {
            return res.status(200).json({
                success: true,
                message: "Daily challenge is already completed!",
                attempt: serializeAttempt(attempt),
            });
        }

        const payload = buildAttemptUpdatePayload(req.body);
        const incomingTime = new Date(payload.clientUpdatedAt).getTime();
        const existingTime = attempt.clientUpdatedAt ? new Date(attempt.clientUpdatedAt).getTime() : 0;

        if (existingTime > incomingTime) {
            return res.status(200).json({
                success: true,
                message: "Daily challenge attempt is already newer!",
                attempt: serializeAttempt(attempt),
            });
        }

        Object.assign(attempt, payload);
        await attempt.save();

        res.status(200).json({
            success: true,
            message: "Daily challenge saved!",
            attempt: serializeAttempt(attempt),
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const completeChallengeAttempt = async (req, res) => {
    try {
        const attempt = await findAttempt(req.userId);

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Daily challenge attempt not found!" });
        }

        if (attempt.status === 'completed') {
            return res.status(200).json({
                success: true,
                message: "Daily challenge is already completed!",
                attempt: serializeAttempt(attempt),
            });
        }

        const payload = buildAttemptUpdatePayload(req.body);

        if (!isBoardComplete(payload.board, attempt.solution)) {
            throw new Error("Daily challenge answer is not correct!");
        }

        const finalTimeSeconds = payload.elapsedSeconds
            + (payload.mistakeCount * MISTAKE_PENALTY_SECONDS)
            + (payload.tipsUsed * TIP_PENALTY_SECONDS);

        Object.assign(attempt, {
            ...payload,
            status: 'completed',
            completedAt: req.body?.completedAt ? new Date(req.body.completedAt) : new Date(),
            finalTimeSeconds,
        });
        await attempt.save();

        res.status(200).json({
            success: true,
            message: "Daily challenge completed!",
            attempt: serializeAttempt(attempt),
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getChallengeLeaderboard = async (req, res) => {
    try {
        const attempts = await DailyChallengeAttempt
            .find({ challengeId: challenge.challengeId, status: 'completed' })
            .sort({ finalTimeSeconds: 1, completedAt: 1 })
            .populate('userId', 'name email');

        const leaderboard = attempts.map((attempt, index) => {
            const user = attempt.userId;
            const fallbackName = user?.email ? String(user.email).split('@')[0] : 'Player';

            return {
                rank: index + 1,
                userId: user?._id,
                name: user?.name || fallbackName,
                finalTimeSeconds: sanitizeCount(attempt.finalTimeSeconds),
                elapsedSeconds: sanitizeCount(attempt.elapsedSeconds),
                mistakeCount: sanitizeCount(attempt.mistakeCount),
                tipsUsed: sanitizeCount(attempt.tipsUsed),
                completedAt: attempt.completedAt,
            };
        });

        res.status(200).json({
            success: true,
            challenge: serializeChallenge(),
            leaderboard,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
