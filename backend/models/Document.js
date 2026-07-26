import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    text: { type: String, required: true },
    chunks: [{
        text: { type: String, required: true },
        index: { type: Number, required: true },
        embedding: { type: [Number], default: [] }
    }]
}, { timestamps: true });

// Create indexes for fast querying
documentSchema.index({ userId: 1 });
documentSchema.index({ chatId: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
