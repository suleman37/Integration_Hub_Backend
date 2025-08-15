import mongoose, { Schema } from "mongoose";
import { IConnection } from "./interface";
import { CONNECTION_STATUS, CRM_SERVICE } from "../../config/auth";


const connectionSchema: Schema = new Schema(
    {
        uuid: { type: String, require: true },
        userId: { type: String, ref: "User", require: true, },
        name: { type: String, require: true },
        status: {
            type: String,
            enum: [CONNECTION_STATUS.Active, CONNECTION_STATUS.InActive],
            default: CONNECTION_STATUS.Active,
            required: true
        },
        type: {
            type: String,
            enum: [CRM_SERVICE.Odoo, CRM_SERVICE.SaleForce],
            require: true
        },
        credentials: { type: String, require: true },
    },
    { timestamps: true }
);


export default mongoose.model<IConnection>("Connection", connectionSchema);



