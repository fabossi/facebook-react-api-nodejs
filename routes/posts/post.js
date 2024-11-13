const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const User = require('../../models/User');

// Create a Post
router.post('/', async (req, res) => {
    const post = new Post(req.body);
    try {
        const savedPost = await post.save();
        return res.status(201).json(savedPost);
    } catch (error) {
        return res.status(500).json(error)
    }
});

// Update a Post
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
            return res.json({ message: "Post updated successfully!" });
        } else {
            return res.status(401).json({ message: 'You can only update your posts' });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

//Delete a Post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await Post.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Post deleted successfully!' });
        } else {
            return res.status(401).json({ message: 'You can only delete your posts' });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

//Like - Dislike a Post
router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            return res.status(200).json("The post has been liked.")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            return res.status(200).json({ message: 'The post has been disliked.' });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Get a post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        return res.json({ message: "Post fetched successfully!", post });
    } catch (error) {
        return res.status(500).json(error);
    }
});

// Get Timeline Posts
router.get('/timeline/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser.id })
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        )
        res.json(userPosts.concat(...friendPosts));
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get All User Posts
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const posts = await Post.find({ userId: user._id });
        res.json(posts);
    } catch (error) {
        res.status(500).json(error);
    }
});


module.exports = router;