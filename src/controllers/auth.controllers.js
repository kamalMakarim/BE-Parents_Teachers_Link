const authServices = require('../services/auth.service');

exports.login = async (req, res) => {
    try {
        const response = await authServices.login(req.body);
        res.cookie('token', response.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',   
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
