const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.cookie.split('=')[1];
        if (!token) throw new Error('Authentication failed');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {};
        req.user.role = decoded.role;
        req.user.username = decoded.username;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}

exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') throw new Error('Unauthorized');
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}

exports.isTeacher = async (req, res, next) => {
    try {
        if (req.user.role !== 'teacher') throw new Error('Unauthorized');
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}