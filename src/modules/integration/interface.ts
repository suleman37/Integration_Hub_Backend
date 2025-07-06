import { Document, ObjectId } from "mongoose";
import { CRM_ACTION, CRM_EVENT, INTEGRATION_STATUS } from "../../config/auth";


export interface IIntegration extends Document {
    _id: ObjectId,
    uuid: string;
    userId: string;
    name: string;
    description: string;
    version: string;
    sourceAdaptorId: string;
    targetAdaptorId: string;
    sourceConnectionId: string;
    targetConnectionId: string;
    sourceModel: string;
    targetModel: string;
    sourceField: any[];
    targetField: any[];
    status: INTEGRATION_STATUS;
    event: CRM_EVENT;
    action: CRM_ACTION;
    initialTime?: string;
    startTime?: string;
    createdAt: string;
    updatedAt: string;
}



