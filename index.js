const express = require('express');

const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Routes
const userRoute = require('./routes/user/users');
const authRoute = require('./routes/authentication/auth');
const postRoute = require('./routes/posts/post');

dotenv.config();

mongoose.connect(process.env.MONGO_URL).then(() => { console.log('MongoDB connected') });

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

app.listen(8800, () => {
    console.log('Server is running on port 8800');
});