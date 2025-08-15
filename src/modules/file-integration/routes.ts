//Packages
import express from "express";

//Handler
import {
    handlerGetFileIntegrations,
    handlerGetFileIntegration,
    handlerCreateFileIntegration,
    handlerUpdateFileIntegration,
    handlerDeleteFileIntegration,
    handlerRunFileIntegration
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", authorize(ROLE.Admin, ROLE.User), handlerGetFileIntegrations)
router.get("/:id/detail", authorize(ROLE.Admin, ROLE.User), handlerGetFileIntegration)
router.post("/", authorize(ROLE.Admin, ROLE.User), handlerCreateFileIntegration)
router.patch("/:id", authorize(ROLE.Admin, ROLE.User), handlerUpdateFileIntegration)
router.patch("/:id/run", authorize(ROLE.Admin, ROLE.User), handlerRunFileIntegration)
router.delete("/:id", authorize(ROLE.Admin, ROLE.User), handlerDeleteFileIntegration)


export default router;




