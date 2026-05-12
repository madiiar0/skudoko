import express from 'express';

import { askAICoach } from "../controllers/aiCoach.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.post('/ask', verifyToken, askAICoach);

export default router;
