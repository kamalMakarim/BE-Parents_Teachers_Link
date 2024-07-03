const userServices = require('../services/user.service');
exports.addUser = async (req, res) => {
    try {
        const response = await userServices.addUser(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updatePasswordByUser = async (req, res) => {
    try {
        console.log(req.body);
        const response = await userServices.updatePasswordByUser(req);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const response = await userServices.deleteUser(req.params.username);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateDisplayName = async (req, res) => {
    try {
        const response = await userServices.updateDisplayName(req, req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updatePasswordByAdmin = async (req, res) => {
    try {
        const response = await userServices.updatePasswordByAdmin(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}