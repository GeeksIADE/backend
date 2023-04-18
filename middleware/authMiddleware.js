const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Access Token' });
        }

        // Check if the account is deleted
        try {
            const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user.id]);
            if (result.rows.length === 0) {
                return res.status(403).json({ message: 'Invalid Access Token' });
            }
            const dbUser = result.rows[0];

            if (dbUser.account_deleted_at) {
                return res.status(403).json({ message: 'This account has been deleted' });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error('Error executing query', err);
            res.status(500).json({ 'msg': 'Unknown error communicating with database', 'status': 'error' });
        }
    });
}

module.exports = { authMiddleware };
