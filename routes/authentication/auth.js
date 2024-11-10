const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPasswords = await bcrypt.hash(req.body.password, salt)

        const user = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPasswords
        });

        await user.save();
        res.status(201).send({ message: 'User registered successfully', user: user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).send("User  not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send("Invalid password");
        else res
            .status(200)
            .send({ user: user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;