import express from 'express';

import { login, register, updateAvatar } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/profile/avatar', protect, updateAvatar);

export default router;
