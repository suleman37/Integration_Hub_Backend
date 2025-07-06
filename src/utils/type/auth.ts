import { ROLE } from "../../config/auth";

export type GenerateTokens = {
    refreshToken: string;
    accessToken: string;
}


export type RegisterPayload = {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: ROLE;
}


