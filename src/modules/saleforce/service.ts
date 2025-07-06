//Packages
import jsforce from "jsforce";

//Lib
import { SaleForcesCredentials } from "../connection/interface";
import { decryptData, encryptData } from "../../utils/encrypt";
import { HttpStatusCode } from "../../config/auth";
import { Connection } from "../connection";
import { AppError } from "../../error";


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
        redirectUri: `${domain}/api/v1/saleforce/callback`,
        clientSecret: credentials.clientSecret,
        clientId: credentials.clientId,
    });

    const authURL = oauth2.getAuthorizationUrl({
        scope: "openid api refresh_token full",
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
        redirectUri: `${domain}/api/v1/saleforce/callback`,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
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
    await Connection.updateOne({ "uuid": connection.uuid }, { credentials: encryptedCredentials })
}



