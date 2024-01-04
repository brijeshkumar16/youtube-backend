import joi from 'joi';

export const registerSchemaKeys = joi
    .object({
        username: joi.string().required(),
        email: joi.string().email().required(),
        fullName: joi.string().required(),
        password: joi.string().required(),
    })
    .unknown(true);

export const loginSchemaKeys = joi
    .object({
        username: joi.string(),
        email: joi.string().email(),
        password: joi.string().required(),
    })
    .xor('username', 'email');

export const changePasswordSchemaKeys = joi
    .object({
        oldPassword: joi.string().required(),
        newPassword: joi.string().required(),
    })
    .unknown(true);
