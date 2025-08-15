import { AddFileIntegrationPayload, UpdateFileIntegrationPayload } from "./validation";
import { FILE_INTEGRATION_STATUS, HttpStatusCode } from "../../config/auth";
import { addFileIntegrationJob } from "../../job/integration_queue";
import { AppError } from "../../error";
import FileIntegration from "./model";


export const getFileIntegrations = async (userId: string, page: number, limit: number) => {
    try {
        const offset = ((page - 1) * limit)
        const integrations = await FileIntegration.find({ userId: userId }).skip(offset).limit(limit)
        const totalFileIntegrations = await FileIntegration.countDocuments();

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalFileIntegrations / limit),
        }

        return { integrations, meta }
    } catch (error) {
        throw error
    }
}


export const getFileIntegration = async (userId: string, id: string) => {
    try {
        const integration = await FileIntegration.findOne({ uuid: id, userId: userId })
        if (!integration) {
            throw new AppError("FileIntegration does not exists", HttpStatusCode.BadRequest);
        }

        return integration
    } catch (error) {
        throw error
    }
}


export const createFileIntegration = async (userId: string, payload: AddFileIntegrationPayload) => {
    try {
        const integrationExists = await FileIntegration.findOne({ name: payload.name, userId: userId });
        if (integrationExists) {
            throw new AppError("FileIntegration already exists", HttpStatusCode.BadRequest);
        }

        const uuid = crypto.randomUUID()
        const newFileIntegration = {
            uuid: uuid,
            userId: userId,
            ...payload,
        }

        await FileIntegration.create(newFileIntegration);

    } catch (error) {
        throw error
    }
}


export const updateFileIntegration = async (userId: string, payload: UpdateFileIntegrationPayload, id: string) => {
    try {
        const result = await FileIntegration.updateOne({ "uuid": id, userId: userId }, { "$set": payload });
        if (result.matchedCount === 0) {
            throw new AppError("FileIntegration does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}


export const runFileIntegration = async (userId: string, id: string) => {
    try {
        const result = await FileIntegration.updateOne({ "uuid": id, userId: userId }, { "$set": { "status": FILE_INTEGRATION_STATUS.Running } });
        if (result.matchedCount === 0) {
            throw new AppError("FileIntegration does not exists", HttpStatusCode.BadRequest);
        }

        //After that we will start processing the file in backgorund using the job
        await addFileIntegrationJob({ id: id })

    } catch (error) {
        throw error
    }
}



export const deleteFileIntegration = async (userId: string, id: string) => {
    try {
        const result = await FileIntegration.deleteOne({ userId: userId, "uuid": id })
        if (result.deletedCount === 0) {
            throw new AppError("FileIntegration does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}



