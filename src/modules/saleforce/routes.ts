//Packages
import express from "express";

//Handler
import {
    handlerSaleForceAuth,
    handlerSaleForceCallBack,
} from "./controller";


const router = express.Router();

//SaleForce
router.get("/auth", handlerSaleForceAuth)
router.get("/callback", handlerSaleForceCallBack)

export default router;


