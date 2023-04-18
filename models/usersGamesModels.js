const pool = require("../config/db");

class UsersGames {
    constructor(users_id, games_id, game_steam_id, game_rank) {
        this.users_id = users_id;
        this.games_id = games_id;
        this.game_steam_id = game_steam_id;
        this.game_rank = game_rank;
        this.created_at = Date.now();
        this.updated_at = Date.now();
    }
}

module.exports = UsersGames;
