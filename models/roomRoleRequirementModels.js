const pool = require("../config/db");

class RoomRoleRequirement {
    constructor(id = null, room_id, role_id, players_needed) {
        this.id = id;
        this.room_id = room_id;
        this.role_id = role_id;
        this.players_needed = players_needed;
    }

    static async create(roomRoleRequirement) {
        try {
            const result = await pool.query(
                `INSERT INTO room_role_requirements (room_id, role_id, players_needed)
          VALUES ($1, $2, $3) RETURNING *`,
                [roomRoleRequirement.room_id, roomRoleRequirement.role_id, roomRoleRequirement.players_needed]
            );

            return { status: 200, result: result.rows[0] };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

    static async getByRoom(room_id) {
        try {
            const result = await pool.query(
                `SELECT game_roles.role_name, room_role_requirements.players_needed FROM room_role_requirements
                INNER JOIN rooms ON room_role_requirements.room_id = rooms.room_id
                INNER JOIN game_roles ON room_role_requirements.role_id = game_roles.role_id
                WHERE rooms.room_id = $1`,
                [room_id]
            );

            return { status: 200, result: result.rows };
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }
    }

}

module.exports = RoomRoleRequirement;
