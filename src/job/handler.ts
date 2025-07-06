import Odoo from "odoo-xmlrpc";
import jsforce from "jsforce";

// Lib
import { CONNECTION_STATUS, CRM_SERVICE, FILE_INTEGRATION_STATUS, HttpStatusCode, INTEGRATION_STATUS, WEBHOOK_EVENT_STATUS } from "../config/auth";
import { decryptData, encryptData } from "../utils/encrypt";

// Modules
import { IIntegration } from "../modules/integration/interface";
import { FileIntegration } from "../modules/file-integration";
import { Integration } from "../modules/integration";
import { Connection } from "../modules/connection";

// Types
import { ConnectionJobPayload, FileIntegrationJobPayload, ScheduleIntegrationJobPayload } from "../utils/type/queue";
import { IConnection, OdooCredentials, SaleForcesCredentials } from "../modules/connection/interface";
import { NewCrmClient, NewCrmClientFile } from "../crm/factory";
import { WebhookEvent } from "../modules/webhook";
import { connectOdoo } from "../crm/odoo";
import { AppError } from "../error";


export async function checkingConnection(payload: ConnectionJobPayload) {
    let page = 1
    const limit = 20

    while (1) {
        const offset = ((page - 1) * limit)
        const userConnections = await Connection.find({ userId: payload.userId }).skip(offset).limit(limit)
        if (userConnections.length === 0) {
            break
        }

        const tasks = userConnections.map(async (conn) => {
            if (conn.type === CRM_SERVICE.Odoo) {
                await checkOdooConnection(conn)
            } else if (conn.type === CRM_SERVICE.SaleForce) {
                await checkSaleForceConnection(conn)
            }
        })

        await Promise.all(tasks)
        page += 1
    }

}

const checkSaleForceConnection = async (connection: IConnection) => {
    let status = CONNECTION_STATUS.Active

    try {
        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const credential: SaleForcesCredentials = JSON.parse(decriptedCredentials)
        if (!credential.config) {
            throw new Error("not setup")
        }

        const conn = new jsforce.Connection({
            accessToken: credential.config.accessToken,
            instanceUrl: credential.config.instanceUrl,
        });
        await conn.identity();

    } catch (error) {
        status = CONNECTION_STATUS.InActive
    }

    // Updating the status of connection
    if (status != connection.status) {
        const result = await Connection.updateOne({ "uuid": connection.uuid }, { "$set": { "status": status } });
        if (result.matchedCount === 0) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }
    }
}


const checkOdooConnection = async (connection: IConnection) => {
    let status = CONNECTION_STATUS.Active
    try {
        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const credential: OdooCredentials = JSON.parse(decriptedCredentials)

        const odoo = new Odoo({
            url: credential?.url ?? "",
            db: credential?.database ?? "",
            username: credential?.username ?? "",
            password: credential.password ?? "",
        });
        await connectOdoo(odoo)
    } catch (error) {
        status = CONNECTION_STATUS.InActive
    }

    // Updating the status of connection
    if (status != connection.status) {
        const result = await Connection.updateOne({ "uuid": connection.uuid }, { "$set": { "status": status } });
        if (result.matchedCount === 0) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }
    }
}



export async function fileIntegrationAddObject(payload: FileIntegrationJobPayload) {
    const fileIntegration = (await FileIntegration.aggregate([
        { $match: { uuid: payload.id } },
        {
            $lookup: {
                from: "connections", // Collection name
                localField: "connectionId", // your field on Integration
                foreignField: "uuid", // field on Connection
                as: "connection",
            }
        },
    ]))?.[0];

    if (fileIntegration.status !== INTEGRATION_STATUS.Active) {
        throw new AppError(`${fileIntegration.name} Integeation is inactive id: ${fileIntegration.uuid}`, HttpStatusCode.BadRequest);
    }

    const records = fileIntegration?.fileData
    let pending = records.length
    let completed = 0
    let failed = 0

    if (fileIntegration?.connection) {
        const connection = fileIntegration.connection[0]
        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const crmClient = NewCrmClientFile(decriptedCredentials, fileIntegration)
        for (let i = 0; i < records.length; i++) {
            try {
                crmClient?.actionFileRecord(records[i])
                completed += 1
            } catch (error) {
                failed += 1
            }

            pending -= 1
        }

        const result = await FileIntegration.updateOne({ "uuid": payload.id }, { "$set": { "pending": pending, "completed": completed, "failed": failed } });
        if (result.matchedCount === 0) {
            throw new AppError("FileIntegration does not exists", HttpStatusCode.BadRequest);
        }
    }

    const result = await FileIntegration.updateOne({ "uuid": payload.id }, { "$set": { "status": FILE_INTEGRATION_STATUS.Stop } });
    if (result.matchedCount === 0) {
        throw new AppError("FileIntegration does not exists", HttpStatusCode.BadRequest);
    }
}



export async function scheduleIntegrationAddObject(payload: ScheduleIntegrationJobPayload) {
    const integration: IIntegration = (await Integration.aggregate([
        { $match: { uuid: payload.id, } },
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

        const sourceConnection = await Connection.findOne({ "uuid": integration?.sourceConnectionId, "status": CONNECTION_STATUS.Active })
        if (!sourceConnection) {
            throw new AppError("Source Connection does not exists", HttpStatusCode.BadRequest);
        }

        const sourceDecriptedCredentials = decryptData(sourceConnection.credentials)
        if (!sourceDecriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        await crmClient?.setScheduleRecords(sourceDecriptedCredentials)

        const records = crmClient?.records
        if (!records) {
            throw new Error("did not set the get schedule data")
        }

        const dataJson = JSON.stringify(records)
        const encrypted = encryptData(dataJson)

        try {
            const recordPromises = records?.map(async (record) => {
                await crmClient?.action(record)
            })

            await Promise.all(recordPromises)

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

            const result = await Integration.updateOne({ "uuid": integration.uuid, userId: integration.userId }, {
                "$set": {
                    "initialTime": new Date().toISOString()
                }
            });

            if (result.matchedCount === 0) {
                throw new AppError("Integration does not exists", HttpStatusCode.BadRequest);
            }
        } catch (error) {
            const uuid = crypto.randomUUID()

            const errorJson = JSON.stringify(error)
            const encryptedError = encryptData(errorJson)

            const logEvent = {
                "uuid": uuid,
                "userId": integration.userId,
                "integrationId": integration.uuid,
                "status": WEBHOOK_EVENT_STATUS.Failed,
                "error": encryptedError,
                "payload": encrypted,
            }
            await WebhookEvent.create(logEvent)

            const result = await Integration.updateOne({ "uuid": integration.uuid, userId: integration.userId }, {
                "$set": {
                    "initialTime": new Date().toISOString()
                }
            });

            if (result.matchedCount === 0) {
                throw new AppError("Integration does not exists", HttpStatusCode.BadRequest);
            }
        }


    } catch (error) {
        const uuid = crypto.randomUUID()

        const errorJson = JSON.stringify(error)
        const encryptedError = encryptData(errorJson)

        const logEvent = {
            "uuid": uuid,
            "userId": integration.userId,
            "integrationId": integration.uuid,
            "status": WEBHOOK_EVENT_STATUS.Failed,
            "error": encryptedError,
        }
        await WebhookEvent.create(logEvent)

        const result = await Integration.updateOne({ "uuid": integration.uuid, userId: integration.userId }, {
            "$set": {
                "initialTime": new Date().toISOString()
            }
        });

        if (result.matchedCount === 0) {
            throw new AppError("Integration does not exists", HttpStatusCode.BadRequest);
        }
        throw error
    }
}





