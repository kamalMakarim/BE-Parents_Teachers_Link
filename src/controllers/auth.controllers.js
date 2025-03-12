const authServices = require('../services/auth.service');

exports.login = async (req, res) => {
    try {
        const response = await authServices.login(req.body);
        res.cookie('token', response.token, {
            httpOnly: process.env.NODE_ENV === 'production',
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? '.sekolahbinekas.com' : 'localhost',
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
