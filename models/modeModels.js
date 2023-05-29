const pool = require("../config/db");

class Mode {
    constructor(mode_name) {
        this.mode_name = mode_name;
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }

    static async getAll() {
        try {
            const dbResult = await pool.query("SELECT * FROM modes");
            return { status: 200, result: dbResult.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(mode) {
        try {
            const dbResult = await pool.query("INSERT INTO modes (mode_name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *",
                [mode.mode_name]);
            return { status: 201, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            const dbResult = await pool.query("SELECT * FROM modes WHERE mode_id=$1", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: { message: 'Mode not found' } };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async update(id, mode) {
        try {
            const dbResult = await pool.query("UPDATE modes SET mode_name=$1, updated_at=NOW() WHERE mode_id=$2 RETURNING *", [mode.mode_name, id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: { message: 'Mode not found' } };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async delete(id) {
        try {
            const dbResult = await pool.query("DELETE FROM modes WHERE mode_id=$1 RETURNING *", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: { message: 'Mode not found' } };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Mode;
