// gameRoutes.js
const router = require('express').Router();
const { adminAuthMiddleware } = require('../middleware/adminAuthMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const Game = require('../models/gameModels');

router.get('/', (_, res) => {
    Game.getAll().then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while fetching games.' });
    });
});

router.get('/:id', (req, res) => {
    const gameId = parseInt(req.params.id);
    Game.getById(gameId).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while fetching the game.' });
    });
});

router.post('/', [authMiddleware, adminAuthMiddleware], (req, res) => {
    const game = new Game(req.body.name);
    Game.create(game).then(output => {
        if (output.status === 201) {
            res.status(201).json(output.result);
        } else {
            res.status(output.status).json({ message: 'An error occurred while creating the game.' });
        }
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while creating the game.' });
    });
});

router.put('/:id', [authMiddleware, adminAuthMiddleware], (req, res) => {
    const gameId = parseInt(req.params.id);
    const game = new Game(req.body.name);
    Game.update(gameId, game).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while updating the game.' });
    });
});

router.delete('/:id', [authMiddleware, adminAuthMiddleware], (req, res) => {
    const gameId = parseInt(req.params.id);
    Game.delete(gameId).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while deleting the game.' });
    });
});

module.exports = router;
