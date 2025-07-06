import rateLimit from "express-rate-limit";

export enum ROLE {
    SuperAdmin = "super-admin",
    Admin = "admin",
    User = "user",
}

export enum USER_STATUS {
    Active = "active",
    InActive = "inActive",
}

export enum CONNECTION_STATUS {
    Active = "active",
    InActive = "inActive",
}

export enum WEBHOOK_EVENT_STATUS {
    Completed = "completed",
    Failed = "failed",
}

export enum INTEGRATION_STATUS {
    Active = "active",
    InActive = "inActive",
}

export enum INTEGRATION_TYPE {
    Webhook = "webhook",
    Scheduler = "scheduler",
}

export enum FILE_INTEGRATION_STATUS {
    Running = "Running",
    Stop = "Stop",
}


export enum CRM_SERVICE {
    Odoo = "odoo",
    SaleForce = "saleforce",
}

export enum CRM_ACTION {
    Create = "create",
    Update = "update",
}

export enum CRM_EVENT {
    OnCreate = "onCreate",
    OnUpdate = "onUpdate",
    OnDelete = "onDelete",
}

export enum HttpStatusCode {
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    MovedPermanently = 301,
    Found = 302,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    Conflict = 409,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
}

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_access_secret";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_secret"
export const accessExpireTime = "15m"
export const refreshExpireTime = "7d"

// Queues 
export const integrationQueueName = "IntegrationQueue"
export const connectionQueueName = "ConnectionQueue"

// Jobs
export const checkingConnectionJob = "checkingConnectionJob"
export const fileIntegrationJob = "fileIntegrationJob"
export const scheduleIntegrationJob = "scheduleFileIntegrationJob"


export const rateLimiterConfig = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: "Too many requests, please try again later." },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers (redundant)
});


export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // Only allow 5 login attempts per 10 minutes
    message: { message: "Too many login attempts, try again later." },
});

export const registerLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Only allow 5 login attempts per 10 minutes
    message: { message: "Too many login attempts, try again later." },
});



