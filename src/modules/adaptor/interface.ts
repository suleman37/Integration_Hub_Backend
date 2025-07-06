import { Document, ObjectId } from "mongoose";

export type FieldType = {
    name: string;
    label: string;
}


export interface IAdaptor extends Document {
    _id: ObjectId,
    uuid: string;
    name: string;
    description: string;
    version: string;
    iconPath: string;
    fields: FieldType[];
    createdAt: string;
    updatedAt: string;
}


