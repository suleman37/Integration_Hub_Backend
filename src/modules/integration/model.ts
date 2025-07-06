import mongoose, { Schema } from "mongoose";
import { IIntegration } from "./interface";
import { CRM_ACTION, CRM_EVENT, INTEGRATION_STATUS, INTEGRATION_TYPE } from "../../config/auth";


const integrationSchema: Schema = new Schema(
    {
        uuid: {
            type: String,
            require: true,
            unique: true
        },
        userId: {
            type: String,
            ref: "User",
            require: true
        },
        name: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        version: {
            type: String,
            require: true
        },
        sourceAdaptorId: {
            type: String,
            ref: "Adaptor",
            required: true
        },
        targetAdaptorId: {
            type: String,
            ref: "Adaptor",
            required: true
        },
        sourceConnectionId: {
            type: String,
            ref: "Connection",
            required: true
        },
        targetConnectionId: {
            type: String,
            ref: "Connection",
            required: true
        },
        sourceModel: {
            type: String,
            required: true
        },
        targetModel: {
            type: String,
            required: true
        },
        event: {
            type: String,
            required: true,
            enum: [CRM_EVENT.OnCreate, CRM_EVENT.OnUpdate, CRM_EVENT.OnDelete],
        },
        action: {
            type: String,
            required: true,
            enum: [CRM_ACTION.Create, CRM_ACTION.Update],
        },
        type: {
            type: String,
            enum: [INTEGRATION_TYPE.Webhook, INTEGRATION_TYPE.Scheduler],
            required: true
        },
        startTime: {
            type: String,
        },
        initialTime: {
            type: String,
        },
        sourceField: mongoose.Schema.Types.Mixed,
        targetField: mongoose.Schema.Types.Mixed,
        status: {
            type: String,
            enum: [INTEGRATION_STATUS.Active, INTEGRATION_STATUS.InActive],
            default: INTEGRATION_STATUS.Active,
            required: true
        },
    },
    { timestamps: true }
);


export default mongoose.model<IIntegration>("Integration", integrationSchema);



