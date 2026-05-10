import GameSession from "../models/gameSession.model.js";

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
        id: data._id,
    };
}

async function saveSessionForUser(userId, sessionId, body) {
    const payload = buildSessionPayload(body, sessionId);
    const existingSession = await GameSession.findOne({ userId, sessionId });

    if (existingSession) {
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
