import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";
import { allEventsTotal, getWebhookEvents, webhook } from "./service";
import { AuthRequest } from "../../middleware/auth";


export const handlerWebhook = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { action, event } = request.query
        const { id } = request.params
        const data = await request.body

        await webhook(data, id, action as string, event as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully completed webhook",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
}


export const handlerWebhookEvents = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const { page, limit, status } = request.query
        let tPage = 1
        let tLimit = 20

        if (page) {
            tPage = parseInt(page.toString())
        }

        if (limit) {
            tLimit = parseInt(limit.toString())
        }

        const data = await getWebhookEvents(tPage, tLimit, id as string, status as string, request.user?.id as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the webhook events",
            status: HttpStatusCode.OK,
            data: data
        });
    } catch (error) {
        next(error)
    }
}


export const handlerAllEventsTotal = async (request: AuthRequest, response: Response, next: NextFunction) => {
    try {
        console.log(request.user)
        const data = await allEventsTotal(request.user?.id as string)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the webhook events total of success and failed count",
            status: HttpStatusCode.OK,
            data: data
        });
    } catch (error) {
        next(error)
    }
}

