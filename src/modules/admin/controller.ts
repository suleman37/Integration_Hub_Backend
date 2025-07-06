
//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode, ROLE } from "../../config/auth";

//Service
import { createAdmin, deleteAdmin, getAdmins, updateAdmin } from "./service";

//App error
import { AppError } from "../../error";

//Validation
import { createAdminSchema, updateAdminSchema } from "./validation";

//Types
import { CreateAdminPayload } from "../../utils/type/user";


export const handlerGetAdmins = async (request: Request, response: Response, next: NextFunction) => {
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

        const data = await getAdmins(tPage, tLimit)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the admins",
            status: HttpStatusCode.OK,
            data: data,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerCreateAdmin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = createAdminSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const { firstName, lastName, email, password, organization } = validatedInput.data;
        const uuid = crypto.randomUUID()
        const registerPayload: CreateAdminPayload = {
            uuid: uuid,
            firstName,
            lastName,
            email,
            password,
            organization: organization,
            role: ROLE.Admin,
        }

        await createAdmin(registerPayload)

        response.status(HttpStatusCode.Created).json({
            message: "Admin is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateAdmin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const validatedInput = updateAdminSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const data = validatedInput.data;
        await updateAdmin(data, id)

        response.status(HttpStatusCode.Created).json({
            message: "Admin is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteAdmin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteAdmin(id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the admin",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};







