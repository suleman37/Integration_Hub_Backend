import { z } from "zod";

export const createAdminSchema = z.object({
    firstName: z.string({ required_error: "First Name is required" }).trim()
        .min(6, "First Name length must be at least 6 characters.")
        .max(25, "First Name should be 6 to 25 characters in length."),
    lastName: z.string({ required_error: "Last Name is required" }).trim()
        .min(1, "Last Name length must be at least 1 characters.")
        .max(25, "LastName should be 1 to 25 characters in length."),
    organization: z.string({ required_error: "Organization is required" }).trim()
        .min(3, "Organization length must be at least 3 characters.")
        .max(35, "Organization should be 3 to 35 characters in length."),
    email: z.string({ required_error: "Email is required" }).trim().email(),
    password: z.string({ required_error: "Password is required" }).trim()
        .min(6, "Password length must be at least 6 characters.")
        .max(20, "Passwords should be 6 to 12 characters in length."),
});

export const updateAdminSchema = z.object({
    firstName: z.string().trim()
        .min(6, "First Name length must be at least 6 characters.")
        .max(25, "First Name should be 6 to 25 characters in length.").optional(),
    lastName: z.string().trim()
        .min(1, "Last Name length must be at least 1 characters.")
        .max(25, "Last Name should be 1 to 25 characters in length.").optional(),
    organization: z.string().trim()
        .min(3, "Organization length must be at least 3 characters.")
        .max(35, "Organization should be 3 to 35 characters in length.")
        .optional(),
    email: z.string().trim().email().optional(),
    password: z.string().trim()
        .min(6, "Password length must be at least 6 characters.")
        .max(20, "Passwords should be 6 to 12 characters in length.").optional(),
});



