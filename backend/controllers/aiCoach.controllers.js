import OpenAI from "openai";

import DailyChallengeAttempt from "../models/dailyChallengeAttempt.model.js";
import GameSession from "../models/gameSession.model.js";
import User from "../models/user.model.js";

const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_MESSAGES = 8;
const MAX_HISTORY_MESSAGE_LENGTH = 800;

function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not configured!");
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

function sanitizeText(value, maxLength = MAX_MESSAGE_LENGTH) {
    return String(value || "").trim().slice(0, maxLength);
}

function sanitizeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function sanitizeBoard(board) {
    if (!Array.isArray(board) || board.length !== 9) {
        return null;
    }

    const normalized = board.map(row => {
        if (!Array.isArray(row) || row.length !== 9) {
            return null;
        }

        return row.map(cell => {
            const number = Number(cell);
            return Number.isInteger(number) && number >= 0 && number <= 9 ? number : 0;
        });
    });

    return normalized.some(row => row === null) ? null : normalized;
}

function sanitizeBooleanBoard(board) {
    if (!Array.isArray(board) || board.length !== 9) {
        return null;
    }

    const normalized = board.map(row => {
        if (!Array.isArray(row) || row.length !== 9) {
            return null;
        }

        return row.map(Boolean);
    });

    return normalized.some(row => row === null) ? null : normalized;
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

function sanitizeCandidates(candidates = []) {
    return Array.from({ length: 9 }, (_, row) => (
        Array.from({ length: 9 }, (_, col) => sanitizeCandidateCell(candidates?.[row]?.[col]))
    ));
}

function normalizeIndex(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 && number < 9 ? number : null;
}

function sanitizeSelectedCell(selectedCell) {
    const row = normalizeIndex(selectedCell?.row);
    const col = normalizeIndex(selectedCell?.col);
    return row === null || col === null ? null : { row, col };
}

function sanitizeTipCells(tipCells = []) {
    if (!Array.isArray(tipCells)) {
        return [];
    }

    const seen = new Set();
    const sanitized = [];

    tipCells.forEach(cell => {
        const row = normalizeIndex(cell?.row);
        const col = normalizeIndex(cell?.col);

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

function sanitizeHistory(history = []) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .slice(-MAX_HISTORY_MESSAGES)
        .map(message => ({
            role: message?.role === "assistant" ? "assistant" : "user",
            content: sanitizeText(message?.content, MAX_HISTORY_MESSAGE_LENGTH),
        }))
        .filter(message => message.content);
}

function sanitizeGameContext(context = {}) {
    const gameType = context.gameType === "daily" ? "daily" : "normal";
    const board = sanitizeBoard(context.board);
    const puzzle = sanitizeBoard(context.puzzle);
    const solution = sanitizeBoard(context.solution);
    const locked = sanitizeBooleanBoard(context.locked);

    if (!board || !puzzle) {
        throw new Error("Valid Sudoku board context is required!");
    }

    return {
        gameType,
        sessionId: sanitizeText(context.sessionId, 120),
        challengeId: sanitizeText(context.challengeId, 120),
        difficulty: sanitizeText(context.difficulty, 30) || "medium",
        board,
        puzzle,
        solution,
        locked,
        candidates: sanitizeCandidates(context.candidates),
        selectedCell: sanitizeSelectedCell(context.selectedCell),
        tipCells: sanitizeTipCells(context.tipCells),
        mistakeCount: Math.max(0, Math.floor(sanitizeNumber(context.mistakeCount))),
        tipsUsed: Math.max(0, Math.floor(sanitizeNumber(context.tipsUsed))),
        moveCount: Math.max(0, Math.floor(sanitizeNumber(context.moveCount))),
        status: context.status === "completed" ? "completed" : "unfinished",
        elapsedSeconds: Math.max(0, Math.floor(sanitizeNumber(context.elapsedSeconds))),
        viewOnly: !!context.viewOnly,
    };
}

async function verifyContextOwnership(userId, context) {
    if (context.gameType === "daily") {
        if (!context.challengeId) {
            return;
        }

        const ownedAttempt = await DailyChallengeAttempt.exists({
            userId,
            challengeId: context.challengeId,
        });
        const otherAttempt = await DailyChallengeAttempt.exists({
            userId: { $ne: userId },
            challengeId: context.challengeId,
        });

        if (!ownedAttempt && otherAttempt) {
            throw new Error("Daily Challenge attempt does not belong to this user!");
        }

        return;
    }

    if (!context.sessionId) {
        return;
    }

    const ownedSession = await GameSession.exists({
        userId,
        sessionId: context.sessionId,
    });
    const otherSession = await GameSession.exists({
        userId: { $ne: userId },
        sessionId: context.sessionId,
    });

    if (!ownedSession && otherSession) {
        throw new Error("Game session does not belong to this user!");
    }
}

function buildInstructions() {
    return [
        "You are AI Coach, a concise Sudoku coach inside a Sudoku web app.",
        "Use the provided current game context as the source of truth.",
        "Help the player reason through the puzzle with clear, actionable hints.",
        "Prefer teaching strategies over dumping many answers.",
        "Use row/column coordinates like R3C7 and boxes when helpful.",
        "Understand that 0 means an empty cell.",
        "Candidate notes are small pencil marks the user added.",
        "Tip cells are locked revealed hints.",
        "If the board has contradictions against the provided solution or Sudoku rules, explain them briefly.",
        "If the user asks for a direct value and the solution is available, you may provide it.",
        "If the solution is unavailable, say what can be inferred from the visible board and avoid false certainty.",
        "If the game is completed or view-only, explain retrospectively and do not suggest editing the board.",
        "Keep responses short enough for a compact chat panel: usually 2 to 6 sentences.",
        "Do not modify game state. You only explain.",
    ].join("\n");
}

function buildInput(message, gameContext, history) {
    const compactContext = JSON.stringify(gameContext);
    const historyText = history.length
        ? history.map(item => `${item.role}: ${item.content}`).join("\n")
        : "No prior chat messages.";

    return [
        {
            role: "developer",
            content: buildInstructions(),
        },
        {
            role: "user",
            content: [
                "Current Sudoku context JSON:",
                compactContext,
                "",
                "Recent chat history:",
                historyText,
                "",
                `User question: ${message}`,
            ].join("\n"),
        },
    ];
}

export const askAICoach = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid or expired user!" });
        }

        if (!user.isPro) {
            return res.status(403).json({ success: false, message: "AI Coach is available with Pro." });
        }

        const message = sanitizeText(req.body?.message);
        if (!message) {
            throw new Error("Message is required!");
        }

        const gameContext = sanitizeGameContext(req.body?.gameContext);
        const history = sanitizeHistory(req.body?.history);

        await verifyContextOwnership(req.userId, gameContext);

        const client = getOpenAIClient();
        const response = await client.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
            input: buildInput(message, gameContext, history),
            max_output_tokens: 500,
        });

        const answer = sanitizeText(response.output_text, 4000);

        if (!answer) {
            throw new Error("AI Coach did not return a response.");
        }

        res.status(200).json({
            success: true,
            message: "AI Coach response generated!",
            answer,
        });
    } catch (error) {
        const missingKey = error.message === "OPENAI_API_KEY is not configured!";
        res.status(missingKey ? 500 : 400).json({
            success: false,
            message: missingKey ? "AI Coach is not configured." : error.message,
        });
    }
};
