import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../../config/auth";
import { AppError } from "../../error";
import path from "path";
import fs from "fs";


export const handlerUploadImage = async (request: Request, response: Response, next: NextFunction) => {
    try {
        if (!request?.file) {
            throw new AppError("No file is uploaded", HttpStatusCode.BadRequest);
        }

        response.status(HttpStatusCode.Created).json({
            message: "Image is uploaded successfully",
            status: HttpStatusCode.Created,
            data: {
                "imagePath": request.file.filename
            }
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteFile = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { filename } = request.params;
        const filePath = path.join(__dirname, "../../../storage/images", filename); // Full file path

        if (!fs.existsSync(filePath)) {
            throw new AppError("File not found", HttpStatusCode.BadRequest);
        }

        fs.unlink(filePath, (err) => {
            if (err) {
                throw new AppError("Error deleting file", HttpStatusCode.InternalServerError);
            }

            response.status(HttpStatusCode.Created).json({
                message: "File deleted successfully",
                status: HttpStatusCode.OK,
            });
        });
    } catch (error) {
        next(error)
    }
};



