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
router.get("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findById(req.params.id)
            const { password, updatedAt, ...userInformation } = user._doc;
            return res.status(200).json(userInformation);
        } catch (error) {
            return res.status(404).json({ error: 'Something ocurred. Contact your administrator.' });
        }
    } else {
        return res.status(403).json({ message: "Unauthorized" });
    }
})

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