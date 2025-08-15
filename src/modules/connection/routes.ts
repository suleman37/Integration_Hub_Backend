//Packages
import express from "express";

//Handler
import {
    handlerCreateConnection,
    handlerDeleteConnection,
    handlerGetConnection,
    handlerGetConnections,
    handlerGetModelField,
    handlerGetModels,
    handlerUpdateConnection
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", authorize(ROLE.Admin, ROLE.User), handlerGetConnections)
router.get("/:id/detail", authorize(ROLE.Admin, ROLE.User), handlerGetConnection)
router.post("/", authorize(ROLE.Admin, ROLE.User), handlerCreateConnection)
router.patch("/:id", authorize(ROLE.Admin, ROLE.User), handlerUpdateConnection)
router.delete("/:id", authorize(ROLE.Admin, ROLE.User), handlerDeleteConnection)

//Modal
router.get("/model/:id", authorize(ROLE.Admin, ROLE.User), handlerGetModels)
router.get("/field/:id/:modelName", authorize(ROLE.Admin, ROLE.User), handlerGetModelField)


export default router;

