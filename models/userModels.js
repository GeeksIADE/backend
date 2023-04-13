const pool = require("../config/db");

function userFromDB(user) {
    return new User(user.user_id, user.user_first_name,
        user.user_last_name, user.user_location, user.user_name,
        user.user_email, user.user_password, user.user_email_verified,
        user.user_role, user.user_active, user.user_reset_code, user.user_register_code,
        user.user_reset_code_at, user.created_at, user.updated_at);
}
class User {
    constructor(user_first_name = null, user_name = null, user_email = null,
        user_password = null, user_location = null) {
        this.user_first_name = user_first_name;
        this.user_name = user_name;
        this.user_email = user_email;
        this.user_password = user_password;
        this.user_location = user_location;
        this.user_active = true;
        this.user_email_verified = false;
        this.user_reset_code_at = Date.now();
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }

    static async getAll() {
        try {
            let result = [];
            let dbResult = await pool.query("Select * from users");
            for (let dbUser of dbResult.rows) {
                result.push(userFromDB(dbUser));
            }
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            let dbResult =
                await pool.query("Select * from users where user_id=$1", [id]);
            let dbUsers = dbResult.rows;
            if (!dbUsers.length)
                return { status: 404, result: { msg: "No user found with that id" } };
            let dbUser = dbUsers[0];
            let result = userFromDB(dbUser);
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async save(newUser) {
        try {
            let result =
                await pool.query(`insert into users (user_first_name, user_last_name, user_location, 
                    user_name, user_email, user_password, user_role)
                values ($1,$2,$3,$4,$5,$6,$7) RETURNING user_id`, [newUser.user_first_name, newUser.user_last_name,
                newUser.user_location, newUser.user_name, newUser.user_email, newUser.user_password, newUser.user_role]);
            return { status: 200, result: { msg: "Inserted a new user", id: result.rows[0].user_id } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }


    static async filterByRole(roleName) {
        try {
            let result = [];
            let dbResults =
                await pool.query("Select * from users where user_role=$1", [roleName]);
            let dbUsers = dbResults.rows;
            for (let dbUser of dbUsers) {
                result.push(userFromDB(dbUser));
            }
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async filterByPartialNameOrEmail(name) {
        try {
            let result = [];
            let dbResults =
                await pool.query(`Select * from users 
                where user_first_name ILIKE $1 or user_last_name ILIKE $1
                or user_name ILIKE $1 or user_email ILIKE $1`,
                    ['%' + name + '%']);
            let dbUsers = dbResults.rows;
            for (let dbUser of dbUsers) {
                result.push(userFromDB(dbUser));
            }
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }


}


module.exports = User;