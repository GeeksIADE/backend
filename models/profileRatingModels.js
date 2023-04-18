const pool = require("../config/db");

class ProfileRating {
    constructor(profile_rating_value, profile_rating_profile_id) {
        this.profile_rating_value = profile_rating_value;
        this.profile_rating_profile_id = profile_rating_profile_id;
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }

    static async getAll() {
        try {
            const dbResult = await pool.query("SELECT * FROM profile_ratings");
            const result = dbResult.rows.map((rating) => new ProfileRating(rating.profile_rating_value, rating.profile_rating_profile_id));
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            const dbResult = await pool.query("SELECT * FROM profile_ratings WHERE profile_rating_id = $1", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "ProfileRating not found" };
            }
            const result = new ProfileRating(dbResult.rows[0].profile_rating_value, dbResult.rows[0].profile_rating_profile_id);
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(newProfileRating) {
        try {
            const dbResult = await pool.query("INSERT INTO profile_ratings (profile_rating_value, profile_rating_profile_id) VALUES ($1, $2) RETURNING *", [newProfileRating.profile_rating_value, newProfileRating.profile_rating_profile_id]);
            const result = new ProfileRating(dbResult.rows[0].profile_rating_value, dbResult.rows[0].profile_rating_profile_id);
            return { status: 201, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async update(id, updatedProfileRating) {
        try {
            const dbResult = await pool.query("UPDATE profile_ratings SET profile_rating_value = $1, profile_rating_profile_id = $2, updated_at = NOW() WHERE profile_rating_id = $3 RETURNING *", [updatedProfileRating.profile_rating_value, updatedProfileRating.profile_rating_profile_id, id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "ProfileRating not found" };
            }
            const result = new ProfileRating(dbResult.rows[0].profile_rating_value, dbResult.rows[0].profile_rating_profile_id);
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async delete(id) {
        try {
            const dbResult = await pool.query("DELETE FROM profile_ratings WHERE profile_rating_id = $1 RETURNING *", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "ProfileRating not found" };
            }
            const result = new ProfileRating(dbResult.rows[0].profile_rating_value, dbResult.rows[0].profile_rating_profile_id);
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = ProfileRating;
