import mongoose, { Schema } from "mongoose";
import { IFileIntegration } from "./interface";
import { FILE_INTEGRATION_STATUS } from "../../config/auth";


const fileIntegrationSchema: Schema = new Schema(
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
            required: true
        },
        adaptor: {
            type: String,
            required: true
        },
        connectionId: {
            type: String,
            ref: "Connection",
            required: true
        },
        service: {
            type: String,
            required: true
        },
        pending: {
            type: Number,
            required: true,
        },
        completed: {
            type: Number,
            default: 0,
        },
        failed: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: [FILE_INTEGRATION_STATUS.Running, FILE_INTEGRATION_STATUS.Stop],
            default: FILE_INTEGRATION_STATUS.Stop,
            required: true,
        },
        fileFields: mongoose.Schema.Types.Mixed,
        connectionFields: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);


export default mongoose.model<IFileIntegration>("FileIntegration", fileIntegrationSchema);



