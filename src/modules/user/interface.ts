import { Document, ObjectId } from "mongoose";
import { GenerateTokens } from "../../utils/type/auth";
import { USER_STATUS } from "../../config/auth";


// Define TypeScript Interface
export interface IUser extends Document {
    _id: ObjectId,
    uuid: string;
    organizationId?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    status: USER_STATUS;
    organization?: string;
    role: string;
    isReset: boolean;
    refreshToken?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateTokens(): Promise<GenerateTokens>;
}



