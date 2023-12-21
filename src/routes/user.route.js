import { Router } from 'express';
import passport from 'passport';
import dayjs from 'dayjs';

import { login, logout, register } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middlewares.js';
import UserToken from '../models/user-token.model.js';
import dbService from '../utils/db-service.js';

const userRoute = Router();

userRoute.post('/register', register);
userRoute.post('/login', login);
userRoute.get('/logout', auth, logout);

userRoute.get('/google/error', (req, res) => res.loginFailed({ message: 'Login Failed' }));

userRoute.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

userRoute.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/auth/google/error' }, async (error, user, info) => {
    if (error) {
      return res.internalServerError({ message: error.message });
    }
    if (user) {
      try {
        const token = await user.generateToken();

        let expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

        await dbService.create(UserToken, { token, userId: user._id, tokenExpiredTime: expire });
        return res.success({ data: user, message: 'User login successfully' });
      } catch (error) {
        return res.internalServerError({ message: error.message });
      }
    }
  })(req, res, next);
});

export default userRoute;
