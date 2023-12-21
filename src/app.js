import passport from 'passport';
import express from 'express';
import cors from 'cors';

import googlePassportStrategy from './config/google-passport-strategy.js';
import adminPassportStrategy from './config/admin-passport-strategy.js';
import responseHandler from './utils/response/response-handler.js';
import mediaItemRoute from './routes/media-item.route.js';
import userRoute from './routes/user.route.js';

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(responseHandler);

// passport
adminPassportStrategy(passport);
googlePassportStrategy(passport);

app.use(passport.initialize());

// routes
app.use('/api/v1/media-item', mediaItemRoute);
app.use('/api/v1/auth', userRoute);

export default app;
