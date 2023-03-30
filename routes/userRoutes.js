const router = require('express').Router();
const User = require('../models/userModels');

router.get('', (_, res) => {
    User.getAll().then(output => {
        res.json(output.result).status(output.status);
    });
});

checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Username
    User.findOne({
        where: {
            username: req.body.username
        }
    }).then(user => {
        if (user) {
            res.status(400).send({
                message: "Failed! Username is already in use!"
            });
            return;
        }

        // Email
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then(user => {
            if (user) {
                res.status(400).send({
                    message: "Failed! Email is already in use!"
                });
                return;
            }

            next();
        });
    });
};

router.post('/register', (req, res) => {

    let user = new User();
    user.user_email_verified = true;
    user.user_role = 'user';
    user.user_email_verified = true;
    user.user_active = true;
    user.user_reset_code_at = true;
    user = { ...req.body };
    User.save(user).then(output => {
        let length = output.result.length;
        let name = output.result.name;
        let code = output.result.code;
        let detail = output.result.detail;
        if (name == "error") {
            res.status(output.status).json({ length, status: name, code, msg: detail, payload: [] });
        } else {
            res.status(200).json(output.result);
        }

    });
});

module.exports = router;