
//Packages
import mongoose, { CallbackError, Schema } from "mongoose";
import argon2 from "argon2"
import crypto from "crypto"
import jwt from "jsonwebtoken";

import { GenerateTokens } from "../../utils/type/auth";
import { IUser } from "./interface";
import { ACCESS_TOKEN_SECRET, accessExpireTime, REFRESH_TOKEN_SECRET, refreshExpireTime, USER_STATUS } from "../../config/auth";


// Define Schema
const userSchema: Schema = new Schema(
    {
        uuid: { type: String, require: true },
        organizationId: {
            type: String,
            ref: "User",
        },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        organization: { type: String },
        isReset: {
            type: Boolean,
            default: true,
        },
        status: {
            type: String,
            enum: [USER_STATUS.Active, USER_STATUS.InActive],
            default: USER_STATUS.Active,
            required: true
        },
        role: { type: String, required: true },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

// Middleware to hash the password before saving
userSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        if (!this?.password) {
            throw new Error("now password attribute is founded")
        }

        const passwordOption: argon2.Options = {
            timeCost: 4,
            memoryCost: 1024 * 8,
            parallelism: 2,
            hashLength: 32,
            salt: crypto.randomBytes(16),
        }
        const hash = await argon2.hash(this?.password, passwordOption);
        this.password = hash;

        next();
    } catch (error) {
        return next(error as CallbackError);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (err) {
        return false;
    }
};


userSchema.methods.generateTokens = async function(this: IUser): Promise<GenerateTokens> {
    const payload = { id: this.uuid, role: this.role }
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: accessExpireTime }); // Access token (short-lived)
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: refreshExpireTime }); // Refresh token (longer-lived)
    this.refreshToken = refreshToken
    this.save()

    return { accessToken, refreshToken }
};



export default mongoose.model<IUser>("User", userSchema);

