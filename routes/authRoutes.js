const router = require('express').Router();
const User = require('../models/userModels');

router.post('/login', (req, res) => {
    const userpass = req.body.userpass;
});



module.exports = router;