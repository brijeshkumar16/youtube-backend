import { ExtractJwt, Strategy } from 'passport-jwt';

import User from '../models/user.model.js';

const adminPassportStrategy = (passport) => {
  const options = {};
  options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  options.secretOrKey = process.env.TOKEN_SECRET;
  passport.use(
    'admin-rule',
    new Strategy(options, async (payload, done) => {
      try {
        const result = await User.findOne({ _id: payload.id });
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
