import { NextFunction, Request, Response } from "express";
import { AppError } from "../error";


// 🎯 Middleware-based error handling (Centralized)
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.error("🔥 Error:", err.message);
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        status: err.statusCode || 500,
    });
};





