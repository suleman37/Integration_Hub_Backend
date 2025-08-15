//Packages
import jsforce from "jsforce";
import Odoo from "odoo-xmlrpc"

//Lib
import { SaleForcesCredentials } from "../connection/interface";
import { decryptData, encryptData } from "../../utils/encrypt";
import { connectOdoo, executeOdoo } from "../../crm/odoo";
import { HttpStatusCode } from "../../config/auth";
import { Connection } from "../connection";
import { AppError } from "../../error";


export const getOrders = async (page: number, limit: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin' // Replace with your actual password or API key
        });
        await connectOdoo(odoo)

        const offset = (page - 1) * limit
        const orders = await executeOdoo(odoo, "sale.order", "search_read",
            [[], ["id", "name", "partner_id", "date_order", "amount_total"]],
            { offset, limit, order: "date_order desc" },
        )

        const totalCount = await executeOdoo(
            odoo,
            'sale.order',
            'search_count',
            [[]],
        );

        const meta = {
            page: page,
            limit: limit,
            totalPage: Math.ceil(totalCount as number / limit),
        }

        return { orders, meta }
    } catch (error) {
        throw error
    }
}

export const getOrder = async (name: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });

        await connectOdoo(odoo)
        return await executeOdoo(odoo, 'sale.order', 'search_read', [[["name", "=", name]]])
    } catch (error) {
        return null
    }
}


export const createOrder = async (order: any) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070/',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });

        await connectOdoo(odoo)
        await executeOdoo(odoo, 'sale.order', 'create', [[order]])
    } catch (error) {
        throw error
    }
}


export const updateOrder = async (order: any, id: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });
        await connectOdoo(odoo)
        await executeOdoo(odoo, 'sale.order', 'write', [[id], order])
    } catch (error) {
        console.log(error)
        throw error
    }
}


export const deleteOrder = async (id: number) => {
    try {
        const odoo = new Odoo({
            url: 'http://localhost:8070',
            db: 'odoo',
            username: 'admin',
            password: 'admin'
        });
        await connectOdoo(odoo)
        await executeOdoo(odoo, 'sale.order', 'unlink', [[id]])
    } catch (error) {
        throw error
    }
}


export const saleForceAuth = async (connectionId: string) => {
    const connection = await Connection.findOne({ "uuid": connectionId })
    if (!connection) {
        throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
    }

    const decriptedCredentials = decryptData(connection.credentials)
    if (!decriptedCredentials) {
        throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
    }

    const credentials: SaleForcesCredentials = JSON.parse(decriptedCredentials)
    const domain = process.env.APP_DOMAIN
    const oauth2 = new jsforce.OAuth2({
        loginUrl: "https://login.salesforce.com",
        redirectUri: `${domain}/api/v1/order/callback`,
        clientSecret: credentials.clientSecret,
        clientId: credentials.clientId,
    });

    const authURL = oauth2.getAuthorizationUrl({
        scope: "api refresh_token",
        state: JSON.stringify({ connectionId })
    });

    console.log(
        "Redirecting to Salesforce OAuth URL:",
        decodeURIComponent(authURL)
    );

    return authURL
}


export const saleForceCallBack = async (code: string, state: string) => {
    const parseState = JSON.parse(state)

    const connection = await Connection.findOne({ "uuid": parseState?.connectionId })
    if (!connection) {
        throw new AppError("Connection does not exists", HttpStatusCode.BadRequest);
    }

    const decriptedCredentials = decryptData(connection.credentials)
    if (!decriptedCredentials) {
        throw new AppError("Internal server error", HttpStatusCode.InternalServerError);
    }

    const credentials: SaleForcesCredentials = JSON.parse(decriptedCredentials)
    const domain = process.env.APP_DOMAIN
    const oauth2 = new jsforce.OAuth2({
        loginUrl: "https://login.salesforce.com",
        redirectUri: `${domain}/api/v1/order/callback`,
        clientSecret: credentials.clientSecret,
        clientId: credentials.clientId,
    });

    const conn = new jsforce.Connection({ oauth2 });
    const userInfo = await conn.authorize(code);
    const userAccessInfo: SaleForcesCredentials = {
        ...credentials,
        config: {
            accessToken: conn.accessToken ?? "",
            refreshToken: conn.refreshToken ?? "",
            instanceUrl: conn.instanceUrl,
            userId: userInfo.id,
            orgId: userInfo.organizationId,
        }
    };

    const updatedCredentials = JSON.stringify(userAccessInfo)
    const encryptedCredentials = encryptData(updatedCredentials)
    await Connection.updateOne({ "uuid": parseState?.connectionId }, { credentials: encryptedCredentials })
}







