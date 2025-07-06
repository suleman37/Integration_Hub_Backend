//Packages
import express from "express";

//Handler
import {
    handlerGetAdaptors,
    handlerGetAdaptor,
    handlerCreateAdaptor,
    handlerUpdateAdaptor,
    handlerDeleteAdaptor
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", handlerGetAdaptors)
router.get("/:id/detail", handlerGetAdaptor)
router.post("/", authorize(ROLE.SuperAdmin), handlerCreateAdaptor)
router.patch("/:id", authorize(ROLE.SuperAdmin), handlerUpdateAdaptor)
router.delete("/:id", authorize(ROLE.SuperAdmin), handlerDeleteAdaptor)


export default router;


