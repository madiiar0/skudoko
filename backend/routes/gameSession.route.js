import express from 'express';

import {
    completeSession,
    createSession,
    deleteSession,
    getSession,
    getSessions,
    renameSession,
    updateSession,
} from "../controllers/gameSession.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/', verifyToken, getSessions);
router.get('/:sessionId', verifyToken, getSession);

router.post('/', verifyToken, createSession);
router.put('/:sessionId', verifyToken, updateSession);
router.patch('/:sessionId/complete', verifyToken, completeSession);
router.patch('/:sessionId/name', verifyToken, renameSession);
router.delete('/:sessionId', verifyToken, deleteSession);

export default router;
