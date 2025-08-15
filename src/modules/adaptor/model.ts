import mongoose, { Schema } from "mongoose";
import { IAdaptor } from "./interface";

const fieldSchema: Schema = new Schema(
    {
        name: { type: String, require: true },
        label: { type: String, require: true },
    },
);

const adaptorSchema: Schema = new Schema(
    {
        uuid: { type: String, require: true, unique: true },
        name: { type: String, require: true },
        description: { type: String, require: true },
        version: { type: String, require: true },
        iconPath: { type: String, require: true },
        fields: [fieldSchema],
    },
    { timestamps: true }
);


export default mongoose.model<IAdaptor>("Adaptor", adaptorSchema);


