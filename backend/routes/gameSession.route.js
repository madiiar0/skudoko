import express from 'express';

import {
    completeSession,
    createSession,
    getSession,
    getSessions,
    updateSession,
} from "../controllers/gameSession.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/', verifyToken, getSessions);
router.get('/:sessionId', verifyToken, getSession);

router.post('/', verifyToken, createSession);
router.put('/:sessionId', verifyToken, updateSession);
router.patch('/:sessionId/complete', verifyToken, completeSession);

export default router;
