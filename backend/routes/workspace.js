import express from 'express';
import { listWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace } from '../controllers/workspaceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All workspace routes require authentication

router.get('/', listWorkspaces);
router.post('/', createWorkspace);
router.patch('/:workspaceId', updateWorkspace);
router.delete('/:workspaceId', deleteWorkspace);

export default router;
