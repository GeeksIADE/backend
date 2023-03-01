const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 7000;
require('dotenv').config()

// import routes
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');

app.use(bodyParser.json());
// route middlewares
app.use('/api/login', authRoute);
app.use('/api/users', userRoute);
app.listen(port, () => console.log("Server running at port " + port));
