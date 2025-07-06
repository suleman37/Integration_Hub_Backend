import * as userService from "./service";
import * as userController from "./controller";
import userRoutes from "./routes"
import User from "./model"
import {
    createUserSchema,
    updateUserSchema
} from "./validation";


export {
    createUserSchema,
    updateUserSchema,
    userService,
    userController,
    userRoutes,
    User
};


