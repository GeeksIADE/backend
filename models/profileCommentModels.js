const pool = require("../config/db");

class ProfileComment {
    constructor(profile_comment_text, profile_comment_profile_id) {
        this.profile_comment_text = profile_comment_text;
        this.profile_comment_profile_id = profile_comment_profile_id;
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }

    static async getAll() {
        try {
            const dbResult = await pool.query("SELECT * FROM profile_comments");
            return { status: 200, result: dbResult.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            const dbResult = await pool.query("SELECT * FROM profile_comments WHERE profile_comment_id=$1", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "ProfileComment not found" };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(profileComment) {
        try {
            const dbResult = await pool.query(
                "INSERT INTO profile_comments (profile_comment_text, profile_comment_profile_id, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *",
                [profileComment.profile_comment_text, profileComment.profile_comment_profile_id, profileComment.created_at, profileComment.updated_at]
            );
            return { status: 201, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async updateById(id, updatedProfileComment) {
        try {
            const dbResult = await pool.query(
                "UPDATE profile_comments SET profile_comment_text=$1, profile_comment_profile_id=$2, updated_at=$3 WHERE profile_comment_id=$4 RETURNING *",
                [updatedProfileComment.profile_comment_text, updatedProfileComment.profile_comment_profile_id, updatedProfileComment.updated_at, id]
            );
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "ProfileComment not found" };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async deleteById(id) {
        try {
            const dbResult = await pool.query("DELETE FROM profile_comments WHERE profile_comment_id=$1 RETURNING *", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "ProfileComment not found" };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = ProfileComment;