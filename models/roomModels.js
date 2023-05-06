const pool = require("../config/db");

function generateRandomCode(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

class Room {
    constructor(id = null, name = null, code = null, game_id, mode_id, min_rank, max_rank, max_players, is_private, owner_id) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.game_id = game_id;
        this.mode_id = mode_id;
        this.min_rank = min_rank;
        this.max_rank = max_rank;
        this.max_players = max_players;
        this.is_private = is_private;
        this.owner_id = owner_id;
    }

    static async getAll() {
        try {
            const result = await pool.query(`SELECT * FROM rooms`);
            return { status: 200, result: result.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async create(newRoom) {
        try {
            const roomCode = generateRandomCode(5);
            const result = await pool.query(
                `INSERT INTO rooms (room_name, room_code, game_id, mode_id, min_rank, max_rank, max_players, is_private, owner_id)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING room_id`,
                [newRoom.name, roomCode, newRoom.game_id, newRoom.mode_id, newRoom.min_rank, newRoom.max_rank, newRoom.max_players, newRoom.is_private, newRoom.owner_id]
            );

            const roomId = result.rows[0].room_id;

            if (newRoom.game_has_roles && newRoom.role_requirements) {
                for (const roleReq of newRoom.role_requirements) {
                    await pool.query(
                        `INSERT INTO room_role_requirements (room_id, role_id, players_needed)
                  VALUES ($1, $2, $3)`,
                        [roomId, roleReq.role_id, roleReq.players_needed]
                    );
                }
            }

            return { status: 200, result: { msg: "Inserted a new room", id: roomId } };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getById(id) {
        try {
            const result = await pool.query("SELECT * FROM rooms WHERE room_id = $1", [id]);

            if (result.rowCount === 0) {
                return { status: 404, result: { msg: "No room found with that id" } };
            }

            return { status: 200, result: result.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async join(room_id, user_id) {
        try {
            const result = await pool.query(
                `INSERT INTO room_members (room_id, user_id) VALUES ($1, $2) RETURNING *`,
                [room_id, user_id]
            );

            return { status: 200, result: result.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getMembers(room_id) {
        try {
            const result = await pool.query(
                `SELECT users.* FROM users
                JOIN room_members ON room_members.user_id = users.user_id
                WHERE room_members.room_id = $1`,
                [room_id]
            );

            return { status: 200, result: result.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }
}

module.exports = Room;
