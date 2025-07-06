import { ROLE } from "../../config/auth";

export type CreateUserPayload = {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: ROLE;
    organizationId: string;
}

export type UpdateUserPayload = {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}



export type CreateAdminPayload = {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: ROLE;
    organization: string;
}

export type UpdateAdminPayload = {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
}




