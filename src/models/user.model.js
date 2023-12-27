import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            time: true,
            index: true,
        },
        avatar: {
            type: Schema.Types.ObjectId,
            ref: 'MediaItem',
        },
        coverImage: {
            type: Schema.Types.ObjectId,
            ref: 'MediaItem',
        },
        password: {
            type: String,
        },
        googleId: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: process.env.TOKEN_EXPIRY * 60,
        }
    );
};

const User = model('User', userSchema);

export default User;
