const express = require("express");
const router = express.Router();
const Room = require("../models/roomModels");
const Game = require("../models/gameModels");
const { authMiddleware } = require('../middleware/authMiddleware');
const RoomRoleRequirement = require("../models/roomRoleRequirementModels");

// Create a new room
router.post("/create", authMiddleware, async (req, res) => {
  const {
    name,
    room_code,
    game_id,
    mode_id,
    min_rank,
    max_rank,
    max_players,
    is_private,
    role_requirements,
  } = req.body;

  console.log(req.body);


  const room = new Room(
    null,
    name,
    room_code,
    game_id,
    mode_id,
    min_rank,
    max_rank,
    max_players,
    is_private,
    req.user.id
  );

  console.log(room);
  console.log(room.room_code);
  const response = await Room.create(room);
  if (response.status !== 200) {
    return res.status(response.status).json(response.result);
  }

  const createdRoom = response.result;

  // Check if the game has roles
  const gameResponse = await Game.getById(game_id);
  if (gameResponse.status !== 200) {
    return res.status(gameResponse.status).json(gameResponse.result);
  }

  const game = gameResponse.result;

  if (game.has_roles && role_requirements) {
    for (const requirement of role_requirements) {
      const roleRequirement = new RoomRoleRequirement(
        null,
        createdRoom.room_id,
        requirement.role_id,
        requirement.players_needed
      );

      const requirementResponse = await RoomRoleRequirement.create(roleRequirement);
      if (requirementResponse.status !== 200) {
        return res.status(requirementResponse.status).json(requirementResponse.result);
      }
    }
  }

  return res.status(200).json(createdRoom);
});

// Get all rooms
router.get("/", authMiddleware, async (req, res) => {
  const response = await Room.getAllAndPrivate(req.user.id);
  if (response.status !== 200) {
    return res.status(response.status).json(response.result);
  }
  return res.status(200).json(response.result);
});

// // Get all rooms
// router.get("/", async (req, res) => {
//   const response = await Room.getPublic();
//   if (response.status !== 200) {
//     return res.status(response.status).json(response.result);
//   }
//   return res.status(200).json(response.result);
// });

// Get a room by its ID
router.get('/:id', async (req, res) => {
  const room_id = req.params.id;
  const result = await Room.getById(room_id);
  res.status(result.status).json(result.result);
});

// Get a room by its ID
router.get('/private/:room_code', async (req, res) => {
  const room_code = req.params.room_code;
  const room_id = (await Room.getRoomIdFromCode(room_code)).result;
  const result = await Room.getById(room_id);
  res.status(result.status).json(result.result);
});

// Get mode by its ID
router.get('/:id/mode', async (req, res) => {
  const id = req.params.id;
  const result = await Room.getModeById(id);
  res.status(result.status).json(result.result);
});

// Get room requirements by room ID
router.get('/:id/requirements', async (req, res) => {
  const room_id = req.params.id;
  const result = await RoomRoleRequirement.getByRoom(room_id);
  res.status(result.status).json(result.result);
});

// Join a room
router.post('/join/:room_id', authMiddleware, async (req, res) => {
  const room_id = req.params.room_id;
  const user_id = req.user.id;
  const { role } = req.body;

  // Check if the game associated with the room has roles
  const roomResponse = await Room.getPublicById(room_id);
  if (roomResponse.status !== 200) {
    return res.status(roomResponse.status).json(roomResponse.result);
  }
  const game_id = roomResponse.result.game_id;
  const gameResponse = await Game.getById(game_id);
  if (gameResponse.status !== 200) {
    return res.status(gameResponse.status).json(gameResponse.result);
  }
  const game = gameResponse.result;
  if (game.has_roles && !role) {
    return res.status(400).json({ message: 'A role is required to join this room.' });
  }

  // Join the room's WebSocket channel
  const roomChannel = `room:${room_id}`;

  // Log the roomChannel and user_id
  console.log('Joining WebSocket channel:', roomChannel);
  console.log('User ID:', user_id);

  req.app.get('socketio').of('/chat').in(roomChannel).socketsJoin(`${roomChannel}:${user_id}`);

  const result = await Room.join(room_id, user_id, role);
  res.status(result.status).json(result.result);
});
// Join a private room
router.post('/private/join/:room_code', authMiddleware, async (req, res) => {
  try {
    const room_code = req.params.room_code;
    const room_id = (await Room.getRoomIdFromCode(room_code)).result;
    const { role } = req.body;
    if (room_id) {
      const user_id = req.user.id;
      // Check if the game associated with the room has roles
      const roomResponse = await Room.getById(room_id);
      if (roomResponse.status !== 200) {
        return res.status(roomResponse.status).json(roomResponse.result);
      }
      const game_id = roomResponse.result.game_id;
      const gameResponse = await Game.getById(game_id);
      if (gameResponse.status !== 200) {
        return res.status(gameResponse.status).json(gameResponse.result);
      }
      const game = gameResponse.result;
      if (game.has_roles && !role) {
        return res.status(400).json({ message: 'A role is required to join this room.' });
      }

      // Join the room's WebSocket channel
      const roomChannel = `room:${room_code}`;

      // Log the roomChannel and user_id
      console.log('Joining WebSocket channel:', roomChannel);
      console.log('User ID:', user_id);

      req.app.get('socketio').of('/chat').in(roomChannel).socketsJoin(`${roomChannel}:${user_id}`);

      const result = await Room.joinPrivate(room_code, user_id, role);
      res.status(result.status).json(result.result);
    } else {
      res.status(404).json();
    }
  } catch {
    res.status(404).json();
  }
});

// Leave a room
router.post('/leave/:room_id', authMiddleware, async (req, res) => {
  const room_id = req.params.room_id;
  const user_id = req.user.id;

  // Leave the room's WebSocket channel
  const roomChannel = `room:${room_id}`;

  // Log the roomChannel and user_id
  console.log('Leaving WebSocket channel:', roomChannel);
  console.log('User ID:', user_id);

  req.app.get('socketio').of('/chat').in(roomChannel).socketsLeave(`${roomChannel}:${user_id}`);

  const result = await Room.deleteMember(room_id, user_id);
  res.status(result.status).json(result.result);
});

// Leave a room
router.post('/private/leave/:room_code', authMiddleware, async (req, res) => {
  const room_code = req.params.room_code;
  const room_id = (await Room.getRoomIdFromCode(room_code)).result;
  const user_id = req.user.id;

  // Leave the room's WebSocket channel
  const roomChannel = `room:${room_id}`;

  // Log the roomChannel and user_id
  console.log('Leaving WebSocket channel:', roomChannel);
  console.log('User ID:', user_id);

  req.app.get('socketio').of('/chat').in(roomChannel).socketsLeave(`${roomChannel}:${user_id}`);

  const result = await Room.deleteMember(room_id, user_id);
  res.status(result.status).json(result.result);
});

// Get members of a room
router.get('/:id/members', async (req, res) => {
  const room_id = req.params.id;
  const result = await Room.getMembers(room_id);
  console.log(result);
  res.status(result.status).json(result.result);
});

// Get members of a room
router.get('/private/:room_code/members', async (req, res) => {
  try {
    const room_code = req.params.room_code;
    const room_id = (await Room.getRoomIdFromCode(room_code)).result;
    const result = await Room.getMembers(room_id);
    console.log(result);
    res.status(result.status).json(result.result);
  } catch {
    res.status(404).json();
  }

});

module.exports = router;