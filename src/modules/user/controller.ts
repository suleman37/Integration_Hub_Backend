
//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode, ROLE } from "../../config/auth";

//Service
import { createUser, deleteUsers, getUserById, getUsers, updateUser } from "./service";

//App error
import { AppError } from "../../error";

//Validation
import { createUserSchema, updateUserSchema } from "./validation";

//Types
import { CreateUserPayload } from "../../utils/type/user";
import { AuthRequest } from "../../middleware/auth";


export const handlerGetUsers = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { page, limit } = request.query
        let tPage = 1
        let tLimit = 20

        if (page) {
            tPage = parseInt(page.toString())
        }

        if (limit) {
            tLimit = parseInt(limit.toString())
        }

        const { users, meta } = await getUsers(tPage, tLimit, request.user?.id as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the users",
            status: HttpStatusCode.OK,
            data: {
                meta: meta,
                users: users,
            }
        });
    } catch (error) {
        next(error)
    }
};



export const handlerGetUserId = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const user = await getUserById(id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the user",
            status: HttpStatusCode.OK,
            data: { user: user }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerCreateUser = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const validatedInput = createUserSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const { firstName, lastName, email, password } = validatedInput.data;
        const uuid = crypto.randomUUID()
        const registerPayload: CreateUserPayload = {
            uuid: uuid,
            firstName,
            lastName,
            email,
            password,
            organizationId: request.user?.id ?? "",
            role: ROLE.User,
        }

        await createUser(registerPayload, request.user?.id as string)

        response.status(HttpStatusCode.Created).json({
            message: "User is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateUser = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const validatedInput = updateUserSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const data = validatedInput.data;
        await updateUser(data, id)

        response.status(HttpStatusCode.Created).json({
            message: "User is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteUser = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteUsers(id, request?.user?.id as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the user",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};







