const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');

// Update USER
router.put("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.user.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (error) {
                return res.status(400).json({ error: error });
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.body.userId, {
                $set: req.body,
            })
            return res.status(200).json({ message: 'User updated successfully!' });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    } else {
        return res.status(403).json({ message: "Unauthorized" });
    }
})

// Delete USER
router.delete("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.body.userId)
            return res.status(200).json({ message: 'User deleted successfully!', user });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    } else {
        return res.status(403).json({ message: "Unauthorized" });
    }
})

// Get USER
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ username: username });
        const { password, updatedAt, ...userInformation } = user._doc;
        return res.status(200).json(userInformation);
    } catch (error) {
        return res.status(404).json({ error: 'Something ocurred. Contact your administrator.' });
    }

});

// Get Friends
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId);
            })
        )
        let friendList = []
            ; (await friends).map(friend => {
                const { _id, username, profilePicture } = friend._doc
                friendList.push({ _id, username, profilePicture })
            });
        res.status(200).json(friendList);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Follower USER
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } })
                await currentUser.updateOne({ $push: { followings: req.params.id } })
                return res.status(200).json({ message: "User has been followed successfully." });

            } else {
                return res.status(401).json({ message: "You already follow this user." });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Something ocurred. Contact your administrator.' });
        }
    } else {
        return res.status(403).json({ message: "You can´t follow yourself" });

    }
});

// Unfollow USER
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } })
                await currentUser.updateOne({ $pull: { followings: req.params.id } })
                return res.status(200).json({ message: "User has been unfollowed successfully." });

            } else {
                return res.status(401).json({ message: "You're not following this user anyway." });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Something ocurred. Contact your administrator.' });
        }
    } else {
        return res.status(403).json({ message: "You can´t unfollow yourself" });

    }
});


module.exports = router;