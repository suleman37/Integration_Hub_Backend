import { z } from "zod";


export const createAutomationSchema = z.object({
    connectionRef: z.string({ required_error: "ConnectionRef is required" }).trim()
        .min(3, "ConnectionRef length must be at least 3 characters.")
        .max(25, "ConnectionRef should be 3 to 25 characters in length."),
    ruleName: z.string({ required_error: "RuleName is required" }).trim()
        .min(3, "RuleName length must be at least 3 characters.")
        .max(25, "RuleName should be 3 to 25 characters in length."),
    model: z.string({ required_error: "Model is required" }).trim()
        .min(3, "Model length must be at least 3 characters.")
        .max(15, "Model should be 3 to 25 characters in length."),
    webhookUrl: z.string({ required_error: "WebhookUrl is required" }).trim()
        .min(1, "WebhookUrl is required")
});


export const updateAutomationSchema = z.object({
    connectionRef: z.string({ required_error: "ConnectionRef is required" }).trim()
        .min(3, "ConnectionRef length must be at least 3 characters.")
        .max(25, "ConnectionRef should be 3 to 25 characters in length."),
    name: z.string().trim()
        .min(3, "RuleName length must be at least 3 characters.")
        .max(25, "RuleName should be 3 to 25 characters in length.")
        .optional(),
    webhook_url: z.string().trim()
        .min(1, "WebhookUrl is required")
        .optional(),
});


export type AddAutomationType = z.infer<typeof createAutomationSchema>;
export type UpdateAutomationType = z.infer<typeof updateAutomationSchema>;



