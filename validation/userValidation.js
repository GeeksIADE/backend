const Joi = require('joi');

const userValidationSchema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    location: Joi.string().min(2).max(100).optional(),
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});
const userIdValidationSchema = Joi.object({
    id: Joi.number().min(1).required()
});

function validateUser(user) {
    return userValidationSchema.validate(user);
}

function validateUserId(user) {
    return userIdValidationSchema.validate(user);
}

module.exports = {
    validateUser,
    validateUserId
};
