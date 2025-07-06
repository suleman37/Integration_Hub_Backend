import { z } from "zod";
import { CONNECTION_STATUS, CRM_SERVICE } from "../../config/auth";

export const addOdooSchema = z.object({
    name: z.string({ required_error: "Name is required" }).trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length."),
    type: z.literal(CRM_SERVICE.Odoo),
    credentials: z.object({
        url: z.string().trim().url({ message: "Invalid URL format" }),
        database: z.string().trim().min(1, { message: "Database is required" }),
        username: z.string().trim().min(1, { message: "Username is required" }),
        password: z.string().trim().min(1, { message: "Password is required" }),
    }),
});

export const addSaleForceSchema = z.object({
    name: z.string({ required_error: "Name is required" }).trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length."),
    type: z.literal(CRM_SERVICE.SaleForce),
    credentials: z.object({
        clientId: z.string().trim().min(1, { message: "ClientId is required" }),
        clientSecret: z.string().trim().min(1, { message: "ClientSecret is required" }),
    }),
});

export const addConnectionSchema = z.discriminatedUnion("type", [addOdooSchema, addSaleForceSchema]);


export const updateOdooSchema = z.object({
    name: z.string().trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length.")
        .optional(),
    type: z.literal(CRM_SERVICE.Odoo),
    status: z.enum([CONNECTION_STATUS.Active, CONNECTION_STATUS.InActive])
        .optional(),
    credentials: z.object({
        url: z.string().trim().url({ message: "Invalid URL format" }),
        database: z.string().trim().min(1, { message: "Database is required" }),
        username: z.string().trim().min(1, { message: "Username is required" }),
        password: z.string().trim().min(1, { message: "Password is required" }),
    }).optional(),
});


export const updateSaleForceSchema = z.object({
    name: z.string().trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length.")
        .optional(),
    type: z.literal(CRM_SERVICE.SaleForce),
    status: z.enum([CONNECTION_STATUS.Active, CONNECTION_STATUS.InActive])
        .optional(),
    credentials: z.object({
        clientId: z.string().trim().min(1, { message: "ClientId is required" }),
        clientSecret: z.string().trim().min(1, { message: "ClientSecret is required" }),
    }).optional(),
});

export const updateConnectionSchema = z.discriminatedUnion("type", [updateOdooSchema, updateSaleForceSchema]);


export type AddConnectionPayload = z.infer<typeof addConnectionSchema>;
export type UpdateConnectionPayload = z.infer<typeof updateConnectionSchema>;



