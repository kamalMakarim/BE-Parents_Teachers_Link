const logServiece = require('../services/log.service');
exports.createLog = async (req, res) => {
    try {
        const response = await logServiece.createLog(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteLog = async (req, res) => {
    try {
        const response = await logServiece.deleteLog(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateLog = async (req, res) => {
    try {
        const response = await logServiece.updateLog(req, res);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}