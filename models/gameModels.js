const pool = require("../config/db");

class Game {
    constructor(game_name) {
        this.game_name = game_name;
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }

    static async getAll() {
        try {
            const dbResult = await pool.query("SELECT * FROM games");
            return { status: 200, result: dbResult.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(game) {
        try {
            const dbResult = await pool.query("INSERT INTO games (game_name, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *",
                [game.game_name]);
            return { status: 201, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            const dbResult = await pool.query("SELECT * FROM games WHERE game_id=$1", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: { message: 'Game not found' } };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async update(id, game) {
        try {
            const dbResult = await pool.query("UPDATE games SET game_name=$1, updated_at=NOW() WHERE game_id=$2 RETURNING *", [game.game_name, id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: { message: 'Game not found' } };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async delete(id) {
        try {
            const dbResult = await pool.query("DELETE FROM games WHERE game_id=$1 RETURNING *", [id]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: { message: 'Game not found' } };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Game;
