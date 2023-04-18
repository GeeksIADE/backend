// userGameModels.js
const pool = require('../config/db');

class UserGame {
    constructor(user_id, game_id, game_steam_id, game_rank) {
        this.user_id = user_id;
        this.game_id = game_id;
        this.game_steam_id = game_steam_id;
        this.game_rank = game_rank;
    }

    static async getAllByUserId(user_id) {
        try {
            const dbResult = await pool.query('SELECT * FROM users_games WHERE users_id=$1', [user_id]);
            return { status: 200, result: dbResult.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(userGame) {
        try {
            const dbResult = await pool.query('INSERT INTO users_games (users_id, games_id, game_steam_id, game_rank, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                [userGame.user_id, userGame.game_id, userGame.game_steam_id, userGame.game_rank]);
            return { status: 201, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async delete(userId, gameId) {
        try {
            const dbResult = await pool.query('DELETE FROM users_games WHERE users_id=$1 AND games_id=$2 RETURNING *', [userId, gameId]);
            if (dbResult.rowCount === 0) {
                return { status: 404, result: "UserGame not found" };
            }
            return { status: 200, result: dbResult.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

}

module.exports = UserGame;
