const userServices = require('../services/user.service');
exports.addUser = async (req, res) => {
    try {
        const response = await userServices.addUser(req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}