//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";

//Service
import { createIntegration, deleteIntegration, getIntegration, getIntegrationInfo, updateIntegration, getIntegrations } from "./service";

//Validation
import { addIntegrationSchema, updateIntegrationSchema } from "./validation";

//App error
import { AppError } from "../../error";
import { AuthRequest } from "../../middleware/auth";

//Model
import Integration from "./model";


export const handlerGetIntegrations = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10 } = request.query;
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        
        console.log("=== DEBUG: Get Integrations ===");
        console.log("UserID:", request?.user?.id);
        console.log("User Role:", request?.user?.role);
        console.log("Page:", pageNum, "Limit:", limitNum);

        // Use the service layer instead of direct database queries
        const result = await getIntegrations(request?.user?.id as string, pageNum, limitNum);

        console.log("Service result:", result);
        console.log("=== END DEBUG ===");

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the integrations",
            status: HttpStatusCode.OK,
            data: result,
        });
    } catch (error) {
        console.error("Error in handlerGetIntegrations:", error);
        next(error);
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



