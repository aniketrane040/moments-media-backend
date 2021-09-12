import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModal from "../models/user.js";

const secret = 'test';

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await UserModal.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  const { followerId, followingId } = req.body;
  try {
    const user1 = await UserModal.findById(followerId);
    const user2 = await UserModal.findById(followingId);

    user1.following.push(followingId);
    user2.followers.push(followerId);

    const user1Update = await UserModal.findByIdAndUpdate(followerId, user1, { new: true });
    const user2Update = await UserModal.findByIdAndUpdate(followingId, user2, { new: true });

    res.status(200).json(user2Update);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const unFollowUser = async (req, res) => {
  const { followerId, followingId } = req.body;
  try {
    const user1 = await UserModal.findById(followerId);
    const user2 = await UserModal.findById(followingId);

    user1.following.pull(followingId);
    user2.followers.pull(followerId);

    const user1Update = await UserModal.findByIdAndUpdate(followerId, user1, { new: true });
    const user2Update = await UserModal.findByIdAndUpdate(followingId, user2, { new: true });

    res.status(200).json(user2Update);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password.toString(), oldUser.password.toString());

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  }
};

export const signup = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const oldUser = await UserModal.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password.toString(), 12);

    const result = await UserModal.create({ email: email, password: hashedPassword, name: `${firstName} ${lastName}` });

    const token = jwt.sign({ email: result.email, id: result._id }, secret, { expiresIn: "1h" });

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
};

export const changeDescription = async (req, res) => {
  const { email, userDescription } = req.body;
  try {
    const user = await UserModal.findOne({ email });

    const updatedUser = await UserModal.findOneAndUpdate({ email }, { $set : { description : userDescription } }, {new: true});
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
}

export const changeProfilePic = async (req,res) => {
  const {email , profilePic} = req.body;
  try {
    const user = await UserModal.findOne({ email });

    const updatedUser = await UserModal.findOneAndUpdate({ email }, { $set : { profilePic : profilePic } }, {new: true});
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });

    console.log(error);
  }
}