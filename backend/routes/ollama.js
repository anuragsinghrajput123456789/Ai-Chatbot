import express from 'express';

import { getModels, getStatus } from '../controllers/ollamaController.js';

const router = express.Router();

router.get('/status', getStatus);
router.get('/models', getModels);

export default router;
