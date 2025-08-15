//Packages
import express from "express";

//Handler
import {
    handlerGetIntegrations,
    handlerGetIntegration,
    handlerCreateIntegration,
    handlerUpdateIntegration,
    handlerDeleteIntegration,
    handlerGetIntegrationInfo
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", authorize(ROLE.Admin, ROLE.User), handlerGetIntegrations)
router.get("/info/user", authorize(ROLE.Admin, ROLE.User), handlerGetIntegrationInfo)
router.get("/:id/detail", authorize(ROLE.Admin, ROLE.User), handlerGetIntegration)
router.post("/", authorize(ROLE.Admin, ROLE.User), handlerCreateIntegration)
router.patch("/:id", authorize(ROLE.Admin, ROLE.User), handlerUpdateIntegration)
router.delete("/:id", authorize(ROLE.Admin, ROLE.User), handlerDeleteIntegration)


export default router;




