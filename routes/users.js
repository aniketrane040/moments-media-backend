import express from 'express';
import { changeDescription, changeProfilePic, followUser, getUser, signin , signup, unFollowUser } from '../controllers/user.js';

const router = express.Router();

router.post('/signup',signup);

router.post('/signin',signin);

router.get('/:id',getUser);

router.patch('/follow',followUser);

router.patch('/unfollow',unFollowUser);

router.patch('/changeDescription',changeDescription);

router.patch('/changePic',changeProfilePic);

export default router;