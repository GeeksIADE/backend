const pool = require("../config/db");
const bcrypt = require('bcrypt');
const Profile = require("./profileModels");
const geohash = require('ngeohash');

function userFromDB(user) {
    return new User(user.user_id, user.user_first_name,
        user.user_last_name, user.user_latitude, user.user_longitude, user.user_geohash, user.geopoint, user.user_name,
        user.user_email, user.user_password, user.user_email_verified,
        user.user_role, user.user_active, user.user_reset_code, user.user_register_code,
        user.user_reset_code_at, user.created_at, user.updated_at, user.games);
}

class User {
    constructor(id = null, first_name = null, last_name = null, user_latitude = null, user_longitude = null, user_geohash = null, geopoint = null, username = null, email = null, password = null, isEmailVerified = null, user_role = null, user_active = null, user_reset_code = null, user_register_code = null, user_reset_code_at = null, created_at = null, updated_at = null, games = []) {
        this.id = id;
        this.first_name = first_name;
        this.last_name = last_name;
        this.user_latitude = user_latitude;
        this.user_longitude = user_longitude;
        this.user_geohash = user_geohash;
        this.geopoint = geopoint;
        this.last_name = last_name;
        this.username = username;
        this.email = email;
        this.password = password;
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
                // console.log(dbUser);
                result.push(userFromDB(dbUser));
            }
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getActiveUserCount() {
        try {
            let result = [];
            let dbResult = await pool.query("SELECT count(*) FROM users WHERE user_active = true");
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getAllActive() {
        try {
            let result = [];
            let dbResult = await pool.query("SELECT * FROM users WHERE user_active = true");
            for (let dbUser of dbResult.rows) {
                // console.log(dbUser);
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
            const hashedPassword = await bcrypt.hash(password, 10); // hash the password
            const result = await pool.query(
                `UPDATE users SET user_first_name = $1, user_last_name = $2, user_location = $3,
            user_name = $4, user_email = $5, user_password = $6, updated_at = NOW()
            WHERE user_id = $7 RETURNING *`,
                [first_name, last_name, location, username, email, hashedPassword, id] // use the hashed password in the query
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
                await pool.query(`insert into users (user_first_name, user_last_name, user_latitude, user_longitude, 
                    user_name, user_email, user_password, user_role)
                values ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING user_id`, [newUser.first_name, newUser.last_name,
                newUser.latitude, newUser.longitude, newUser.username, newUser.email, newUser.password, newUser.user_role]);

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

    static async getNearbyUsersByGeohash(latitude, longitude, radius) {
        const distanceInMeters = radius * 1000;
        const query = `
          SELECT * FROM users
          WHERE ST_DWithin(
            geopoint,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3
          );
        `;
        const res = await pool.query(query, [longitude, latitude, distanceInMeters]);
        // console.log(res.rows);
        return res.rows;
    }

    static async getUsersByGeohashes(geohashes) {
        try {
            if (!Array.isArray(geohashes) || geohashes.length === 0) {
                return { status: 400, result: { msg: "Invalid geohashes provided" } };
            }

            const geohashList = geohashes.map(gh => `'${gh}'`).join(', ');
            // console.log(geohashList);
            let dbResult = await pool.query(`
                SELECT *
                FROM users
                WHERE users.user_geohash IN (${geohashList})`
            );

            let result = [];
            for (let dbUser of dbResult.rows) {
                result.push(userFromDB(dbUser));
            }
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }


    static async storeUserLocation(username, latitude, longitude) {
        console.log("ID to: " + username);
        const geohashValue = geohash.encode(latitude, longitude, 5);
        const geopoint = `POINT(${longitude} ${latitude})`;

        const query = 'UPDATE users SET user_geohash = $1, geopoint = ST_SetSRID(ST_GeomFromText($2), 4326) WHERE user_name = $3';
        await pool.query(query, [geohashValue, geopoint, username]);
    }
    static async getUserGeohash(userId) {
        console.log("ID: " + userId);
        const query = 'SELECT user_geohash FROM users WHERE user_id = $1';
        const { rows } = await pool.query(query, [userId]);
        return rows.length > 0 ? rows[0].user_geohash : null;
    }

    static async getDistance(user1, user2) {
        const point1 = `POINT(${user1.user_longitude} ${user1.user_latitude})`;
        const point2 = `POINT(${user2.longitude} ${user2.latitude})`;

        const sqlQuery = `
            SELECT ST_Distance(
                ST_GeomFromText($1, 4326),
                ST_GeomFromText($2, 4326)
            ) as distance
        `;

        const values = [point1, point2];
        const result = await pool.query(sqlQuery, values);
        return result.rows[0].distance;
    }



}

module.exports = User;