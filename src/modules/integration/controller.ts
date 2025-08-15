//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";

//Service
import { createIntegration, deleteIntegration, getIntegration, getIntegrationInfo, getIntegrations, updateIntegration } from "./service";

//Validation
import { addIntegrationSchema, updateIntegrationSchema } from "./validation";

//App error
import { AppError } from "../../error";
import { AuthRequest } from "../../middleware/auth";


export const handlerGetIntegrations = async (request: AuthRequest, response: Response, next: NextFunction) => {
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

        const result = await getIntegrations(request?.user?.id as string, tPage, tLimit)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the integrations",
            status: HttpStatusCode.OK,
            data: result,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerGetIntegrationInfo = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const result = await getIntegrationInfo(request?.user?.id as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the integrations",
            status: HttpStatusCode.OK,
            data: result,
        });
    } catch (error) {
        next(error)
    }
};



export const handlerGetIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const integration = await getIntegration(request?.user?.id as string, id)

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


export const handlerCreateIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const validatedInput = addIntegrationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const payload = validatedInput.data;
        await createIntegration(request?.user?.id as string, payload)

        response.status(HttpStatusCode.Created).json({
            message: "Integration is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params

        const validatedInput = updateIntegrationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const data = validatedInput.data;
        await updateIntegration(request?.user?.id as string, data, id)

        response.status(HttpStatusCode.Created).json({
            message: "Integration is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteIntegration = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteIntegration(request?.user?.id as string, id)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the integration",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};



