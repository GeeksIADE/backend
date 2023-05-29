const router = require('express').Router();
const { adminAuthMiddleware } = require('../middleware/adminAuthMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');
const Mode = require('../models/modeModels');

router.get('/', (_, res) => {
    Mode.getAll().then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while fetching modes.' });
    });
});

router.get('/:id', (req, res) => {
    const modeId = parseInt(req.params.id);
    Mode.getById(modeId).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while fetching the mode.' });
    });
});

router.post('/', [authMiddleware, adminAuthMiddleware], (req, res) => {
    const mode = new Mode(req.body.name);
    Mode.create(mode).then(output => {
        if (output.status === 201) {
            res.status(201).json(output.result);
        } else {
            res.status(output.status).json({ message: 'An error occurred while creating the mode.' });
        }
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while creating the mode.' });
    });
});

router.put('/:id', [authMiddleware, adminAuthMiddleware], (req, res) => {
    const modeId = parseInt(req.params.id);
    const mode = new Mode(req.body.name);
    Mode.update(modeId, mode).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while updating the mode.' });
    });
});

router.delete('/:id', [authMiddleware, adminAuthMiddleware], (req, res) => {
    const modeId = parseInt(req.params.id);
    Mode.delete(modeId).then(output => {
        res.status(output.status).json(output.result);
    }).catch(err => {
        res.status(500).json({ message: 'An error occurred while deleting the mode.' });
    });
});

module.exports = router;
