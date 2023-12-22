import { Router } from 'express';
import passport from 'passport';

import { changeCurrentPassword, currentUser, googleCallback, login, logout, register, updateUser } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middlewares.js';

const userRoute = Router();

userRoute.post('/register', register);

userRoute.post('/login', login);

userRoute.get('/logout', auth, logout);

userRoute.get('/current', auth, currentUser);

userRoute.patch('/update', auth, updateUser);

userRoute.post('/change-password', auth, changeCurrentPassword);

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
