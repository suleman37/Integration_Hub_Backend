import mongoose, { Schema } from "mongoose";
import { IWebhookEvent } from "./interface";
import { WEBHOOK_EVENT_STATUS } from "../../config/auth";


const connectionSchema: Schema = new Schema(
    {
        uuid: { type: String, require: true },
        userId: {
            type: String,
            ref: "User",
            require: true,
        },
        integrationId: {
            type: String,
            ref: "Integration",
            require: true,
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
        },
        error: {
            type: mongoose.Schema.Types.Mixed,
        },
        status: {
            type: String,
            enum: [WEBHOOK_EVENT_STATUS.Completed, WEBHOOK_EVENT_STATUS.Failed],
            required: true
        },

    },
    { timestamps: true }
);


export default mongoose.model<IWebhookEvent>("WebhookEvent", connectionSchema);



