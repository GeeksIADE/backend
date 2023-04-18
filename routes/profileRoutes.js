const router = require('express').Router();
const Profile = require('../models/profileModels');
const CustomError = require('../exceptions/customError');
const errorCodes = require('../exceptions/errorCodes');
const { authMiddleware } = require('../middleware/authMiddleware');
const { userOrAdminAuthMiddleware } = require('../middleware/userOrAdminAuthMiddleware');
const { adminAuthMiddleware } = require('../middleware/adminAuthMiddleware');

router.get('', [authMiddleware, adminAuthMiddleware], (_, res, next) => {
    Profile.getAll().then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E002, err));
    });
});

router.get('/:id', [userOrAdminAuthMiddleware], (req, res, next) => {
    //todo validation
    Profile.getById(req.params.id).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E005, err));
    });
});

router.put('/:id', [userOrAdminAuthMiddleware], (req, res, next) => {
    //todo validation

    Profile.updateById(req.params.id, req.body).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E006, err));
    });
});

module.exports = router;
