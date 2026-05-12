import express from 'express';

import {
    completeChallengeAttempt,
    getChallengeLeaderboard,
    getCurrentChallenge,
    startChallenge,
    updateChallengeAttempt,
} from "../controllers/dailyChallenge.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/current', verifyToken, getCurrentChallenge);
router.post('/current/start', verifyToken, startChallenge);
router.put('/current/attempt', verifyToken, updateChallengeAttempt);
router.patch('/current/complete', verifyToken, completeChallengeAttempt);
router.get('/current/leaderboard', verifyToken, getChallengeLeaderboard);

export default router;
