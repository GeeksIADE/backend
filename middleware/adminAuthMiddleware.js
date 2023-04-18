// adminAuthMiddleware.js
const CustomError = require('../exceptions/customError');
const errorCodes = require('../exceptions/errorCodes');

function adminAuthMiddleware(req, res, next) {
    // Check if user is authenticated
    if (!req.user) {
        return next(new CustomError(401, errorCodes.E007, 'Access Token Required'));
    }

    // Check if user is an admin
    if (req.user.role !== 1) {
        console.log("Role: " + req.user.username);
        return next(new CustomError(403, errorCodes.E008, "Admin permission required"));
    }

    next();
}

module.exports = { adminAuthMiddleware };
