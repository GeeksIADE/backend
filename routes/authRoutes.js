const router = require('express').Router();
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    pool.query('SELECT * FROM users WHERE user_name=$1', [username], async (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            res.status(500).json({ 'msg': 'Unknown error communicating with database', 'status': 'error' });
        } else if (result.rows.length === 0) {
            res.status(401).json({ 'msg': 'Invalid username or password', 'status': 'error' });
        } else {
            const user = result.rows[0];

            // Check if the account is deleted
            if (user.account_deleted_at) {
                return res.status(403).json({ message: 'This account has been deleted' });
            }

            // Compare the hashed password with the user input password
            bcrypt.compare(password, user.user_password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords', err);
                    res.status(500).json({ 'msg': 'Unknown error', 'status': 'error' });
                } else if (!result) {
                    res.status(401).json({ 'msg': 'Invalid username or password', 'status': 'error' });
                } else {
                    // If the passwords match, generate a JWT token
                    const token = jwt.sign({ id: user.user_id, role: user.user_role }, jwtSecret, { expiresIn: '1h' });
                    res.json({ token });
                }
            });
        }
    });
});

module.exports = router;