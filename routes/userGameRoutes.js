// userGameRoutes.js
const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const UserGame = require('../models/userGameModels');

router.get('/:user_id/games', authMiddleware, (req, res) => {
    UserGame.getAllByUserId(req.params.user_id)
        .then(output => {
            res.status(output.status).json(output.result);
        })
        .catch(err => {
            res.status(500).json({ message: 'An error occurred while fetching user games.' });
        });
});

router.post('/:user_id/games', authMiddleware, async (req, res) => {
    const userGame = new UserGame(req.params.user_id, req.body.game_id, req.body.game_steam_id, req.body.game_rank);
    UserGame.create(userGame)
        .then(output => {
            res.status(output.status).json(output.result);
        })
        .catch(err => {
            res.status(500).json({ message: 'An error occurred while adding a game to the user.' });
        });
});

router.delete('/:user_id/games/:id', authMiddleware, (req, res) => {
    UserGame.delete(req.params.user_id, req.params.id)
        .then(output => {
            res.status(output.status).json(output.result);
        })
        .catch(err => {
            res.status(500).json({ message: 'An error occurred while removing the game from the user.' });
        });
});

module.exports = router;
