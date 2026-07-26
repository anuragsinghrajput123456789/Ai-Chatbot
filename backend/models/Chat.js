import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    role: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },
    title: { type: String, default: 'New Chat' },
    messages: [MessageSchema],
    isArchived: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

ChatSchema.index({ userId: 1, updatedAt: -1 });

ChatSchema.index({
    title: 'text',
    'messages.text': 'text'
}, {
    weights: {
        title: 10,
        'messages.text': 2
    },
    name: 'ChatTextSearchIndex'
});

export default mongoose.model('Chat', ChatSchema);