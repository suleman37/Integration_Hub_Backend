//Packages
import { NextFunction, Request, Response } from "express";
import jsforce, { Connection } from "jsforce";

//Service
import { createOrder, deleteOrder, getOrders, saleForceAuth, saleForceCallBack, updateOrder } from "./service";
import { HttpStatusCode } from "../../config/auth";
import { AppError } from "../../error";


export const handlerGetOrders = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { page, limit } = request.query
        let tPage = 1
        let tLimit = 20

        if (page) {
            tPage = parseInt(page.toString())
        }

        if (limit) {
            tLimit = parseInt(limit.toString())
        }

        const data = await getOrders(tPage, tLimit)

        response.status(HttpStatusCode.OK).json({
            message: "Successfully get the users",
            status: HttpStatusCode.OK,
            data: data,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerCreateOrder = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const data = request.body
        await createOrder(data)

        response.status(HttpStatusCode.Created).json({
            message: "Order is created successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerUpdateOrder = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        const data = request.body
        await updateOrder(data, parseInt(id))

        response.status(HttpStatusCode.Created).json({
            message: "Order is updated successfully",
            status: HttpStatusCode.Created
        });
    } catch (error) {
        next(error)
    }
};


export const handlerDeleteOrder = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.params
        await deleteOrder(parseInt(id))

        response.status(HttpStatusCode.OK).json({
            message: "Successfully deleted the user",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};


let userAccessInfo: any = {};
/* 
        //usedCodes.add(code);
            console.log("🎯 Received OAuth code:", code, "at", new Date().toISOString());
            if (usedCodes.has(code)) {
            console.warn("🛑 Duplicate code usage detected:", code);
            response.status(HttpStatusCode.BadRequest).json({ "message": "Missing code paramCode already used.", code: HttpStatusCode.BadRequest });
            return
        }

// Example of subscribing to Salesforce Streaming API with jsforce
await conn.streaming.topic('/data/OrderChangeEvent').subscribe(async (message: any) => {
    console.log('Change Type:', message.payload.ChangeEventHeader.changeType);

    if (message.payload.ChangeEventHeader.changeType === 'CREATE') {
        const payload = message.payload;
        const orderName = payload?.OwnerId
        console.log('🎉 New Order Created:', message.payload);
        const result = await getOrder(orderName)
        if (result) {
            return
        }

        const orderData = {
            partner_id: 1,
            name: orderName,
            order_line: [
                [12, 22, { product_id: 1, product_uom_qty: 2 }],
            ],
        };

        createOrder(orderData);
    }
});
        */


export const handlerSaleForceOrderTest = async (_: Request, response: Response, next: NextFunction) => {
    try {
        if (!userAccessInfo?.accessToken) {
            throw new AppError("User not authenticated. Please authenticate via /auth.", HttpStatusCode.Unauthorized);
        }

        const domain = process.env.APP_DOMAIN
        const oauth2 = new jsforce.OAuth2({
            loginUrl: "https://login.salesforce.com",
            clientId: process.env.SALE_FORCE_CLIENT_ID,
            clientSecret: process.env.SALE_FORCE_CLIENT_SECRET,
            redirectUri: `${domain}/api/v1/order/callback`,
        });

        const conn = new jsforce.Connection({
            instanceUrl: userAccessInfo.instanceUrl,
            accessToken: userAccessInfo.accessToken,
            refreshToken: userAccessInfo.refreshToken,
            oauth2: oauth2,
        });


        const [account] = (await conn.query("SELECT Id FROM Account LIMIT 1")).records;
        const [pricebook] = (await conn.query("SELECT Id FROM Pricebook2 WHERE IsActive = true LIMIT 1")).records;

        const fieldName = "Odoo_Order_Id_c__c"
        // Step 1: Create the order data (using the custom field)
        const orderData = {
            AccountId: account.Id,
            Pricebook2Id: pricebook.Id,
            EffectiveDate: new Date().toISOString().split("T")[0],  // Set the date to today
            Status: "Draft",                   // Set the order status
            [fieldName]: 1,   // Use the custom field for the order ID
        };

        // Step 2: Create the order
        const orderResult = await conn.sobject("Order").create(orderData);
        if (!orderResult.success) {
            response.status(500).send("Failed to create order.");
            return
        }

        response.status(HttpStatusCode.OK).json({
            message: "Successfully created order",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};


export const handlerOdooWebhook = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const data = await request.body
        const orderCCId = data?._id
        if (!userAccessInfo?.accessToken) {
            throw new AppError("User not authenticated. Please authenticate via /auth.", HttpStatusCode.Unauthorized);
        }

        console.log("Odoo order created,", data)
        const domain = process.env.APP_DOMAIN
        const oauth2 = new jsforce.OAuth2({
            loginUrl: "https://login.salesforce.com",
            clientId: process.env.SALE_FORCE_CLIENT_ID,
            clientSecret: process.env.SALE_FORCE_CLIENT_SECRET,
            redirectUri: `${domain}/api/v1/order/callback`,
        });

        const conn = new jsforce.Connection({
            instanceUrl: userAccessInfo.instanceUrl,
            accessToken: userAccessInfo.accessToken,
            refreshToken: userAccessInfo.refreshToken,
            oauth2: oauth2,
        });

        const [account] = (await conn.query("SELECT Id FROM Account LIMIT 1")).records;
        const [pricebook] = (await conn.query("SELECT Id FROM Pricebook2 WHERE IsActive = true LIMIT 1")).records;

        const isOrder = await checkOdooOrderExists(conn, orderCCId)
        if (isOrder) {
            return
        }

        const fieldName = "Odoo_Order_Id_c__c"
        // Step 1: Create the order data (using the custom field)
        const orderData = {
            AccountId: account.Id,
            Pricebook2Id: pricebook.Id,
            EffectiveDate: new Date().toISOString().split("T")[0],  // Set the date to today
            Status: "Draft",                   // Set the order status
            [fieldName]: orderCCId,   // Use the custom field for the order ID
        };

        // Step 2: Create the order
        const orderResult = await conn.sobject("Order").create(orderData);
        if (!orderResult.success) {
            response.status(500).send("Failed to create order.");
            return
        }

        response.status(HttpStatusCode.OK).json({
            message: "Webhook Successfully created odoo order",
            status: HttpStatusCode.OK,
        });
    } catch (error) {
        next(error)
    }
};

const checkOdooOrderExists = async (conn: Connection, odooId: string): Promise<boolean> => {
    try {
        const result = await conn
            .sobject("Order")
            .findOne({ Odoo_Order_Id_c__c: odooId }, ["Id"]);

        return !!result; // true if found, false if not
    } catch (error) {
        console.error("🚨 Error checking order by Odoo_Order_Id__c:", error);
        return false;
    }
};





