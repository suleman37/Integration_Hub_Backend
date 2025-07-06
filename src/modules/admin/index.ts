import * as adminService from "./service";
import * as adminController from "./controller";
import adminRoutes from "./routes"
import {
    createAdminSchema,
    updateAdminSchema
} from "./validation";


export {
    createAdminSchema,
    updateAdminSchema,
    adminService,
    adminController,
    adminRoutes,
};


