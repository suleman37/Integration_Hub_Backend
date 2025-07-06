//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";

//Service
import { createAdaptor, deleteAdaptor, getAdaptor, getAdaptors, updateAdaptor } from "./service";

//Validation
import { addAdaptorSchema, updateAdaptorSchema } from "./validation";

//App error
import { AppError } from "../../error";


export const handlerGetAdaptors = async (request: Request, response: Response, next: NextFunction) => {
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

        const result = await getAdaptors(tPage, tLimit)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the adaptors",
            status: HttpStatusCode.OK,
            data: result,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerGetAdaptor = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const adaptor = await getAdaptor(id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the adaptor",
            status: HttpStatusCode.OK,
            data: {
                adaptor: adaptor
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerCreateAdaptor = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = addAdaptorSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const payload = validatedInput.data;
        await createAdaptor(payload)

        response.status(HttpStatusCode.Created).json({
            message: "Adaptor is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateAdaptor = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params

        const validatedInput = updateAdaptorSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const data = validatedInput.data;
        await updateAdaptor(data, id)

        response.status(HttpStatusCode.Created).json({
            message: "Adaptor is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteAdaptor = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteAdaptor(id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the adaptor",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};



