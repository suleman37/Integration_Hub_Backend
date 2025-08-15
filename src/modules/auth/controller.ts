//Packages
import { NextFunction, Request, Response } from "express";
import crypto from "crypto"

//Services
import { forgetPassword, login, logOut, refreshToken, register } from "./service";

//Validation Schema
import { forgetPasswordSchema, loginSchema, refreshTokenSchema, registrationSchema } from "./validation";

//Config
import { RegisterPayload } from "../../utils/type/auth";
import { HttpStatusCode, ROLE } from "../../config/auth";
import { AppError } from "../../error";


export const handlerRegister = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = registrationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const { firstName, lastName, email, password } = validatedInput.data;
        const uuid = crypto.randomUUID()
        const registerPayload: RegisterPayload = {
            uuid: uuid,
            firstName,
            lastName,
            email,
            password,
            role: ROLE.User,
        }

        await register(registerPayload)

        response.status(HttpStatusCode.Created).json({
            message: "User account is registered successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerLogin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = loginSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const { email, password } = validatedInput.data;
        const user = await login(email, password)

        response.status(HttpStatusCode.OK).json({
            message: "Login successfully",
            status: HttpStatusCode.OK,
            data: { user }
        });
    } catch (error) {
        next(error)
    }
};

export const handlerForgetPassword = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = forgetPasswordSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[1]?.message, HttpStatusCode.BadRequest);
        }

        const { email, password } = validatedInput.data;
        await forgetPassword(email, password)

        response.status(HttpStatusCode.OK).json({ message: "Successfully forget password" });
    } catch (error) {
        next(error)
    }
};

export const handlerLogout = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = refreshTokenSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const { refreshToken } = validatedInput.data;
        await logOut(refreshToken)

        response.status(HttpStatusCode.OK).json({ message: "Logged out successfully" });
    } catch (error) {
        next(error)
    }
};

export const handlerRefreshToken = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = refreshTokenSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const accessToken = await refreshToken(validatedInput.data?.refreshToken)

        response.status(HttpStatusCode.Created).json({
            message: "New access token is generated",
            status: HttpStatusCode.Created,
            data: {
                accessToken: accessToken,
            },
        });
    } catch (error) {
        next(error)
    }
}





