import { ObjectId } from "mongoose";
import { WEBHOOK_EVENT_STATUS } from "../../config/auth";


export interface IWebhookEvent extends Document {
    _id: ObjectId,
    uuid: string;
    userId: string;
    integrationId: string;
    status: WEBHOOK_EVENT_STATUS;
    payload?: any;
    error?: any;
    createdAt: string;
    updatedAt: string;
}




