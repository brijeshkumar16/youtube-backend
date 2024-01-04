import mongoose from 'mongoose';
import passport from 'passport';
import dayjs from 'dayjs';

import { changePasswordSchemaKeys, loginSchemaKeys, registerSchemaKeys } from '../utils/validation/user.validation.js';
import { validateParamsWithJoi } from '../utils/validationRequest.js';
import UserToken from '../models/user-token.model.js';
import dbService from '../utils/db-service.js';
import User from '../models/user.model.js';

export const register = async (req, res) => {
    try {
        const { username, email, fullName, avatar, coverImage, password } = req.body;

        let validateRequest = validateParamsWithJoi({ username, email, fullName, password }, registerSchemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }

        const alreadyExist = await dbService.findOne(User, { $or: [{ username }, { email }] });

        if (alreadyExist) {
            return res.badRequest({ message: 'User already Exist' });
        }

        const create = await dbService.create(User, {
            username,
            email,
            fullName,
            avatar,
            coverImage,
            password,
        });

        const findUser = await dbService
            .findOne(User, { _id: create._id })
            .select('-password')
            .populate('avatar coverImage');

        if (!findUser) {
            return res.badRequest({ message: 'Something went wrong while register a user' });
        }

        const token = await findUser.generateToken();

        const expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

        const createToken = await dbService.create(UserToken, {
            token,
            userId: findUser._id,
            tokenExpiredTime: expire,
        });

        if (!createToken) {
            return res.badRequest({ message: 'Something went wrong while register a user' });
        }

        return res.success({ data: { ...findUser._doc, token: createToken }, message: 'User create successfully' });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        let validateRequest = validateParamsWithJoi({ username, email, password }, loginSchemaKeys);
        if (!validateRequest.isValid) {
            return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
        }

        const findUser = await dbService
            .findOne(User, { $or: [{ username }, { email }] })
            .populate('avatar coverImage');

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

        const createToken = await dbService.create(UserToken, {
            token,
            userId: findUser._id,
            tokenExpiredTime: expire,
        });

        if (!createToken) {
            return res.badRequest({ message: 'Something went wrong while login a user' });
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
            return res.badRequest({ message: 'Something went wrong while logout a user' });
        }

        return res.success({ message: 'Logged Out Successfully' });
    } catch (error) {
        return res.internalServerError({ data: error.message });
    }
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

    let validateRequest = validateParamsWithJoi({ oldPassword, newPassword }, changePasswordSchemaKeys);
    if (!validateRequest.isValid) {
        return res.validationError({ message: `Invalid values in parameters, ${validateRequest.message}` });
    }

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

export const getUserChannelProfile = async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.validationError({ message: 'username is missing' });
    }
    try {
        const channel = await User.aggregate([
            {
                $match: { username: username.toLowerCase() },
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: '_id',
                    foreignField: 'channel',
                    as: 'subscribers',
                },
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: '_id',
                    foreignField: 'subscriber',
                    as: 'subscribedTo',
                },
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: '$subscribers',
                    },
                    subscribedToCount: {
                        $size: '$subscribedTo',
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req?.user?._id, '$subscribers.subscriber'],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1,
                    email: 1,
                },
            },
        ]);

        if (channel?.length) {
            return res.badRequest({ message: 'Channel does not exist' });
        }
        return res.success({ data: channel[0] });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

export const getWatchHistory = async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id),
                },
            },
            {
                $lookup: {
                    from: 'Video',
                    localField: 'watchHistory',
                    foreignField: '_id',
                    as: 'watchHistory',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'User',
                                localField: 'owner',
                                foreignField: '_id',
                                as: 'owner',
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            subscribersCount: 1,
                                            subscribedToCount: 1,
                                            isSubscribed: 1,
                                            email: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: '$owner',
                                },
                            },
                        },
                    ],
                },
            },
        ]);
        return res.success({ data: user[0].watchHistory });
    } catch (error) {
        return res.internalServerError({ message: error.message });
    }
};

export const googleCallback = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/auth/google/error' }, async (error, user, info) => {
        if (error) {
            return res.badRequest({ message: error.message });
        }
        if (user) {
            try {
                const token = await user.generateToken();

                let expire = dayjs().add(process.env.TOKEN_EXPIRY, 'second').toISOString();

                const createToken = await dbService.create(UserToken, {
                    token,
                    userId: user._id,
                    tokenExpiredTime: expire,
                });

                if (!createToken) {
                    return res.badRequest({ message: 'Something went wrong while login a user with google' });
                }

                //redirect to frontend page and send a token
                res.redirect('/home?token=' + token);
            } catch (error) {
                return res.internalServerError({ message: error.message });
            }
        }
    })(req, res, next);
};
