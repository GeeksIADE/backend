module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
        user_first_name: {
            type: Sequelize.STRING
        },
        user_last_name: {
            type: Sequelize.STRING
        },
        user_location: {
            type: Sequelize.STRING
        },
        user_name: {
            type: Sequelize.STRING
        },
        user_email: {
            type: Sequelize.STRING
        },
        user_password: {
            type: Sequelize.STRING
        },
        user_email_verified: {
            type: Sequelize.BOOLEAN
        },
        user_role: {
            type: Sequelize.STRING
        },
        user_active: {
            type: Sequelize.BOOLEAN
        },
        user_reset_code: {
            type: Sequelize.STRING
        },
        user_register_code: {
            type: Sequelize.STRING
        },
        user_reset_code_at: {
            type: Sequelize.STRING
        }
    });

    return User;
};