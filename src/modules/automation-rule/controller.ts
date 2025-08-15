//Packages
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";

//Service
import { createAutomationRule, deleteAutomationRule, getAutomationRule, getAutomationRules, updateAutomationRule } from "./service";
import { AppError } from "../../error";
import { createAutomationSchema, updateAutomationSchema } from "./validation";

export const handlerGetAutomationRules = async (request: Request, response: Response, next: NextFunction) => {
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

        const data = await getAutomationRules(tPage, tLimit)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the automation-rule",
            status: HttpStatusCode.OK,
            data: data,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerGetAutomationRule = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const result = await getAutomationRule(parseInt(id))

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the automation-rule",
            status: HttpStatusCode.OK,
            data: result,
        });
    } catch (error) {
        next(error)
    }
};



export const handlerCreateAutomationRule = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validatedInput = createAutomationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const payload = validatedInput.data;
        await createAutomationRule(payload)

        response.status(HttpStatusCode.Created).json({
            message: "Automation rule is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateAutomationRule = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const validatedInput = updateAutomationSchema.safeParse(request.body)
        if (!validatedInput.success) {
            throw new AppError(validatedInput?.error?.errors[0]?.message, HttpStatusCode.BadRequest);
        }

        const payload = validatedInput.data;
        await updateAutomationRule(payload, parseInt(id))

        response.status(HttpStatusCode.Created).json({
            message: "AutomationRule is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteAutomationRule = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteAutomationRule(parseInt(id))

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the automation-rule",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};



