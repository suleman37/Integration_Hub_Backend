import { Document, ObjectId } from "mongoose";
import { FILE_INTEGRATION_STATUS } from "../../config/auth";


export interface IFileIntegration extends Document {
    _id: ObjectId,
    uuid: string;
    userId: string;
    name: string;
    adaptor: string;
    connectionId: string;
    service: string;
    fileData: any[];
    connectionFields: any[];
    fileFields: any[];
    pending: number;
    completed: number;
    failed: number;
    status: FILE_INTEGRATION_STATUS;
    createdAt: string;
    updatedAt: string;
}



