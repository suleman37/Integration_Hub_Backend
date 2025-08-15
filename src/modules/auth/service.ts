//Packages
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import argon2 from "argon2"
import crypto from "crypto"

//Types
import { RegisterPayload } from "../../utils/type/auth";

//Config
import { ACCESS_TOKEN_SECRET, accessExpireTime, HttpStatusCode, REFRESH_TOKEN_SECRET } from "../../config/auth";
import { addConnectionCheckingJob } from "../../job/connection_queue";
import { AppError } from "../../error";
import { User } from "../user";


export const register = async (user: RegisterPayload) => {
    try {
        const userExists = await User.findOne({ email: user.email });
        if (userExists) {
            throw new AppError("User already exists", HttpStatusCode.BadRequest);
        }

        const htmlContent = ` < !DOCTYPE html>
            <html>
            <head>
            <title>Account Created </title>
                </head>
                <body>
                   <h2>Account Created Successfully </h2>
                   <p> Your account has been created.Here are your login details: </p>
                   <p> Email: ${user.email}</p>
                   <p> Password: ${user.password}</p>
                </body>
           </html>`

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Your account is registered",
            html: htmlContent,
        };

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail(mailOptions);

        await User.create(user);
        await addConnectionCheckingJob({ userId: user.uuid });
    } catch (error) {
        throw error
    }
}


export const login = async (email: string, password: string) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError("User does not exists", HttpStatusCode.Unauthorized);
        }

        const isMatch = await user?.comparePassword(password)
        if (!isMatch) {
            throw new AppError("Invalid password", HttpStatusCode.Unauthorized);
        }

        const tokens = await user.generateTokens()

        const userWithToken = {
            uuid: user.uuid,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isReset: user.isReset,
            ...tokens
        }

        return userWithToken
    } catch (error) {
        throw error
    }
}


export const forgetPassword = async (email: string, password: string) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new AppError("User does not exists", HttpStatusCode.Unauthorized);
        }

        const passwordOption: argon2.Options = {
            timeCost: 4,
            memoryCost: 1024 * 8,
            parallelism: 2,
            hashLength: 32,
            salt: crypto.randomBytes(16),
        }

        const hash = await argon2.hash(password, passwordOption);
        await User.updateOne({ email: email }, { "$set": { password: hash, isReset: false } })

    } catch (error) {
        throw error
    }
}


export const logOut = async (refreshToken: string) => {
    try {
        const user = await User.findOne({ refreshToken })
        if (!user) {
            throw new AppError("Invalid refresh token", HttpStatusCode.BadRequest);
        }

        await User.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } });
    } catch (error) {
        throw error
    }
}

export const refreshToken = async (refreshToken: string) => {
    try {
        const user = await User.findOne({ refreshToken: refreshToken });
        if (!user) {
            throw new AppError("Invalid refresh token: User not found", HttpStatusCode.Unauthorized);
        }

        let decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { id: string, role: string };
        if (user?.uuid !== decoded?.id) {
            throw new AppError("Invalid refresh token: User ID mismatch", HttpStatusCode.Unauthorized);
        }

        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, ACCESS_TOKEN_SECRET, {
            expiresIn: accessExpireTime,
        });

        return newAccessToken
    } catch (error: any) {
        if (error?.name === "TokenExpiredError") {
            throw new AppError("Session expired. Please log in again.", HttpStatusCode.Unauthorized);
        }

        throw error
    }
}



