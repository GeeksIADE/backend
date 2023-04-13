const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();
const port = 7000;
require('dotenv').config()

// import routes
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');

app.use(cors())

// set headers for preflight requests
app.options('*', cors((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*',)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    // res.sendStatus(200)
}))

app.use(bodyParser.json());
// route middlewares
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/games', gameRoutes);
app.listen(port, () => console.log("Server running at port " + port));
