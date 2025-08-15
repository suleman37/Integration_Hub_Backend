import nodemailer from "nodemailer";
import { addConnectionCheckingJob } from "../../job/connection_queue";
import { CreateAdminPayload, UpdateAdminPayload } from "../../utils/type/user";
import { HttpStatusCode, ROLE } from "../../config/auth";
import { AppError } from "../../error";
import { User } from "../user";


export const getAdmins = async (page: number, limit: number) => {
    try {
        const offset = ((page - 1) * limit)
        let users = await User.find({ role: ROLE.Admin }).skip(offset).limit(limit)
        const totalAdmins = await User.countDocuments();

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.floor((totalAdmins - 1) / limit),
        }

        return { users, meta }
    } catch (error) {
        throw error
    }
}


export const createAdmin = async (user: CreateAdminPayload) => {
    try {
        const userExists = await User.findOne({ email: user.email, role: ROLE.Admin });
        if (userExists) {
            throw new AppError("Admin already exists", HttpStatusCode.BadRequest);
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


export const updateAdmin = async (user: UpdateAdminPayload, id: string) => {
    try {
        const result = await User.updateOne({ uuid: id, role: ROLE.Admin }, { "$set": user });
        if (result.matchedCount === 0) {
            throw new AppError("Admin does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}

export const deleteAdmin = async (id: string) => {
    try {
        const result = await User.deleteOne({ uuid: id, role: ROLE.Admin })
        if (result.deletedCount === 0) {
            throw new AppError("Admin does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}



