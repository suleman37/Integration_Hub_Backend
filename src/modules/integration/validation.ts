import { z } from "zod";
import { INTEGRATION_STATUS, INTEGRATION_TYPE, CRM_ACTION, CRM_EVENT } from "../../config/auth";

export const addIntegrationSchema = z.object({
    name: z.string({ required_error: "Name is required" }).trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length."),
    description: z.string({ required_error: "Description is required" }).trim()
        .min(10, "Description length must be at least 10 characters.")
        .max(255, "Description should be 10 to 255 characters in length."),
    version: z.string({ required_error: "Version is required" }).trim()
        .min(1, "Version length must be at least 1 characters.")
        .max(255, "Version should be 1 to 255 characters in length."),
    sourceAdaptorId: z.string({ required_error: "Source adaptor id is required" }).trim()
        .min(1, "Source adaptor id length must be at least 10 characters.")
        .max(255, "Source adaptor id should be 10 to 25 characters in length."),
    targetAdaptorId: z.string({ required_error: "Source adaptor id is required" }).trim()
        .min(1, "Source adaptor id length must be at least 1 characters.")
        .max(255, "Source adaptor id should be 1 to 25 characters in length."),
    sourceConnectionId: z.string({ required_error: "Source Connection id is required" }).trim()
        .min(1, "Source Connection id length must be at least 1 characters.")
        .max(255, "Source Connection id should be 1 to 25 characters in length."),
    targetConnectionId: z.string({ required_error: "Source Connection id is required" }).trim()
        .min(1, "Source Connection id length must be at least 1 characters.")
        .max(255, "Source Connection id should be 1 to 25 characters in length."),
    sourceModel: z.string({ required_error: "Source model is required" }).trim()
        .min(1, "Source model length must be at least 1 characters.")
        .max(45, "Source model should be 1 to 45 characters in length."),
    targetModel: z.string({ required_error: "Target model is required" }).trim()
        .min(1, "Target Connection  length must be at least 10 characters.")
        .max(45, "Target Connection  should be 1 to 45 characters in length."),
    sourceField: z.array(z.any()).min(1, "Atleast 1 source field is required"),
    targetField: z.array(z.any()).min(1, "Atleast 1 target field is required"),
    event: z.enum([CRM_EVENT.OnCreate, CRM_EVENT.OnUpdate, CRM_EVENT.OnDelete], { 
        message: "Event must be either 'onCreate', 'onUpdate', or 'onDelete'" 
    }),
    action: z.enum([CRM_ACTION.Create, CRM_ACTION.Update], { 
        message: "Action must be either 'create' or 'update'" 
    }),
    type: z.enum([INTEGRATION_TYPE.Scheduler, INTEGRATION_TYPE.Webhook], { "message": "Invalid integration type" }),
    startTime: z.string().optional(),
});


export const updateIntegrationSchema = z.object({
    name: z.string().trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length.")
        .optional(),
    description: z.string().trim()
        .min(10, "Name length must be at least 10 characters.")
        .max(255, "Name should be 10 to 25 characters in length.")
        .optional(),
    version: z.string().trim()
        .min(1, "Version length must be at least 10 characters.")
        .max(255, "Version should be 1 to 25 characters in length.")
        .optional(),
    sourceAdaptorId: z.string().trim()
        .min(1, "Source adaptor id length must be at least 10 characters.")
        .max(255, "Source adaptor id should be 10 to 25 characters in length.")
        .optional(),
    targetAdaptorId: z.string().trim()
        .min(1, "Source adaptor id length must be at least 1 characters.")
        .max(255, "Source adaptor id should be 1 to 25 characters in length.")
        .optional(),
    sourceConnectionId: z.string().trim()
        .min(1, "Source Connection id length must be at least 1 characters.")
        .max(255, "Source Connection id should be 1 to 25 characters in length.")
        .optional(),
    targetConnectionId: z.string().trim()
        .min(1, "Source Connection id length must be at least 1 characters.")
        .max(255, "Source Connection id should be 1 to 25 characters in length.")
        .optional(),
    sourceModel: z.string().trim()
        .min(1, "Source model length must be at least 1 characters.")
        .max(45, "Source model should be 1 to 45 characters in length.")
        .optional(),
    targetModel: z.string().trim()
        .min(1, "Target Connection  length must be at least 10 characters.")
        .max(45, "Target Connection  should be 1 to 45 characters in length.")
        .optional(),
    sourceField: z.array(z.any())
        .optional(),
    targetField: z.array(z.any())
        .optional(),
    event: z.enum([CRM_EVENT.OnCreate, CRM_EVENT.OnUpdate, CRM_EVENT.OnDelete], { 
        message: "Event must be either 'onCreate', 'onUpdate', or 'onDelete'" 
    }).optional(),
    action: z.enum([CRM_ACTION.Create, CRM_ACTION.Update], { 
        message: "Action must be either 'create' or 'update'" 
    }).optional(),
    status: z.enum([INTEGRATION_STATUS.Active, INTEGRATION_STATUS.InActive])
        .optional(),
    type: z.enum([INTEGRATION_TYPE.Scheduler, INTEGRATION_TYPE.Webhook], { "message": "Invalid integration type" })
        .optional(),
    startTime: z.string().optional(),
    initialTime: z.string().optional(),
});


export type AddIntegrationPayload = z.infer<typeof addIntegrationSchema>;
export type UpdateIntegrationPayload = z.infer<typeof updateIntegrationSchema>;



