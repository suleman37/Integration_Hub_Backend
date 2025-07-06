//Packages
import { NextFunction, Response } from "express";
import { HttpStatusCode } from "../../config/auth";

//Service
import { createFileIntegration, deleteFileIntegration, getFileIntegration, getFileIntegrations, runFileIntegration, updateFileIntegration } from "./service";

//Validation
import { addFileIntegrationSchema, updateFileIntegrationSchema } from "./validation";

//App error
import { AppError } from "../../error";
import { AuthRequest } from "../../middleware/auth";


export const handlerGetFileIntegrations = async (request: AuthRequest, response: Response, next: NextFunction) => {
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

        const result = await getFileIntegrations(request?.user?.id as string, tPage, tLimit)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the integrations",
            status: HttpStatusCode.OK,
            data: result,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerGetFileIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const integration = await getFileIntegration(request?.user?.id as string, id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the integration",
            status: HttpStatusCode.OK,
            data: {
                integration: integration
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerCreateFileIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const validatedInput = addFileIntegrationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const payload = validatedInput.data;
        await createFileIntegration(request?.user?.id as string, payload)

        response.status(HttpStatusCode.Created).json({
            message: "FileIntegration is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateFileIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params

        const validatedInput = updateFileIntegrationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const data = validatedInput.data;
        await updateFileIntegration(request?.user?.id as string, data, id)

        response.status(HttpStatusCode.Created).json({
            message: "FileIntegration is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};

export const handlerRunFileIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await runFileIntegration(request?.user?.id as string, id)

        response.status(HttpStatusCode.Created).json({
            message: "FileIntegration successfully started to run",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};




export const handlerDeleteFileIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteFileIntegration(request?.user?.id as string, id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the integration",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};



