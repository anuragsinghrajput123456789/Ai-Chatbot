import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

// Standard English stopwords for the TF-IDF sparse retriever
const STOPWORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here',
    'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'im', 'ive', 'if', 'in', 'into',
    'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
    'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the',
    'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre',
    'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed',
    'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who',
    'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
    'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Clean and split text into tokens
 */
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

/**
 * Text extraction service supporting PDF, DOCX, TXT, MD, CSV, and Code files
 */
export async function extractText(filePath, mimeType) {
    if (!fs.existsSync(filePath)) {
        throw new Error('File does not exist');
    }

    if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(filePath);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        return data.text || '';
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filePath.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || '';
    }

    // Default text reader for txt, md, csv, code files
    return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Chunks text into overlapping windows
 */
export function chunkText(text, chunkSize = 800, overlap = 200) {
    if (!text?.trim()) return [];
    
    // Normalize spacing
    const normalized = text.replace(/\s+/g, ' ').trim();
    const chunks = [];
    let start = 0;
    let index = 0;

    while (start < normalized.length) {
        const end = Math.min(start + chunkSize, normalized.length);
        let chunkText = normalized.slice(start, end);

        // Try to align with paragraph or sentence boundary if not at the very end
        if (end < normalized.length) {
            const lastPeriod = chunkText.lastIndexOf('. ');
            const lastSpace = chunkText.lastIndexOf(' ');
            if (lastPeriod > chunkSize * 0.6) {
                chunkText = chunkText.slice(0, lastPeriod + 1);
            } else if (lastSpace > chunkSize * 0.8) {
                chunkText = chunkText.slice(0, lastSpace);
            }
        }

        if (chunkText.trim().length > 10) {
            chunks.push({
                text: chunkText.trim(),
                index
            });
            index++;
        }

        start += chunkText.length - overlap;
        if (chunkText.length <= overlap) {
            start = end; // Prevent infinite loops
        }
    }
    return chunks;
}

/**
 * Google Gemini Dense Embedding Service (Online RAG)
 */
export async function generateGeminiEmbedding(text) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured on this server.');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'models/text-embedding-004',
            content: {
                parts: [{ text }]
            }
        }),
        signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || `Embedding failed with status ${response.status}`);
    }

    return data.embedding?.values || [];
}

/**
 * Batch embedding generator for indexing chunks quickly
 */
export async function generateBatchEmbeddings(chunks) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return chunks;

    const indexedChunks = [...chunks];
    const batchSize = 20;

    for (let i = 0; i < indexedChunks.length; i += batchSize) {
        const batch = indexedChunks.slice(i, i + batchSize);
        const requests = batch.map(chunk => ({
            model: 'models/text-embedding-004',
            content: {
                parts: [{ text: chunk.text }]
            }
        }));

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests }),
                signal: AbortSignal.timeout(20000)
            });

            const data = await response.json();
            if (response.ok && data.embeddings) {
                data.embeddings.forEach((emb, index) => {
                    batch[index].embedding = emb.values || [];
                });
            }
        } catch (err) {
            console.error('Batch embedding indexing failed for window range:', i, err.message);
            // Fall back to single indexing
            for (const chunk of batch) {
                try {
                    chunk.embedding = await generateGeminiEmbedding(chunk.text);
                } catch (e) {
                    chunk.embedding = [];
                }
            }
        }
    }

    return indexedChunks;
}

/**
 * Computes cosine similarity between two normalized vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Retrieve relevant chunks using Cosine similarity or TF-IDF sparse matching
 */
export async function retrieveRelevantChunks({ query, documents, mode, limit = 4 }) {
    if (!documents || documents.length === 0) return [];

    // Gather all chunks from target files
    const allChunks = [];
    documents.forEach(doc => {
        doc.chunks.forEach(c => {
            allChunks.push({
                ...c,
                docName: doc.name,
                docId: doc._id
            });
        });
    });

    if (allChunks.length === 0) return [];

    if (mode === 'online' && process.env.GEMINI_API_KEY) {
        try {
            console.log('RAG dense retrieval: Computing query embeddings...');
            const queryVec = await generateGeminiEmbedding(query);
            
            const scored = allChunks.map(chunk => {
                const similarity = cosineSimilarity(queryVec, chunk.embedding);
                return {
                    ...chunk,
                    score: similarity
                };
            });

            // Return top matches sorted by similarity score
            return scored
                .filter(c => c.score > 0.15)
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
        } catch (err) {
            console.warn('RAG dense vector retrieval failed, falling back to local TF-IDF matcher...', err.message);
        }
    }

    // Sparse TF-IDF retrieval (local offline matches / dense fallback)
    console.log('RAG sparse retrieval: Executing BM25/TF-IDF token matching...');
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
        // Return first chunks if query tokens resolve empty
        return allChunks.slice(0, limit).map(c => ({ ...c, score: 0.5 }));
    }

    // Calculate document frequency across chunks
    const chunkTokens = allChunks.map(c => tokenize(c.text));
    const termDF = {};
    chunkTokens.forEach(tokens => {
        const unique = new Set(tokens);
        unique.forEach(t => {
            termDF[t] = (termDF[t] || 0) + 1;
        });
    });

    const scored = allChunks.map((chunk, idx) => {
        const tokens = chunkTokens[idx];
        const tokenCounts = {};
        tokens.forEach(t => {
            tokenCounts[t] = (tokenCounts[t] || 0) + 1;
        });

        let score = 0;
        queryTokens.forEach(qt => {
            if (tokenCounts[qt]) {
                const tf = tokenCounts[qt] / tokens.length;
                const df = termDF[qt] || 0;
                const idf = Math.log(1 + (allChunks.length / (df || 1)));
                score += tf * idf;
            }
        });

        return {
            ...chunk,
            score: score * 10 // scale to make it comparable
        };
    });

    return scored
        .filter(c => c.score > 0.02)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
