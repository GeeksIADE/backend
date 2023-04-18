const pool = require("../config/db");

class Profile {
    constructor(profile_avatar, profile_bio, profile_users_id) {
        this.profile_avatar = profile_avatar;
        this.profile_bio = profile_bio;
        this.profile_users_id = profile_users_id;
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }
    static async getAll() {
        try {
            let result = [];
            let dbResult = await pool.query("SELECT * FROM profiles");
            for (let dbProfile of dbResult.rows) {
                result.push(profileFromDB(dbProfile));
            }
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            let dbResult = await pool.query("SELECT * FROM profiles WHERE profile_id = $1", [id]);
            let dbProfiles = dbResult.rows;
            if (!dbProfiles.length)
                return { status: 404, result: { msg: "No profile found with that id" } };
            let dbProfile = dbProfiles[0];

            let result = profileFromDB(dbProfile);
            return { status: 200, result: result };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(newProfile) {
        try {
            let result =
                await pool.query(`INSERT INTO profiles (profile_avatar, profile_bio, profile_users_id)
                VALUES ($1,$2,$3) RETURNING profile_id`, [newProfile.profile_avatar, newProfile.profile_bio, newProfile.profile_users_id]);
            return { status: 200, result: { msg: "Inserted a new profile", id: result.rows[0].profile_id } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async updateById(id, updatedProfileData) {
        try {
            const { profile_avatar, profile_bio } = updatedProfileData;
            const result = await pool.query(
                `UPDATE profiles SET profile_avatar = $1, profile_bio = $2, updated_at = NOW()
            WHERE profile_id = $3 RETURNING *`,
                [profile_avatar, profile_bio, id]
            );

            if (result.rowCount === 0) {
                return { status: 404, result: { msg: "No profile found with that id" } };
            }

            return { status: 200, result: profileFromDB(result.rows[0]) };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async deleteById(id) {
        try {
            const result = await pool.query("DELETE FROM profiles WHERE profile_id = $1 RETURNING *", [id]);

            if (result.rowCount === 0) {
                return { status: 404, result: { msg: "No profile found with that id" } };
            }

            return { status: 200, result: profileFromDB(result.rows[0]) };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

function profileFromDB(profile) {
    return new Profile(profile.profile_avatar, profile.profile_bio, profile.profile_users_id);
}

module.exports = Profile;