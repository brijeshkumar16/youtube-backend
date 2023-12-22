import { ExtractJwt, Strategy } from 'passport-jwt';

import User from '../models/user.model.js';

const adminPassportStrategy = (passport) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_SECRET,
  };

  passport.use(
    'admin-rule',
    new Strategy(options, async (payload, done) => {
      try {
        const result = await User.findOne({ _id: payload.id }).select('-password').populate('avatar coverImage');

        if (result) {
          return done(null, result.toJSON());
        }

        return done('No User Found', {});
      } catch (error) {
        return done(error, {});
      }
    })
  );
};

export default adminPassportStrategy;
