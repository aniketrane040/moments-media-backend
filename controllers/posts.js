import PostMessage from '../models/postMessage.js';
import mongoose from 'mongoose';
import schedule from 'node-schedule';
import mail from 'nodemailer';

const transporter = mail.createTransport(
    {
        service: 'gmail',
        auth:
        {
            user: process.env.EMAIL_USER_ID,
            pass: process.env.PASSWORD
        }
    });

export const getPost = async (req, res) => {
    const { id } = req.params;
    try {

        const post = await PostMessage.findById(id);

        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getPosts = async (req, res) => {
    const { page } = req.query;
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

        const total = await PostMessage.countDocuments({});
        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT) });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPostsOfUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const posts_of_user = await PostMessage.find({ creator: userId });
        res.status(200).json(posts_of_user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPostsBySearch = async (req, res) => {

    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");
        const posts = await PostMessage.find({ $or: [{ title }, { tags: { $in: tags.split(',') } }] });

        res.status(200).json({ data: posts });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {

    const post = req.body;

    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() });
    try {

        await newPost.save();
        res.status(201).json(newPost);

    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {

    const { id: _id } = req.params;
    const post = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(404).send('No Post with that Id');
        }
        const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true });

        res.json(updatedPost);
    } catch (error) {
        res.status(409).json({ message: error.message });
        console.log('error');
    }
}

export const deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send('No Post with that Id');
        }
        await PostMessage.findByIdAndRemove(id);
        res.json({ message: 'Post deleted Successfully' });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.userId) return res.json({ message: "Unauthorized" });

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send('No Post with that Id');
        }

        const post = await PostMessage.findById(id);

        const index = post.likes.findIndex((id) => id === String(req.userId));

        if (index === -1) {
            post.likes.push(req.userId);
        } else {
            post.likes = post.likes.filter((id) => id !== String(req.userId));
        }

        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    try {
        const post = await PostMessage.findById(id);

        post.comments.push(value);

        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
        res.json(updatedPost);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }
}

export const sharePost = async (req, res) => {
    const { id, shareData } = req.body;
    try {
        const scheduleDate = new Date(shareData.date);
        var sendingMessage = "Hello" + shareData.name + "\n\tsomeone would like to share their precious moments with you,Hope you love it!\n" + shareData.eventMessage;
        console.log(scheduleDate);
        schedule.scheduleJob(scheduleDate, () => {
            var share_url = `http://localhost:3000/posts/${id}`;
            console.log(share_url);
            const mailOptions = {
                from: process.env.EMAIL_USER_ID,
                to: shareData.mailId,
                subject: 'Sharing Precious moments with their Loved Once ! ',
                text: sendingMessage
            };
            transporter.sendMail(mailOptions,(error,info) => {
                if(error) {
                    console.log('error occured');
                } else {
                    console.log('mail sent');
                }
            });
        })
        res.status(200).json(shareData);
    } catch (error) {
        console.log(error);
        res.status(409).json({ message: error.message });
    }

}