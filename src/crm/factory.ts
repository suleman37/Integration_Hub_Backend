import Odoo from "odoo-xmlrpc";
import jsforce from "jsforce";

import { OdooCredentials, SaleForcesCredentials } from "../modules/connection/interface";
import { IFileIntegration } from "../modules/file-integration/interface";
import { IIntegration } from "../modules/integration/interface";
import { CRM_ACTION, CRM_SERVICE } from "../config/auth";
import { connectOdoo, executeOdoo } from "./odoo";
import { HttpStatusCode } from "axios";
import { AppError } from "../error";


export function NewCrmClient(decriptedCredentials: string, integration: IIntegration) {
    switch (integration.targetAdaptorId) {
        case CRM_SERVICE.Odoo:
            const credential: OdooCredentials = JSON.parse(decriptedCredentials)
            return new OdooCRM(credential, integration, undefined)
        case CRM_SERVICE.SaleForce:
            const credential1: SaleForcesCredentials = JSON.parse(decriptedCredentials)
            return new SaleForceCRM(credential1, integration, undefined)
    }
}

export function NewCrmClientFile(decriptedCredentials: string, fileIntegration: IFileIntegration) {
    switch (fileIntegration.adaptor) {
        case CRM_SERVICE.Odoo:
            const credential: OdooCredentials = JSON.parse(decriptedCredentials)
            return new OdooCRM(credential, undefined, fileIntegration)
        case CRM_SERVICE.SaleForce:
            const credential1: SaleForcesCredentials = JSON.parse(decriptedCredentials)
            return new SaleForceCRM(credential1, undefined, fileIntegration)
    }
}



export class OdooCRM {
    connection?: OdooCredentials;
    integration?: IIntegration;
    fileIntegration?: IFileIntegration;
    records?: any[];

    constructor(connection: OdooCredentials, integration?: IIntegration, fileIntegration?: IFileIntegration) {
        this.connection = connection;
        this.integration = integration
        this.fileIntegration = fileIntegration
    }

    async setScheduleRecords(decryptedCredential: string) {
        if (!this.integration?.initialTime) {
            throw new Error("please set time first")
        }

        const sourceConnection: OdooCredentials = JSON.parse(decryptedCredential)
        const odoo = new Odoo({
            url: sourceConnection?.url ?? "",
            db: sourceConnection?.database ?? "",
            username: sourceConnection?.username ?? "",
            password: sourceConnection?.password ?? "",
        });

        const startDate = new Date(this.integration.initialTime).toISOString().slice(0, 10); // '2024-05-01'
        const endDate = new Date().toISOString().slice(0, 10);

        const domain = [
            ["date_order", ">=", startDate],
            ["date_order", "<=", endDate],
        ];

        const fields = this.integration?.sourceField?.map((field) => field.name)
        const records: any = await executeOdoo(odoo, this.integration?.sourceModel ?? "", 'search_read', [domain, fields])
        this.records = records
    }

    async action(eventData: any) {
        if (!this.integration) {
            throw new AppError("Invalid integration", HttpStatusCode.BadRequest);
        }

        const odoo = new Odoo({
            url: this.connection?.url ?? "",
            db: this.connection?.database ?? "",
            username: this.connection?.username ?? "",
            password: this.connection?.password ?? "",
        });
        await connectOdoo(odoo)
        const orderData: any = {}
        const sourceFields: any[] = this.integration?.sourceField ?? []
        const targetFields: any[] = this.integration?.targetField ?? []

        for (let i = 0; i < sourceFields.length; i++) {
            orderData[targetFields[i]?.name] = eventData[sourceFields[i]?.name]
        }

        try {
            switch (this.integration.action) {
                case CRM_ACTION.Create: {
                    await executeOdoo(odoo, this.integration?.targetModel ?? "", 'create', [[orderData]])
                }
                case CRM_ACTION.Update: {
                    await executeOdoo(odoo, this.integration?.targetModel ?? "", 'write', [[eventData?._id], orderData])
                }
            }
        } catch (error) {
            throw error
        }
    }

    async actionFileRecord(eventData: any) {
        if (!this.fileIntegration) {
            throw new AppError("Invalid integration", HttpStatusCode.BadRequest);
        }

        const odoo = new Odoo({
            url: this.connection?.url ?? "",
            db: this.connection?.database ?? "",
            username: this.connection?.username ?? "",
            password: this.connection?.password ?? "",
        });
        await connectOdoo(odoo)
        const orderData: any = {}
        const sourceFields: any[] = this.fileIntegration?.fileFields ?? []
        const targetFields: any[] = this.fileIntegration?.connectionFields ?? []

        for (let i = 0; i < sourceFields.length; i++) {
            orderData[targetFields[i]?.name] = eventData[sourceFields[i]?.name]
        }

        try {
            await executeOdoo(odoo, this.fileIntegration?.service ?? "", 'create', [[orderData]])
            /*
                switch (this.integration.action) {
                case CRM_ACTION.Create: {
                }
                case CRM_ACTION.Update: {
                    await executeOdoo(odoo, this.integration?.targetModel ?? "", 'write', [[orderData]])
                }
            }
             */
        } catch (error) {
            throw error
        }
    }
}

export class SaleForceCRM {
    connection?: SaleForcesCredentials;
    integration?: IIntegration;
    fileIntegration?: IFileIntegration;
    records?: any[];

    constructor(connection: SaleForcesCredentials, integration?: IIntegration, fileIntegration?: IFileIntegration) {
        this.connection = connection;
        this.integration = integration
        this.fileIntegration = fileIntegration
    }

    async setScheduleRecords(decryptedCredential: string) {
        if (!this.integration?.initialTime) {
            throw new Error("please set time first")
        }

        const connection: SaleForcesCredentials = JSON.parse(decryptedCredential)
        const domain = process.env.APP_DOMAIN
        const oauth2 = new jsforce.OAuth2({
            redirectUri: `${domain}/api/v1/order/callback`,
            loginUrl: "https://login.salesforce.com",
            clientSecret: connection.clientSecret,
            clientId: connection.clientId,
        });

        const conn = new jsforce.Connection({
            instanceUrl: connection?.config?.instanceUrl,
            accessToken: connection?.config?.accessToken,
            refreshToken: connection?.config?.refreshToken,
            oauth2: oauth2,
        });

        const startDate = new Date(this.integration?.initialTime).toISOString().slice(0, 10); // '2024-05-01'
        const endDate = new Date().toISOString().slice(0, 10);

        const orderResult = await conn.sobject(this.integration?.targetModel ?? "").find({
            EffectiveDate: {
                $gte: startDate,
                $lte: endDate
            }
        }
        );

        this.records = orderResult
    }

    async action(eventData: any) {
        if (!this.integration) {
            throw new AppError("Invalid integration", HttpStatusCode.BadRequest);
        }

        const domain = process.env.APP_DOMAIN
        const oauth2 = new jsforce.OAuth2({
            loginUrl: "https://login.salesforce.com",
            redirectUri: `${domain}/api/v1/order/callback`,
            clientSecret: this.connection?.clientSecret,
            clientId: this.connection?.clientId,
        });

        const conn = new jsforce.Connection({
            instanceUrl: this.connection?.config?.instanceUrl,
            accessToken: this.connection?.config?.accessToken,
            refreshToken: this.connection?.config?.refreshToken,
            oauth2: oauth2,
        });
        const orderData: any = {}
        const sourceFields: any[] = this.integration?.sourceField ?? []
        const targetFields: any[] = this.integration?.targetField ?? []

        for (let i = 0; i < sourceFields.length; i++) {
            orderData[targetFields[i]?.name] = eventData[sourceFields[i]?.name]
        }



        try {
            switch (this.integration.action) {
                case CRM_ACTION.Create: {
                    const orderResult: any = await conn.sobject(this.integration?.targetModel ?? "").create(orderData);
                    if (!orderResult?.success) {
                        throw new AppError("Failed to create order.", HttpStatusCode.BadRequest);
                    }
                    break
                }
                case CRM_ACTION.Update: {
                    const orderResult: any = await conn.sobject(this.integration?.targetModel ?? "").update(orderData);
                    if (!orderResult?.success) {
                        throw new AppError("Failed to create order.", HttpStatusCode.BadRequest);
                    }
                    break
                }
            }
        } catch (error) {
            throw (error)
        }
    }


    async actionFileRecord(eventData: any) {
        if (!this.fileIntegration) {
            throw new AppError("Invalid integration", HttpStatusCode.BadRequest);
        }

        const domain = process.env.APP_DOMAIN
        const oauth2 = new jsforce.OAuth2({
            loginUrl: "https://login.salesforce.com",
            redirectUri: `${domain}/api/v1/order/callback`,
            clientSecret: this.connection?.clientSecret,
            clientId: this.connection?.clientId,
        });

        const conn = new jsforce.Connection({
            instanceUrl: this.connection?.config?.instanceUrl,
            accessToken: this.connection?.config?.accessToken,
            refreshToken: this.connection?.config?.refreshToken,
            oauth2: oauth2,
        });
        const orderData: any = {}
        const sourceFields: any[] = this.fileIntegration?.fileFields ?? []
        const targetFields: any[] = this.fileIntegration?.connectionFields ?? []

        for (let i = 0; i < sourceFields.length; i++) {
            orderData[targetFields[i]?.name] = eventData[sourceFields[i]?.name]
        }

        try {
            const orderResult: any = await conn.sobject(this.fileIntegration?.service ?? "").create(orderData);
            if (!orderResult?.success) {
                throw new AppError("Failed to create order.", HttpStatusCode.BadRequest);
            }

            /* 
                switch (this.fileIntegration.action) {
                case CRM_ACTION.Create: {
 
                    break
                }
                case CRM_ACTION.Update: {
                    const orderResult: any = await conn.sobject(this.integration?.targetModel ?? "").update(orderData);
                    if (!orderResult?.success) {
                        throw new AppError("Failed to create order.", HttpStatusCode.BadRequest);
                    }
                    break
                }
            }
             */
        } catch (error) {
            throw (error)
        }
    }
}


