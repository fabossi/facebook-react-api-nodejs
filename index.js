const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('MongoDB connected')
});

// Middleware
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// Verifica se a pasta existe, caso contrário, cria
const uploadPath = path.join(__dirname, 'public/images');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    }
});

const upload = multer({ storage: imageStorage });

app.post("/api/upload", upload.single('file'), (req, res) => {
    try {
        return res.status(200).send("File uploaded successfully.");
    } catch (error) {
        console.error(error);
        return res.status(500).send("An error occurred while uploading the file.");
    }
});

app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);

app.listen(8800, () => {
    console.log('Server is running on port 8800');
});