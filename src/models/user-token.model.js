import { Schema, model } from 'mongoose';

const userTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    token: { type: String },
    tokenExpiredTime: { type: Date },
    isTokenExpired: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const UserToken = model('UserToken', userTokenSchema);

export default UserToken;
