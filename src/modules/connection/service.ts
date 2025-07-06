//Packages
import jsforce from "jsforce";
import Odoo from "odoo-xmlrpc";

//Lib
import { CONNECTION_STATUS, CRM_SERVICE, HttpStatusCode } from "../../config/auth";
import { AddConnectionPayload, UpdateConnectionPayload } from "./validation";
import { OdooCredentials, SaleForcesCredentials } from "./interface";
import { decryptData, encryptData } from "../../utils/encrypt";
import { connectOdoo, executeOdoo } from "../../crm/odoo";
import { AppError } from "../../error";
import Connection from "./model";


export const getConnections = async (userId: string, page: number, limit: number, type?: string) => {
    try {
        const offset = ((page - 1) * limit)
        let connections
        let totalConnections

        if (type) {
            connections = await Connection.find({ userId: userId, "type": type }).skip(offset).limit(limit)
            totalConnections = await Connection.countDocuments({ userId: userId, "type": type });
        } else {
            connections = await Connection.find({ userId: userId }).skip(offset).limit(limit)
            totalConnections = await Connection.countDocuments();
        }

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalConnections / limit),
        }

        return { connections, meta }
    } catch (error) {
        throw error
    }
}


export const getConnection = async (userId: string, id: string) => {
    try {
        const connection = await Connection.findOne({ "uuid": id, userId: userId })
        if (!connection) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }

        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const decriptedConnection = {
            id: connection._id,
            uuid: connection.uuid,
            userId: connection.userId,
            type: connection.type,
            name: connection.name,
            credentials: JSON.parse(decriptedCredentials),
            createdAt: connection.createdAt,
            updatedAt: connection.updatedAt,
        }

        return decriptedConnection
    } catch (error) {
        throw error
    }
}


export const createConnection = async (userId: string, payload: AddConnectionPayload) => {
    try {
        const connectionExists = await Connection.findOne({ name: payload.name, userId: userId });
        if (connectionExists) {
            throw new AppError("Connection already exists", HttpStatusCode.BadRequest);
        }

        const uuid = crypto.randomUUID()
        const encryptedCredentials = encryptData(JSON.stringify(payload?.credentials))
        const newConnection = {
            uuid: uuid,
            name: payload.name,
            userId: userId,
            type: payload.type,
            credentials: encryptedCredentials,
        }

        await Connection.create(newConnection);

        return newConnection
    } catch (error) {
        throw error
    }
}


export const updateConnection = async (userId: string, payload: UpdateConnectionPayload, id: string) => {
    try {
        let updateSection = {
            ...payload,
            credentials: encryptData(JSON.stringify(payload.credentials))
        }

        const result = await Connection.updateOne({ "uuid": id, userId: userId }, { "$set": updateSection });
        if (result.matchedCount === 0) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}


export const deleteConnection = async (userId: string, id: string) => {
    try {
        const result = await Connection.deleteOne({ uuid: id, userId: userId })
        if (result.deletedCount === 0) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }

    } catch (error) {
        throw error
    }
}


export const getModels = async (userId: string, id: string) => {
    try {
        const connection = await Connection.findOne({ "uuid": id, userId: userId, "status": CONNECTION_STATUS.Active })
        if (!connection) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }

        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const domain = process.env.APP_DOMAIN

        if (connection.type === CRM_SERVICE.SaleForce) {
            const credential: SaleForcesCredentials = JSON.parse(decriptedCredentials)

            const oauth2 = new jsforce.OAuth2({
                loginUrl: "https://login.salesforce.com",
                redirectUri: `${domain}/api/v1/order/callback`,
                clientSecret: credential.clientSecret,
                clientId: credential.clientId,
            });

            const conn = new jsforce.Connection({
                instanceUrl: credential?.config?.instanceUrl,
                accessToken: credential?.config?.accessToken,
                refreshToken: credential?.config?.refreshToken,
                oauth2: oauth2,
            });

            const { sobjects } = await conn.describeGlobal();

            return sobjects
        } else if (connection.type === CRM_SERVICE.Odoo) {
            const credential: OdooCredentials = JSON.parse(decriptedCredentials)
            const odoo = new Odoo({
                url: credential.url,
                db: credential.database,
                username: credential.username,
                password: credential.password,
            });
            await connectOdoo(odoo)
            const models = await executeOdoo(odoo, 'ir.model', 'search_read',
                [[], ['model', 'name']],
                { limit: 1000 } // Optional: get first 1000 models
            );

            return models
        } else {
            throw new AppError("Connection type does not exists", HttpStatusCode.BadRequest);
        }
    } catch (error) {
        throw error
    }
}


export const getModelField = async (userId: string, id: string, modelName: string) => {
    try {
        const connection = await Connection.findOne({ "uuid": id, userId: userId, "status": CONNECTION_STATUS.Active })
        if (!connection) {
            throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
        }

        const decriptedCredentials = decryptData(connection.credentials)
        if (!decriptedCredentials) {
            throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
        }

        const domain = process.env.APP_DOMAIN

        if (connection.type === CRM_SERVICE.SaleForce) {
            const credential: SaleForcesCredentials = JSON.parse(decriptedCredentials)

            const oauth2 = new jsforce.OAuth2({
                loginUrl: "https://login.salesforce.com",
                redirectUri: `${domain}/api/v1/order/callback`,
                clientSecret: credential.clientSecret,
                clientId: credential.clientId,
            });

            const conn = new jsforce.Connection({
                instanceUrl: credential?.config?.instanceUrl,
                accessToken: credential?.config?.accessToken,
                refreshToken: credential?.config?.refreshToken,
                oauth2: oauth2,
            });

            const { fields } = await conn.sobject(modelName).describe();
            return fields
        } else if (connection.type === CRM_SERVICE.Odoo) {
            const credential: OdooCredentials = JSON.parse(decriptedCredentials)
            const odoo = new Odoo({
                url: credential.url,
                db: credential.database,
                username: credential.username,
                password: credential.password,
            });

            await connectOdoo(odoo)
            const fields = await executeOdoo(odoo, 'ir.model.fields', 'search_read',
                [[['model', '=', modelName]]],
            );

            return fields
        } else {
            throw new AppError("Connection type does not exists", HttpStatusCode.BadRequest);
        }
    } catch (error) {
        throw error
    }
}



