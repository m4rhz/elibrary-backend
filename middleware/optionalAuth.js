const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
        }
    } catch (error) {

    }
    next();
};

module.exports = optionalAuth;
