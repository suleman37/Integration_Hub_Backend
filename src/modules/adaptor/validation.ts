import { z } from "zod";


export const fieldSchema = z.object({
    name: z.string().trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length."),
    label: z.string().trim()
        .min(3, "Label length must be at least 3 characters.")
        .max(255, "Label should be 3 to 255 characters in length."),
});



export const addAdaptorSchema = z.object({
    name: z.string({ required_error: "Name is required" }).trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length."),
    version: z.string({ required_error: "Version is required" }).trim()
        .min(1, "Version length must be at least 1 characters.")
        .max(255, "Version should be 1 to 255 characters in length."),
    description: z.string({ required_error: "Description is required" }).trim()
        .min(10, "Name length must be at least 10 characters.")
        .max(255, "Name should be 10 to 255 characters in length."),
    iconPath: z.string({ required_error: "IconPath is required" }).trim()
        .min(1, "IconPath length must be at least 1 characters.")
        .max(255, "IconPath should be 1 to 255 characters in length."),
    fields: z.array(fieldSchema).optional(),
});

export const updateAdaptorSchema = z.object({
    name: z.string().trim()
        .min(3, "Name length must be at least 3 characters.")
        .max(25, "Name should be 3 to 25 characters in length.")
        .optional(),
    version: z.string().trim()
        .min(1, "Version length must be at least 1 characters.")
        .max(255, "Version should be 1 to 255 characters in length.")
        .optional(),
    description: z.string().trim()
        .min(10, "Name length must be at least 10 characters.")
        .max(255, "Name should be 10 to 25 characters in length.")
        .optional(),
    iconPath: z.string().trim()
        .min(1, "IconPath length must be at least 1 characters.")
        .max(255, "IconPath should be 1 to 255 characters in length.")
        .optional(),
    fields: z.array(fieldSchema).optional(),
});


export type AddAdaptorPayload = z.infer<typeof addAdaptorSchema>;
export type UpdateAdaptorPayload = z.infer<typeof updateAdaptorSchema>;




