import { Document, ObjectId } from "mongoose";
import { CONNECTION_STATUS, CRM_SERVICE } from "../../config/auth";

export interface IConnection extends Document {
    _id: ObjectId,
    uuid: string;
    userId: string;
    name: string;
    status: CONNECTION_STATUS;
    type: CRM_SERVICE;
    credentials: string;
    createdAt: string;
    updatedAt: string;
}

export type OdooCredentials = {
    url: string,
    database: string;
    username: string;
    password: string;
}

export type SaleForcesCredentials = {
    clientId: string,
    clientSecret: string;
    config?: {
        accessToken: string;
        refreshToken: string;
        instanceUrl: string;
        userId: string;
        orgId: string;
    }
}



