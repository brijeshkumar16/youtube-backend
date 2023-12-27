import { Router } from 'express';
import passport from 'passport';

import auth from '../middlewares/auth.middlewares.js';
import {
    changeCurrentPassword,
    currentUser,
    getUserChannelProfile,
    getWatchHistory,
    googleCallback,
    login,
    logout,
    register,
    updateUser,
} from '../controllers/user.controller.js';

const userRoute = Router();

userRoute.post('/register', register);

userRoute.post('/login', login);

userRoute.get('/logout', auth, logout);

userRoute.get('/current-user', auth, currentUser);

userRoute.patch('/update-user', auth, updateUser);

userRoute.post('/change-password', auth, changeCurrentPassword);

userRoute.get('/profile/:username', auth, getUserChannelProfile);

userRoute.get('/watch-history', auth, getWatchHistory);

// google login
userRoute.get('/google/error', (req, res) => res.loginFailed({ message: 'Login Failed' }));

userRoute.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

userRoute.get('/google/callback', googleCallback);

export default userRoute;
