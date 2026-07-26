import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/authMiddleware.js';
import Document from '../models/Document.js';
import { extractText, chunkText, generateBatchEmbeddings } from '../services/ragService.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();
router.use(protect);

// Configure multer in-memory buffer storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB file size limit
});

/**
 * POST /api/documents/upload
 * Processes document uploads, extracts, chunks, generates embeddings, and saves.
 */
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { chatId } = req.body;
    const tempDir = './temp_uploads';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}_${req.file.originalname}`);
    
    try {
        // Write file buffer to temp path temporarily
        fs.writeFileSync(tempFilePath, req.file.buffer);

        // Extract raw text
        console.log(`RAG Extracting text from uploaded file: ${req.file.originalname}...`);
        const text = await extractText(tempFilePath, req.file.mimetype);

        if (!text || text.trim().length === 0) {
            throw new Error('Extracted document text was empty.');
        }

        // Chunk text
        const chunks = chunkText(text);

        // Generate embeddings if Online and key is available
        const mode = process.env.GEMINI_API_KEY ? 'online' : 'offline';
        let chunksWithEmbeddings = chunks;
        if (mode === 'online') {
            console.log('Generating Gemini embeddings for RAG...');
            chunksWithEmbeddings = await generateBatchEmbeddings(chunks);
        }

        // Save Document in DB
        const newDoc = new Document({
            userId: req.user._id,
            chatId: chatId || null,
            name: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype,
            text,
            chunks: chunksWithEmbeddings
        });

        await newDoc.save();

        res.status(201).json({
            message: 'Document uploaded and indexed successfully.',
            document: {
                _id: newDoc._id,
                name: newDoc.name,
                size: newDoc.size,
                type: newDoc.type,
                chunksCount: newDoc.chunks.length,
                createdAt: newDoc.createdAt
            }
        });
    } catch (err) {
        console.error('File index processing failed:', err);
        res.status(500).json({ error: `Failed to process document: ${err.message}` });
    } finally {
        // Always clean up temp file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
});

/**
 * GET /api/documents
 * Fetches all grounded documents uploaded globally by this user.
 */
router.get('/', async (req, res) => {
    try {
        const docs = await Document.find({ userId: req.user._id }).select('_id name size type chatId createdAt');
        res.json({ documents: docs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/documents/chat/:chatId
 * Fetches all grounded documents uploaded to this chat session.
 */
router.get('/chat/:chatId', async (req, res) => {
    try {
        const query = { userId: req.user._id };
        if (req.params.chatId === 'null' || !req.params.chatId) {
            query.chatId = null;
        } else {
            query.chatId = req.params.chatId;
        }
        
        const docs = await Document.find(query).select('_id name size type createdAt');
        res.json({ documents: docs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/documents/:docId
 * Deletes document metadata and chunks from indices.
 */
router.delete('/:docId', async (req, res) => {
    try {
        await Document.findOneAndDelete({ userId: req.user._id, _id: req.params.docId });
        res.json({ success: true, message: 'Document deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/documents/reindex/:docId
 * Rebuilds document chunks and embeddings.
 */
router.post('/reindex/:docId', async (req, res) => {
    try {
        const doc = await Document.findOne({ userId: req.user._id, _id: req.params.docId });
        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const chunks = chunkText(doc.text);
        let chunksWithEmbeddings = chunks;
        if (process.env.GEMINI_API_KEY) {
            chunksWithEmbeddings = await generateBatchEmbeddings(chunks);
        }

        doc.chunks = chunksWithEmbeddings;
        await doc.save();

        res.json({
            success: true,
            message: 'Document reindexed successfully.',
            chunksCount: doc.chunks.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/documents/chat/:chatId/retrieve
 * Local RAG retriever endpoint to retrieve matching chunks for grounding.
 */
router.get('/chat/:chatId/retrieve', async (req, res) => {
    const { query, limit = 4 } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const docQuery = { userId: req.user._id };
        if (req.params.chatId === 'null' || !req.params.chatId) {
            docQuery.chatId = null;
        } else {
            docQuery.chatId = req.params.chatId;
        }

        const documents = await Document.find(docQuery);
        if (documents.length === 0) {
            return res.json({ citations: [] });
        }

        const mode = process.env.GEMINI_API_KEY ? 'online' : 'offline';
        const matchingChunks = await retrieveRelevantChunks({
            query,
            documents,
            mode,
            limit: parseInt(limit, 10)
        });

        res.json({
            citations: matchingChunks.map(c => ({
                docName: c.docName,
                text: c.text,
                score: c.score,
                index: c.index
            }))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
