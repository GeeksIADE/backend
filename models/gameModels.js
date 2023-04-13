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
            const dbResult = await pool.query("INSERT INTO games (game_name, created_at, updated_at) VALUES ($1, $2, $3) RETURNING *",
                [game.game_name, game.created_at, game.updated_at]);
            return { status: 201, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Game;
