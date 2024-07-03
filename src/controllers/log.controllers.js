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

exports.getLogOfStudent = async (req, res) => {
    const student  = req.body;
    try {
        if (!student) {
            throw new Error("Please provide student");
        }
        const response = await logServiece.getLogOfStudent(req);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}
