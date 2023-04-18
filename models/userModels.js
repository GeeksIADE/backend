const pool = require("../config/db");
const Profile = require("./profileModels");

function userFromDB(user) {
    return new User(user.user_id, user.user_first_name,
        user.user_last_name, user.user_location, user.user_name,
        user.user_email, user.user_password, user.user_email_verified,
        user.user_role, user.user_active, user.user_reset_code, user.user_register_code,
        user.user_reset_code_at, user.created_at, user.updated_at, user.games);
}

class User {
    constructor(id = null, first_name = null, last_name = null, location = null, username = null, email = null, password = null, isEmailVerified = null, user_role = null, user_active = null, user_reset_code = null, user_register_code = null, user_reset_code_at = null, created_at = null, updated_at = null, games = []) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.location = location;
        this.isActive = user_active;
        this.isEmailVerified = isEmailVerified;
        this.userResetCodeAt = user_reset_code_at;
        this.userRegisterCode = user_register_code;
        this.userResetCode = user_reset_code;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.games = games;
    }


    static async getAll() {
        try {
            let result = [];
            let dbResult = await pool.query("Select * from users");
            for (let dbUser of dbResult.rows) {
                console.log(dbUser);
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
            let dbResult = await pool.query(
                `SELECT users.*, json_agg(json_build_object('game_id', games.game_id, 'game_name', games.game_name, 'created_at', games.created_at, 'updated_at', games.updated_at)) AS games
                FROM users
                LEFT JOIN users_games ON users.user_id = users_games.users_id
                LEFT JOIN games ON users_games.games_id = games.game_id
                WHERE users.user_id = $1
                GROUP BY users.user_id`,
                [id]
            );
            let dbUsers = dbResult.rows;
            if (!dbUsers.length)
                return { status: 404, result: { msg: "No user found with that id" } };
            let dbUser = dbUsers[0];
            dbUser.games = dbUser.games === null ? [] : dbUser.games;

            let result = userFromDB(dbUser);
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }


    static async updateById(id, updatedUserData) {
        try {
            const { first_name, last_name, location, username, email, password } = updatedUserData;
            const result = await pool.query(
                `UPDATE users SET user_first_name = $1, user_last_name = $2, user_location = $3,
            user_name = $4, user_email = $5, user_password = $6, updated_at = NOW()
            WHERE user_id = $7 RETURNING *`,
                [first_name, last_name, location, username, email, password, id]
            );

            if (result.rowCount === 0) {
                return { status: 404, result: { msg: "No user found with that id" } };
            }

            return { status: 200, result: userFromDB(result.rows[0]) };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async deleteById(id) {
        try {
            const result = await pool.query("UPDATE users SET account_deleted_at = NOW() WHERE user_id = $1 RETURNING *", [id]);

            if (result.rowCount === 0) {
                return { status: 404, result: { msg: "No user found with that id" } };
            }

            return { status: 200, result: userFromDB(result.rows[0]) };
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
                values ($1,$2,$3,$4,$5,$6,$7) RETURNING user_id`, [newUser.first_name, newUser.last_name,
                newUser.location, newUser.username, newUser.email, newUser.password, newUser.user_role]);

            const userId = result.rows[0].user_id;

            // create a new profile for the user
            const profile = new Profile(null, null, userId);
            await Profile.create(profile);

            return { status: 200, result: { msg: "Inserted a new user", id: userId } };
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