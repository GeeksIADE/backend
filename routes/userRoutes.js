const router = require('express').Router();
const User = require('../models/userModels');
const { validateUser, validateUserId } = require('../validation/userValidation');
const CustomError = require('../exceptions/customError');
const errorCodes = require('../exceptions/errorCodes');
const { authMiddleware } = require('../middleware/authMiddleware');
const { adminAuthMiddleware } = require('../middleware/adminAuthMiddleware');
const { userOrAdminAuthMiddleware } = require('../middleware/userOrAdminAuthMiddleware');
const bcrypt = require('bcrypt');
const ngeohash = require('ngeohash');

router.get('', [authMiddleware, adminAuthMiddleware], (_, res, next) => {
    User.getAll().then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E002.code, errorCodes.E002.message));
    });
});

router.get('/me', [authMiddleware], async (req, res) => {
    try {
        const userResponse = await User.getById(req.user.id);
        if (userResponse.status !== 200) {
            return res.status(userResponse.status).json(userResponse.result);
        }

        const user = userResponse.result;
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/nearby', [authMiddleware], async (req, res) => {
    try {
        const geohash = await User.getUserGeohash(req.user.id);
        console.log("his");
        if (!geohash) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Decode geohash to latitude and longitude
        const { latitude, longitude } = ngeohash.decode(geohash);
        console.log(latitude);
        console.log(longitude);

        // Find nearby users
        // TODO Radius to come from user settings and dynamically change.
        const nearbyUsers = await User.getNearbyUsersByGeohash(latitude, longitude, 10);
        res.status(200).json(nearbyUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/nearby/:latitude/:longitude', [authMiddleware], async (req, res, next) => {
    console.log("hi");
    const { latitude, longitude } = req.params;

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        return next(new CustomError(400, errorCodes.E004.code, 'Invalid latitude or longitude', {}));
    }

    try {
        const searchRadius = 1;
        const nearbyGeohashes = ngeohash.neighbors(latitude, longitude, { radius: searchRadius });
        console.log("hiss");
        // Get users with nearby geohashes
        const nearbyUsers = await User.getUsersByGeohashes(nearbyGeohashes);
        res.status(200).json(nearbyUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', [userOrAdminAuthMiddleware], (req, res, next) => {
    console.log("Params:" + req.params);
    const { error } = validateUserId(req.params);
    if (error) {
        return next(new CustomError(400, errorCodes.E004.code, errorCodes.E004.message, error.details));
    }

    User.getById(req.params.id).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E005.code, errorCodes.E005.message));
    });
});

router.put('/:id', [userOrAdminAuthMiddleware], (req, res, next) => {
    const { error } = validateUserId(req.params);
    if (error) {
        return next(new CustomError(400, errorCodes.E004.code, errorCodes.E004.message, error.details));
    }

    const { error: validationError } = validateUser(req.body);
    if (validationError) {
        console.log(validationError);
        return next(new CustomError(400, errorCodes.E001.code, errorCodes.E001.message, validationError.details));
    }

    User.updateById(req.params.id, req.body).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E006.code, errorCodes.E006.message));
    });
});

router.delete('/:id', [userOrAdminAuthMiddleware], (req, res, next) => {
    const { error } = validateUserId(req.params);
    if (error) {
        return next(new CustomError(400, errorCodes.E004.code, errorCodes.E004.message, error.details));
    }

    User.deleteById(req.params.id).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        next(new CustomError(500, errorCodes.E007.code, errorCodes.E007.message));
    });
});

router.post('/register', async (req, res, next) => {
    const saltRounds = 10;
    const { error } = validateUser(req.body);
    if (error) {
        return next(new CustomError(400, errorCodes.E001.code, errorCodes.E001.message, error.details));
    }

    const user = new User();
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.latitude = req.body.latitude;
    user.longitude = req.body.longitude;
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = req.body.password;
    user.isEmailVerified = false;
    user.user_role = 3;
    user.isActive = true;
    user.userResetCodeAt = Date.now();

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;

        // Save the user to the database
        const { status, result } = await User.save(user);
        if (user.latitude && user.longitude) {
            User.storeUserLocation(user.username, user.latitude, user.longitude);
            console.log("Done");
        }
        if (status === 200) {
            res.status(200).json({ msg: "Inserted a new user", id: result.id });
        } else {
            next(new CustomError(status, errorCodes.E003.code, result));
        }
    } catch (err) {
        next(new CustomError(500, errorCodes.E003.code, err));
    }
});

module.exports = router;