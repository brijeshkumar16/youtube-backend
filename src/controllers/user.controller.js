import dayjs from 'dayjs';

import UserToken from '../models/user-token.model.js';
import dbService from '../utils/db-service.js';
import User from '../models/user.model.js';

export const register = async (req, res) => {
  try {
    const { username, email, fullName, avatar, coverImage, password } = req.body;

    const find = await dbService.findOne(User, { $or: [{ username }, { email }] });

    if (find) {
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

    const findUser = await dbService.findOne(User, { _id: create._id }).select('-password -refreshToken').populate('avatar coverImage');

    if (!findUser) {
      return res.internalServerError({ message: 'Something went wrong while register a user' });
    }
    const token = await findUser.generateToken();

    let expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

    await dbService.create(UserToken, { token, userId: findUser._id, tokenExpiredTime: expire });

    return res.success({ data: { ...findUser._doc, token }, message: 'User create successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const find = await dbService.findOne(User, { $or: [{ username }, { email }] }).populate('avatar coverImage');

    if (!find) {
      return res.unAuthorized({ message: 'User does not exist' });
    }

    const isPasswordValid = await find.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.unAuthorized({ message: 'User does not exist' });
    }

    delete find._doc.password;

    const token = await find.generateToken();

    let expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

    await dbService.create(UserToken, { token, userId: find._id, tokenExpiredTime: expire });

    return res.success({ data: { ...find._doc, token }, message: 'User login successfully' });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    let updatedDocument = { isTokenExpired: true };
    await dbService.updateOne(UserToken, { userId: req.user._id }, updatedDocument);
    return res.success({ message: 'Logged Out Successfully' });
  } catch (error) {
    return res.internalServerError({ data: error.message });
  }
};
