const authServices = require('../services/auth.service');

exports.login = async (req, res) => {
    try {
        const response = await authServices.login(req.body);
        res.cookie('token', response.token, { httpOnly: true, maxAge: 3600000 });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}