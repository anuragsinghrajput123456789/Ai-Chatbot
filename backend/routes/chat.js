import express from 'express';

import { deleteChatHistory, deleteChatMessage, getChatHistory, sendMessage, getOllamaModelsList, updateChatMessage } from '../controllers/chatController.js';
import { optionalAuth, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getChatHistory);
router.post('/', optionalAuth, sendMessage);
router.get('/models', optionalAuth, getOllamaModelsList);
router.patch('/messages/:messageId', protect, updateChatMessage);
router.delete('/messages/:messageId', protect, deleteChatMessage);
router.delete('/', optionalAuth, deleteChatHistory);

export default router;
