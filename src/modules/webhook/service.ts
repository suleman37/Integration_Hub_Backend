//Lib
import { CONNECTION_STATUS, HttpStatusCode, INTEGRATION_STATUS, WEBHOOK_EVENT_STATUS } from "../../config/auth";
import { decryptData, encryptData } from "../../utils/encrypt";
import { IIntegration } from "../integration/interface";
import { NewCrmClient } from "../../crm/factory";
import { Integration } from "../integration"
import { Connection } from "../connection";
import { AppError } from "../../error";
import WebhookEvent from "./model";


export const webhook = async (eventData: any, id: string, action: string, event: string) => {
    const integration: IIntegration = (await Integration.aggregate([
        { $match: { uuid: id, event: event, action: action } },
        {
            $lookup: {
                from: "connections", // Collection name
                localField: "sourceConnectionId", // your field on Integration
                foreignField: "uuid", // field on Connection
                as: "sourceConnection",
            }
        },
        {
            $lookup: {
                from: "connections",
                localField: "targetConnectionId",
                foreignField: "uuid",
                as: "targetConnection",
            }
        },
    ]))?.[0];

    if (integration.status !== INTEGRATION_STATUS.Active) {
        throw new AppError(`${integration.name} Integeation is inactive id: ${integration.uuid}`, HttpStatusCode.BadRequest);
    }

    try {
        const connection = await Connection.findOne({ "uuid": integration?.targetConnectionId, "status": CONNECTION_STATUS.Active })
        if (!connection) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }

        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const crmClient = NewCrmClient(decriptedCredentials, integration)
        await crmClient?.action(eventData)

        const dataJson = JSON.stringify(eventData)
        const encrypted = encryptData(dataJson)

        //Saving the events on completed 
        const uuid = crypto.randomUUID()
        const logEvent = {
            "uuid": uuid,
            "userId": integration.userId,
            "integrationId": integration.uuid,
            "status": WEBHOOK_EVENT_STATUS.Completed,
            "payload": encrypted,
        }
        await WebhookEvent.create(logEvent)
    } catch (error) {
        const uuid = crypto.randomUUID()

        const dataJson = JSON.stringify(eventData)
        const encryptedData = encryptData(dataJson)

        const errorJson = JSON.stringify(error)
        const encryptedError = encryptData(errorJson)

        const logEvent = {
            "uuid": uuid,
            "userId": integration.userId,
            "integrationId": integration.uuid,
            "status": WEBHOOK_EVENT_STATUS.Failed,
            "error": encryptedError,
            "payload": encryptedData,
        }
        await WebhookEvent.create(logEvent)
        throw error
    }
}


export const getWebhookEvents = async (page: number, limit: number, id: string, status: string, userId: string) => {
    try {
        const offset = ((page - 1) * limit)
        console.log(userId)
        const events = await WebhookEvent.find({ "integrationId": id, "status": status }).skip(offset).limit(limit)
        const decryptedEvents = events?.map((logEvt) => {
            const decryptedEvent = logEvt
            const decryptedData = decryptData(logEvt.payload)
            if (!decryptedData) {
                throw new AppError("Invalid event", HttpStatusCode.BadRequest);
            }

            const parseData = JSON.parse(decryptedData)
            decryptedEvent.payload = parseData
            if (status === WEBHOOK_EVENT_STATUS.Failed) {
                const decryptedError = decryptData(logEvt.error)
                if (!decryptedError) {
                    throw new AppError("Invalid event", HttpStatusCode.BadRequest);
                }

                const parseError = JSON.parse(decryptedError)
                decryptedEvent.error = parseError
            }

            return decryptedEvent
        })

        const totalEvents = await WebhookEvent.countDocuments({ "status": status });
        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalEvents / limit),
            total: totalEvents,
        }

        return { events: decryptedEvents, meta }
    } catch (error) {
        throw error
    }
}


export const allEventsTotal = async (userId: string) => {
    try {
        const totalSuccess = await WebhookEvent.countDocuments({ "status": WEBHOOK_EVENT_STATUS.Completed });
        const totalFailed = await WebhookEvent.countDocuments({ "status": WEBHOOK_EVENT_STATUS.Failed });
        const totalEvent = {
            success: totalSuccess,
            failed: totalFailed,
        }

        return totalEvent
    } catch (error) {
        throw error
    }
}

