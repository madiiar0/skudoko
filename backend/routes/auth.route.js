import express from 'express';
import {
    activatePro,
    cancelPro,
    checkAuth,
    login,
    logout,
    register,
} from "../controllers/auth.controllers.js";
import {verifyToken} from "../middleware/verifyToken.js";

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth);
router.get('/me', verifyToken, checkAuth);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.patch('/pro/activate', verifyToken, activatePro);
router.patch('/pro/cancel', verifyToken, cancelPro);

export default router;
