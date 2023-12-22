import passport from 'passport';

import UserToken from '../models/user-token.model.js';
import dbService from '../utils/db-service.js';

const verifyCallback = (req, resolve, reject) => async (error, user, info) => {
  if (error || info || !user) {
    return reject('Unauthorized User');
  }

  let userToken = await dbService.findOne(UserToken, {
    token: req?.headers?.authorization?.replace('Bearer ', ''),
    userId: user._id,
    isTokenExpired: false,
    tokenExpiredTime: {
      $gt: new Date(),
    },
  });

  req.user = user;
  req.user.token = userToken;

  if (!userToken) {
    return reject('Token not found');
  }

  if (userToken.isTokenExpired) {
    return reject('Token is Expired');
  }

  resolve();
};

const auth = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('admin-rule', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((error) => {
      return res.unAuthorized({ message: error });
    });
};

export default auth;
