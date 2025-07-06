
//Packages
import express from "express";

//Config
import { authenticate } from "../../middleware/auth";

//Handler
import {
    handlerForgetPassword,
    handlerRefreshToken,
    handlerRegister,
    handlerLogout,
    handlerLogin,
} from "./controller";


const router = express.Router();

router.post("/login", handlerLogin)
router.post("/logout", authenticate, handlerLogout)
router.post("/forget-password", handlerForgetPassword)
router.post("/registration", handlerRegister)
router.post("/refresh-token", handlerRefreshToken)


export default router;


