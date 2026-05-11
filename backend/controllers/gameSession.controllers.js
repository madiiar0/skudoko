import GameSession from "../models/gameSession.model.js";

const INITIAL_TIPS_REMAINING = 3;

function createEmptyCandidates() {
    return Array.from({ length: 9 }, () => (
        Array.from({ length: 9 }, () => [])
    ));
}

function isValidMatrix(matrix, validator) {
    return Array.isArray(matrix)
        && matrix.length === 9
        && matrix.every(row => Array.isArray(row) && row.length === 9 && row.every(validator));
}

function isValidNumberCell(value) {
    return Number.isInteger(value) && value >= 0 && value <= 9;
}

function isValidBooleanCell(value) {
    return typeof value === 'boolean';
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

function sanitizeSessionName(name) {
    const trimmedName = String(name || "").trim();
    return trimmedName ? trimmedName.slice(0, 80) : "Untitled";
}

function sanitizeDifficulty(difficulty) {
    const normalizedDifficulty = String(difficulty || "").trim().toLowerCase();
    return ['easy', 'medium', 'hard', 'extreme'].includes(normalizedDifficulty)
        ? normalizedDifficulty
        : 'medium';
}

function sanitizeMistakeCount(mistakeCount) {
    return Math.max(0, Math.floor(Number(mistakeCount) || 0));
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

function sanitizeTipsRemaining(tipsRemaining) {
    if (tipsRemaining === undefined || tipsRemaining === null || tipsRemaining === '') {
        return INITIAL_TIPS_REMAINING;
    }

    return Math.max(0, Math.floor(Number(tipsRemaining) || 0));
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

function buildSessionPayload(body, sessionId) {
    const {
        puzzle,
        board,
        locked,
        solution,
        history = [],
        status = 'unfinished',
        elapsedSeconds = 0,
        completedAt,
        clientUpdatedAt,
        name,
        difficulty,
        mistakeCount,
        tipCells,
        tipsRemaining,
        candidates,
    } = body || {};

    if (!sessionId) {
        throw new Error("Session ID is required!");
    }

    if (!isValidMatrix(puzzle, isValidNumberCell)) {
        throw new Error("Puzzle board is invalid!");
    }

    if (!isValidMatrix(board, isValidNumberCell)) {
        throw new Error("Current board is invalid!");
    }

    if (!isValidMatrix(locked, isValidBooleanCell)) {
        throw new Error("Locked board is invalid!");
    }

    if (!isValidMatrix(solution, isValidNumberCell)) {
        throw new Error("Solution board is invalid!");
    }

    if (!['unfinished', 'completed'].includes(status)) {
        throw new Error("Session status is invalid!");
    }

    return {
        sessionId,
        ...(name !== undefined ? { name: sanitizeSessionName(name) } : {}),
        ...(difficulty !== undefined ? { difficulty: sanitizeDifficulty(difficulty) } : {}),
        ...(mistakeCount !== undefined ? { mistakeCount: sanitizeMistakeCount(mistakeCount) } : {}),
        ...(tipCells !== undefined ? { tipCells: sanitizeTipCells(tipCells) } : {}),
        ...(tipsRemaining !== undefined ? { tipsRemaining: sanitizeTipsRemaining(tipsRemaining) } : {}),
        ...(candidates !== undefined ? { candidates: sanitizeCandidates(candidates, board) } : {}),
        puzzle,
        board,
        locked,
        solution,
        history: sanitizeHistory(history),
        status,
        elapsedSeconds: Math.max(0, Number(elapsedSeconds) || 0),
        completedAt: status === 'completed' ? (completedAt ? new Date(completedAt) : new Date()) : undefined,
        clientUpdatedAt: clientUpdatedAt ? new Date(clientUpdatedAt) : new Date(),
    };
}

function serializeSession(session) {
    const data = session.toObject();
    return {
        ...data,
        name: sanitizeSessionName(data.name),
        difficulty: sanitizeDifficulty(data.difficulty),
        mistakeCount: sanitizeMistakeCount(data.mistakeCount),
        tipCells: sanitizeTipCells(data.tipCells),
        tipsRemaining: sanitizeTipsRemaining(data.tipsRemaining),
        candidates: sanitizeCandidates(data.candidates, data.board),
        id: data._id,
    };
}

async function saveSessionForUser(userId, sessionId, body) {
    const payload = buildSessionPayload(body, sessionId);
    const existingSession = await GameSession.findOne({ userId, sessionId });

    if (existingSession) {
        if (payload.difficulty === undefined && !existingSession.difficulty) {
            payload.difficulty = 'medium';
        }

        if (payload.mistakeCount === undefined && existingSession.mistakeCount === undefined) {
            payload.mistakeCount = 0;
        }

        if (payload.tipCells === undefined && existingSession.tipCells === undefined) {
            payload.tipCells = [];
        }

        if (payload.tipsRemaining === undefined && existingSession.tipsRemaining === undefined) {
            payload.tipsRemaining = INITIAL_TIPS_REMAINING;
        }

        if (payload.candidates === undefined && existingSession.candidates === undefined) {
            payload.candidates = createEmptyCandidates();
        }

        const incomingTime = new Date(payload.clientUpdatedAt).getTime();
        const existingTime = existingSession.clientUpdatedAt ? new Date(existingSession.clientUpdatedAt).getTime() : 0;

        if (existingTime > incomingTime) {
            return existingSession;
        }

        Object.assign(existingSession, payload);
        return existingSession.save();
    }

    const session = new GameSession({
        userId,
        difficulty: payload.difficulty || 'medium',
        mistakeCount: payload.mistakeCount || 0,
        tipCells: payload.tipCells || [],
        tipsRemaining: payload.tipsRemaining ?? INITIAL_TIPS_REMAINING,
        candidates: payload.candidates || createEmptyCandidates(),
        ...payload,
    });

    return session.save();
}

export const getSessions = async (req, res) => {
    try{
        const sessions = await GameSession.find({ userId: req.userId }).sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            sessions: sessions.map(serializeSession),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getSession = async (req, res) => {
    try{
        const { sessionId } = req.params;
        const session = await GameSession.findOne({ userId: req.userId, sessionId });

        if(!session){
            return res.status(404).json({ success: false, message: "Session not found!" });
        }

        res.status(200).json({
            success: true,
            session: serializeSession(session),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const createSession = async (req, res) => {
    try{
        const { sessionId } = req.body || {};
        const session = await saveSessionForUser(req.userId, sessionId, req.body);

        res.status(201).json({
            success: true,
            message: "Session saved successfully!",
            session: serializeSession(session),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateSession = async (req, res) => {
    try{
        const { sessionId } = req.params;
        const session = await saveSessionForUser(req.userId, sessionId, {
            ...req.body,
            sessionId,
        });

        res.status(200).json({
            success: true,
            message: "Session saved successfully!",
            session: serializeSession(session),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const completeSession = async (req, res) => {
    try{
        const { sessionId } = req.params;
        const session = await saveSessionForUser(req.userId, sessionId, {
            ...req.body,
            sessionId,
            status: 'completed',
            completedAt: req.body?.completedAt || new Date(),
        });

        res.status(200).json({
            success: true,
            message: "Session completed successfully!",
            session: serializeSession(session),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const renameSession = async (req, res) => {
    try{
        const { sessionId } = req.params;
        const session = await GameSession.findOne({ userId: req.userId, sessionId });

        if(!session){
            return res.status(404).json({ success: false, message: "Session not found!" });
        }

        session.name = sanitizeSessionName(req.body?.name);
        await session.save();

        res.status(200).json({
            success: true,
            message: "Session renamed successfully!",
            session: serializeSession(session),
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const deleteSession = async (req, res) => {
    try{
        const { sessionId } = req.params;
        const session = await GameSession.findOneAndDelete({ userId: req.userId, sessionId });

        if(!session){
            return res.status(404).json({ success: false, message: "Session not found!" });
        }

        res.status(200).json({
            success: true,
            message: "Session deleted successfully!",
            sessionId,
        });
    } catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}
