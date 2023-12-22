import passport from 'passport';
import dayjs from 'dayjs';

import UserToken from '../models/user-token.model.js';
import dbService from '../utils/db-service.js';
import User from '../models/user.model.js';

export const register = async (req, res) => {
  try {
    const { username, email, fullName, avatar, coverImage, password } = req.body;

    // Add validation of required field

    const alreadyExist = await dbService.findOne(User, { $or: [{ username }, { email }] });

    if (alreadyExist) {
      return res.validationError({ message: 'User already Exist' });
    }

    const create = await dbService.create(User, {
      username,
      email,
      fullName,
      avatar,
      coverImage,
      password,
    });

    const findUser = await dbService.findOne(User, { _id: create._id }).select('-password').populate('avatar coverImage');

    if (!findUser) {
      return res.internalServerError({ message: 'Something went wrong while register a user' });
    }

    const token = await findUser.generateToken();

    const expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

    const createToken = await dbService.create(UserToken, { token, userId: findUser._id, tokenExpiredTime: expire });

    if (!createToken) {
      return res.internalServerError({ message: 'Something went wrong while register a user' });
    }

    return res.success({ data: { ...findUser._doc, token: createToken }, message: 'User create successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Add validation of required field

    const findUser = await dbService.findOne(User, { $or: [{ username }, { email }] }).populate('avatar coverImage');

    if (!findUser) {
      return res.unAuthorized({ message: 'User does not exist' });
    }

    const isPasswordValid = await findUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.unAuthorized({ message: 'User does not exist' });
    }

    delete findUser._doc.password;

    const token = await findUser.generateToken();

    const expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

    const createToken = await dbService.create(UserToken, { token, userId: findUser._id, tokenExpiredTime: expire });

    if (!createToken) {
      return res.internalServerError({ message: 'Something went wrong while login a user' });
    }

    return res.success({ data: { ...findUser._doc, token: createToken }, message: 'User login successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    let updatedDocument = { isTokenExpired: true };

    const _id = req.user.token._id;

    const update = await dbService.updateOne(UserToken, { _id }, updatedDocument);

    if (!update) {
      return res.internalServerError({ message: 'Something went wrong while logout a user' });
    }

    return res.success({ message: 'Logged Out Successfully' });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};

export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/auth/google/error' }, async (error, user, info) => {
    if (error) {
      return res.internalServerError({ message: error.message });
    }
    if (user) {
      try {
        const token = await user.generateToken();

        let expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

        const createToken = await dbService.create(UserToken, { token, userId: user._id, tokenExpiredTime: expire });

        if (!createToken) {
          return res.internalServerError({ message: 'Something went wrong while login a user with google' });
        }

        //redirect to frontend page and send a token
        res.redirect('/home?token=' + token);
      } catch (error) {
        return res.internalServerError({ message: error.message });
      }
    }
  })(req, res, next);
};

export const currentUser = (req, res) => {
  try {
    return res.success({ data: req.user });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export const changeCurrentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // Add validation of required field

  try {
    const user = await dbService.findOne(User, { _id: req.user._id });

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
      return res.badRequest({ message: 'Invalid old password' });
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    res.success({ message: 'Password changed successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { username, email, fullName, avatar, coverImage } = req.body;
  // Add validation of required field
  try {
    const user = await dbService
      .updateOne(User, { _id: req.user._id }, { username, email, fullName, avatar, coverImage })
      .select('-password')
      .populate('avatar coverImage');

    if (!user) {
      return res.internalServerError({ message: 'Something went wrong while update a user' });
    }

    res.send({ data: user, message: 'User update successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};
