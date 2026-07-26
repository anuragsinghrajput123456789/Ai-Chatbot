import mongoose from 'mongoose';

const WorkspaceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    color: { type: String, default: "#a855f7" },
    icon: { type: String, default: "Folder" },
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Workspace', WorkspaceSchema);
