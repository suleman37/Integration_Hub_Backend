import nodemailer from "nodemailer";
import { CreateUserPayload, UpdateUserPayload } from "../../utils/type/user";
import { addConnectionCheckingJob } from "../../job/connection_queue";
import { HttpStatusCode, ROLE } from "../../config/auth";
import { AppError } from "../../error";
import User from "./model";
import { decryptData } from "../../utils/encrypt";
import argon2 from "argon2"
import crypto from "crypto"


export const getUsers = async (page: number, limit: number, organizationId: string) => {
    try {
        const offset = ((page - 1) * limit)
        let users = await User.find({ role: ROLE.User, organizationId: organizationId }).skip(offset).limit(limit)
        const totalUsers = await User.countDocuments();

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.floor((totalUsers - 1) / limit),
        }

        return { users, meta }
    } catch (error) {
        throw error
    }
}


export const getUserById = async (id: string) => {
    try {
        const user = await User.findOne({ uuid: id })
        if (!user) {
            throw new AppError("User does not exists", HttpStatusCode.BadRequest);
        }

        return user
    } catch (error) {
        throw error
    }
}


export const createUser = async (user: CreateUserPayload, organizationId: string) => {
    try {
        const userExists = await User.findOne({ email: user.email, role: ROLE.User, organizationId: organizationId });
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


export const updateUser = async (user: UpdateUserPayload, id: string) => {
    try {
        const result = await User.updateOne({ uuid: id }, { "$set": user });
        if (result.matchedCount === 0) {
            throw new AppError("User does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}

export const deleteUsers = async (id: string, organizationId: string) => {
    try {
        const result = await User.deleteOne({ uuid: id, role: ROLE.User, organizationId: organizationId })
        if (result.deletedCount === 0) {
            throw new AppError("User does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}





