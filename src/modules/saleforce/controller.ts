//Packages
import { NextFunction, Request, Response } from "express";

//Service
import { saleForceAuth, saleForceCallBack } from "./service";
import { HttpStatusCode } from "../../config/auth";
import { AppError } from "../../error";


export const handlerSaleForceAuth = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { connectionId } = request.query
        if (!connectionId) {
            throw new AppError("Missing connectionId param", HttpStatusCode.BadRequest);
        }

        const authURL = await saleForceAuth(connectionId as string)

        response.redirect(authURL);
    } catch (error) {
        next(error)
    }
};

export const handlerSaleForceCallBack = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const code = request.query.code as string;
        const { code: code1 } = request.params
        console.log(code, code1, request.body, "TESTING_123")
        if (!code) {
            throw new AppError("Missing code param", HttpStatusCode.BadRequest);
        }

        const state = request.query.state as string;
        if (!state) {
            throw new AppError("Missing state param", HttpStatusCode.BadRequest);
        }

        await saleForceCallBack(code, state)

        response.status(200).json({
            message: "Salesforce authentication and subscription complete!",
            status: 200,
        });
    } catch (error) {
        next(error);
    }
};



