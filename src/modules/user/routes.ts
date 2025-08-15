
//Packages
import express from "express";

//Handler
import {
    handlerCreateUser,
    handlerDeleteUser,
    handlerGetUserId,
    handlerGetUsers,
    handlerUpdateUser
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", authorize(ROLE.Admin), handlerGetUsers)
router.get("/:id", handlerGetUserId)
router.post("/", authorize(ROLE.Admin), handlerCreateUser)
router.patch("/:id", handlerUpdateUser)
router.delete("/:id", authorize(ROLE.Admin), handlerDeleteUser)


export default router;


