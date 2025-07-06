
//Packages
import express from "express";

//Handler
import {
    handlerCreateAdmin,
    handlerDeleteAdmin,
    handlerGetAdmins,
    handlerUpdateAdmin
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", authorize(ROLE.SuperAdmin), handlerGetAdmins)
router.post("/", authorize(ROLE.SuperAdmin), handlerCreateAdmin)
router.delete("/:id", authorize(ROLE.SuperAdmin), handlerDeleteAdmin)
router.patch("/:id", authorize(ROLE.SuperAdmin), handlerUpdateAdmin)


export default router;


