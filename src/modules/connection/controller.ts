//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";

//Service
import { createConnection, deleteConnection, getConnection, getConnections, getModelField, getModels, updateConnection } from "./service";

//Validation
import { addConnectionSchema, updateConnectionSchema } from "./validation";

//App error
import { AppError } from "../../error";
import { AuthRequest } from "../../middleware/auth";


export const handlerGetConnections = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { page, limit, type } = request.query
        let tPage = 1
        let tLimit = 20

        if (page) {
            tPage = parseInt(page.toString())
        }

        if (limit) {
            tLimit = parseInt(limit.toString())
        }
        console.log(request.user)
        const { connections, meta } = await getConnections(request.user?.id as string, tPage, tLimit, type as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the connections",
            status: HttpStatusCode.OK,
            data: {
                meta: meta,
                connections: connections,
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerGetConnection = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const connection = await getConnection(request.user?.id as string, id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the user",
            status: HttpStatusCode.OK,
            data: {
                connection: connection
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerCreateConnection = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const validatedInput = addConnectionSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const payload = validatedInput.data;
        const connection = await createConnection(request.user?.id as string, payload)

        response.status(HttpStatusCode.Created).json({
            message: "Connection is created successfully",
            status: HttpStatusCode.Created,
            data: {
                connection: connection
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateConnection = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params

        const validatedInput = updateConnectionSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const data = validatedInput.data;
        await updateConnection(request.user?.id as string, data, id)

        response.status(HttpStatusCode.Created).json({
            message: "Connection is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteConnection = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteConnection(request.user?.id as string, id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the user",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};



export const handlerGetModels = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const models = await getModels(request.user?.id as string, id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the models",
            status: HttpStatusCode.OK,
            data: {
                models: models
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerGetModelField = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id, modelName } = request.params
        const fields = await getModelField(request.user?.id as string, id, modelName)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the model fields",
            status: HttpStatusCode.OK,
            data: {
                fields: fields
            }
        });
    } catch (error) {
        next(error)
    }
};




