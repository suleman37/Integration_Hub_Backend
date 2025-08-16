import { AddIntegrationPayload, UpdateIntegrationPayload } from "./validation";
import { HttpStatusCode, INTEGRATION_TYPE, scheduleIntegrationJob } from "../../config/auth";
import { integrationQueue } from "../../job/integration_queue";
import { timeToCron } from "../../utils/lib";
import { Connection } from "../connection";
import { WebhookEvent } from "../webhook";
import { AppError } from "../../error";
import Integration from "./model";


export const getIntegrations = async (userId: string, page: number, limit: number) => {
    try {
        console.log("=== SERVICE DEBUG: getIntegrations ===");
        console.log("UserId:", userId);
        console.log("Page:", page, "Limit:", limit);
        
        const offset = ((page - 1) * limit)
        
        // First check if there are any integrations at all
        const allIntegrations = await Integration.find({});
        console.log("Total integrations in database:", allIntegrations.length);
        
        // Check if there are integrations for this specific user
        const userIntegrations = await Integration.find({ userId: userId });
        console.log("Integrations for user", userId, ":", userIntegrations.length);
        
        const integrations = await Integration.find({ userId: userId }).skip(offset).limit(limit).sort({ createdAt: -1 })
        const totalIntegrations = await Integration.countDocuments({ userId: userId });

        console.log("Final query result:", integrations);
        console.log("Total count for user:", totalIntegrations);
        console.log("=== END SERVICE DEBUG ===");

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalIntegrations / limit),
        }

        return { integrations, meta }
    } catch (error) {
        console.error("Error in getIntegrations service:", error);
        throw error
    }
}


export const getIntegrationInfo = async (userId: string) => {
    try {
        const totalIntegrations = await Integration.countDocuments({ "userId": userId });
        const totalConnection = await Connection.countDocuments({ "userId": userId });
        const totalWebhookEvents = await WebhookEvent.countDocuments({ "userId": userId });

        const info = {
            integration: totalIntegrations,
            connection: totalConnection,
            scheduleIntegration: 0,
            webhookEvent: totalWebhookEvents
        }

        return info
    } catch (error) {
        throw error
    }
}


export const getIntegration = async (userId: string, id: string) => {
    try {
        const integration = await Integration.findOne({ uuid: id, userId: userId })
        if (!integration) {
            throw new AppError("Integration does not exists", HttpStatusCode.BadRequest);
        }

        return integration
    } catch (error) {
        throw error
    }
}


export const createIntegration = async (userId: string, payload: AddIntegrationPayload) => {
    try {
        const integrationExists = await Integration.findOne({ name: payload.name, userId: userId });
        if (integrationExists) {
            throw new AppError("Integration already exists", HttpStatusCode.BadRequest);
        }

        const uuid = crypto.randomUUID()
        const newIntegration: any = {
            uuid: uuid,
            ...payload,
            userId: userId
        }

        if (payload.type === INTEGRATION_TYPE.Scheduler) {
            newIntegration["initialTime"] = new Date().toISOString()
        }

        await Integration.create(newIntegration);

        if (payload.type === INTEGRATION_TYPE.Scheduler && payload?.startTime) {
            const pattern = timeToCron(payload?.startTime)
            if (!pattern) {
                throw Error("invalid time format")
            }

            integrationQueue.add(
                scheduleIntegrationJob,
                { id: uuid },
                {
                    attempts: 3,
                    repeat: {
                        pattern: pattern,
                    },
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                }
            );

        }

    } catch (error) {
        throw error
    }
}


export const updateIntegration = async (userId: string, payload: UpdateIntegrationPayload, id: string) => {
    try {
        if (payload.type === INTEGRATION_TYPE.Scheduler && payload.startTime) {
            payload.initialTime = new Date().toISOString()
        }

        const result = await Integration.updateOne({ "uuid": id, userId: userId }, { "$set": payload });
        if (result.matchedCount === 0) {
            throw new AppError("Integration does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}


export const deleteIntegration = async (userId: string, id: string) => {
    try {
        const result = await Integration.deleteOne({ "uuid": id, userId: userId })
        if (result.deletedCount === 0) {
            throw new AppError("Integration does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}



