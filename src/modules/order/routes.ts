//Packages
import express from "express";

//Handler
import {
    handlerCreateOrder,
    handlerDeleteOrder,
    handlerGetOrders,
    handlerOdooWebhook,
    handlerSaleForceOrderTest,
    handlerUpdateOrder
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.post("/", handlerCreateOrder)
router.get("/", handlerGetOrders)
router.patch("/:id", handlerUpdateOrder)
router.delete("/:id", handlerDeleteOrder)

//SaleForce
router.post("/sale-force/order", handlerSaleForceOrderTest)
router.post("/odoo/webhook", handlerOdooWebhook)


export default router;


