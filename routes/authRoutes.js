const router = require('express').Router();

// const User = require('../models/userModels');

const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Query the database for the user with the given username
    pool.query('SELECT * FROM users WHERE user_name=$1', [username], (err, result) => {
        if (err) {
            console.error('Error executing query', err);
            res.status(500).json({ 'msg': 'Unknown error communicating with database', 'status': 'error' });
        } else if (result.rows.length === 0) {
            // If no user is found with the given username, send a 401 Unauthorized response
            res.status(401).json({ 'msg': 'Invalid username or password', 'status': 'error' });
        } else {
            const user = result.rows[0];

            // Compare the hashed password with the user input password
            bcrypt.compare(password, user.user_password, (err, result) => {
                if (err) {
                    console.error('Error comparing passwords', err);
                    res.status(500).json({ 'msg': 'Unknown error', 'status': 'error' });
                } else if (!result) {
                    // If the passwords don't match, send a 401 Unauthorized response
                    res.status(401).json({ 'msg': 'Invalid username or password', 'status': 'error' });
                } else {
                    // If the passwords match, generate a JWT token
                    const token = jwt.sign({ id: user.user_id }, jwtSecret, { expiresIn: '1h' });
                    res.json({ token });
                }
            });
        }
    });
});



module.exports = router;


router.post('/register', (req, res) => {
    const { first_name, last_name, username, user_email, user_password } = req.body;
    const bcrypt = require('bcrypt');

    // This is the number of rounds of hashing to apply
    // Higher numbers result in a slower but more secure hash
    const saltRounds = 10;

    console.log(user_password);
    // Hash the password
    bcrypt.hash(user_password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing password', err);
            res.status(500).send('An error occurred while hashing the password');
        } else {
            // Store the hashed password in the database
            const pool = require('../config/db');
            // insert into users (user_first_name, user_last_name, user_name, user_email, 
            //    user_password, user_role) values ('Francisco', 'Traquete', 'frant7', 'francisco@gmail.com', 'test123', 3);
            pool.query('INSERT INTO users (user_first_name, user_last_name, user_name, user_email, user_password, user_role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [first_name, last_name, username, user_email, hash, 3], (err, result) => {
                if (err) {
                    console.error('Error executing query', err);
                    res.status(500).send('An error occurred while executing the query');
                } else {
                    const user = result.rows[0];
                    res.send(user);
                }
            });
        }
    });


});
