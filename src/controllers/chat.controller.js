const chatService = require("../services/chat.service");

exports.createChat = async (req, res) => {
    try {
        const response = await chatService.createChat(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getChats = async (req, res) => {
    try {
        const response = await chatService.getChats(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteChat = async (req, res) => {
    try {
        const response = await chatService.deleteChat(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}