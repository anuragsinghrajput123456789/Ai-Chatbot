import Workspace from '../models/Workspace.js';
import Chat from '../models/Chat.js';

export const listWorkspaces = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const workspaces = await Workspace.find({ userId }).sort({ createdAt: 1 });
        
        // Fetch chat counts for each workspace
        const workspacesWithCount = await Promise.all(workspaces.map(async (ws) => {
            const chatCount = await Chat.countDocuments({ userId, workspaceId: ws._id, isArchived: false });
            return {
                ...ws.toObject(),
                chatCount
            };
        }));

        // Get unassigned chats count
        const unassignedCount = await Chat.countDocuments({ userId, workspaceId: null, isArchived: false });

        return res.json({
            workspaces: workspacesWithCount,
            unassignedCount
        });
    } catch (err) {
        return next(err);
    }
};

export const createWorkspace = async (req, res, next) => {
    try {
        const { name, description, color, icon } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'Workspace name is required' });

        const workspace = new Workspace({
            userId: req.user.id,
            name: name.trim(),
            description: description?.trim() || "",
            color: color || "#a855f7",
            icon: icon || "Folder"
        });

        await workspace.save();
        return res.status(201).json(workspace);
    } catch (err) {
        return next(err);
    }
};

export const updateWorkspace = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const { name, description, color, icon, isArchived } = req.body;

        const updateData = {};
        if (name !== undefined) {
            if (!name.trim()) return res.status(400).json({ error: 'Name cannot be empty' });
            updateData.name = name.trim();
        }
        if (description !== undefined) updateData.description = description.trim();
        if (color !== undefined) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;
        if (isArchived !== undefined) updateData.isArchived = isArchived;

        const workspace = await Workspace.findOneAndUpdate(
            { _id: workspaceId, userId: req.user.id },
            updateData,
            { new: true }
        );

        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
        return res.json(workspace);
    } catch (err) {
        return next(err);
    }
};

export const deleteWorkspace = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user.id;

        const workspace = await Workspace.findOneAndDelete({ _id: workspaceId, userId });
        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

        // Safely move member chats to unassigned instead of deleting them
        await Chat.updateMany(
            { userId, workspaceId },
            { $set: { workspaceId: null } }
        );

        return res.json({ message: 'Workspace deleted successfully, chats moved to inbox' });
    } catch (err) {
        return next(err);
    }
};
