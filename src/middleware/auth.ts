import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

import { ACCESS_TOKEN_SECRET, ROLE } from "../config/auth";


// Define a custom interface extending Express Request to include `user`
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: ROLE;
    };
}


export const authenticate = (request: AuthRequest, response: Response, next: NextFunction) => {
    const token = request.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        response.status(401).json({ "message": "Unauthorize user" })
        return
    }

    try {
        const decode = jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthRequest["user"]
        request.user = decode
        next()
    } catch (error) {
        response.status(401).json({ "message": "Unauthorize user" })
    }
}


// Ensure correct type compatibility for Express middleware
export const authorize =
    (...allowedRoles: ROLE[]) =>
        (request: AuthRequest, response: Response, next: NextFunction) => {
            if (!request.user || !allowedRoles.includes(request.user.role)) {
                response.status(403).json({ message: "Forbidden access" });
                return
            }
            next();
        };


