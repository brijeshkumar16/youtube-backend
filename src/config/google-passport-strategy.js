import { Strategy } from 'passport-google-oauth20';

import dbService from '../utils/db-service.js';
import User from '../models/user.model.js';

const googlePassportStrategy = (passport) => {
    passport.serializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.deserializeUser(function (user, cb) {
        cb(null, user);
    });

    passport.use(
        new Strategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async function (accessToken, refreshToken, profile, done) {
                if (profile) {
                    let userObj = {
                        username: profile.displayName,
                        fullName: profile.displayName,
                        googleId: profile.id,
                        email: profile.emails !== undefined ? profile.emails[0].value : '',
                        password: '',
                    };

                    let found = await dbService.findOne(User, { googleId: profile.id });

                    if (found) {
                        const id = found.id;
                        await dbService.updateOne(User, { _id: id }, userObj);
                    } else {
                        await dbService.create(User, userObj);
                    }

                    let user = await dbService.findOne(User, { googleId: profile.id });

                    return done(null, user);
                }
                return done(null, null);
            }
        )
    );
};

export default googlePassportStrategy;
