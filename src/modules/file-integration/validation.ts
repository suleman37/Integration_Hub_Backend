import { z } from "zod";
import { FILE_INTEGRATION_STATUS } from "../../config/auth";

export const addFileIntegrationSchema = z.object({
    name: z.string({ required_error: "Name is required" }).trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(255, "Name should be 30 to 25 characters in length."),
    adaptor: z.string({ required_error: "Adaptor is required" }).trim()
        .min(3, "Adaptor length must be at least 3 characters.")
        .max(255, "Adaptor should be 3 to 255 characters in length."),
    connectionId: z.string({ required_error: "Connection id is required" }).trim()
        .min(3, "Connection id length must be at least 3 characters.")
        .max(255, "Connection id should be 3 to 255 characters in length."),
    service: z.string({ required_error: "Service is required" }).trim()
        .min(3, "Service length must be at least 3 characters.")
        .max(70, "Service should be 3 to 70 characters in length."),
    fileData: z.array(z.any()).min(1, "Atleast 1 record is required"),
    fileFields: z.array(z.any()).min(1, "Atleast 1 file field is required"),
    connectionFields: z.array(z.any()).min(1, "Atleast 3 connection field is required"),
    pending: z.number({ required_error: "Pending is required" }),
});


export const updateFileIntegrationSchema = z.object({
    name: z.string().trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(255, "Name should be 30 to 25 characters in length.")
        .optional(),
    adaptor: z.string().trim()
        .min(3, "Adaptor length must be at least 3 characters.")
        .max(255, "Adaptor should be 30 to 25 characters in length.")
        .optional(),
    connectionId: z.string().trim()
        .min(3, "Connection id length must be at least 3 characters.")
        .max(255, "Connection id should be 3 to 25 characters in length.")
        .optional(),
    service: z.string().trim()
        .min(3, "Service length must be at least 3 characters.")
        .max(70, "Service should be 3 to 70 characters in length.")
        .optional(),
    fileData: z.array(z.any()).min(1, "Atleast 1 record is required")
        .optional(),
    fileFields: z.array(z.any()).min(1, "Atleast 1 file field is required")
        .optional(),
    connectionFields: z.array(z.any()).min(1, "Atleast 1 connection field is required")
        .optional(),
    pending: z.number().optional(),
    completed: z.number().optional(),
    failed: z.number().optional(),
    status: z.enum([FILE_INTEGRATION_STATUS.Running, FILE_INTEGRATION_STATUS.Stop])
        .optional(),
});


export type AddFileIntegrationPayload = z.infer<typeof addFileIntegrationSchema>;
export type UpdateFileIntegrationPayload = z.infer<typeof updateFileIntegrationSchema>;



