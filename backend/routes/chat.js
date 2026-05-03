import express from 'express';

import { deleteChatHistory, deleteChatMessage, getChatHistory, sendMessage, getOllamaModelsList, updateChatMessage, getChatList, renameChat } from '../controllers/chatController.js';
import { optionalAuth, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getChatList);
router.get('/:chatId', protect, getChatHistory);
router.post('/', optionalAuth, sendMessage);
router.get('/models/list', optionalAuth, getOllamaModelsList);
router.patch('/messages/:messageId', protect, updateChatMessage);
router.delete('/messages/:messageId', protect, deleteChatMessage);
router.patch('/:chatId/title', protect, renameChat);
router.delete('/:chatId', protect, deleteChatHistory);
router.delete('/', protect, deleteChatHistory); // Delete all

export default router;
