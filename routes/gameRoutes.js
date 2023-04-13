// gameRoutes.js
const router = require('express').Router();
const Game = require('../models/gameModels');

router.get('', (_, res) => {
    Game.getAll().then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while fetching games.' });
    });
});

router.post('/create', (req, res) => {
    const game = new Game(req.body.game_name);
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

module.exports = router;
