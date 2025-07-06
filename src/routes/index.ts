import { Router } from "express";

//Routes
import { authRoutes } from "../modules/auth";
import { userRoutes } from "../modules/user"
import { orderRoutes } from "../modules/order";
import { connectionRoutes } from "../modules/connection";
import { automationRuleRoutes } from "../modules/automation-rule";
import { adaptorRoutes } from "../modules/adaptor";
import { fileRoutes } from "../modules/file";
import { webhookRoutes } from "../modules/webhook";
import { integrationRoutes } from "../modules/integration";
import { saleforceRoutes } from "../modules/saleforce";
import { fileIntegrationRoutes } from "../modules/file-integration";
import { adminRoutes } from "../modules/admin";

const router = Router();

router.use("/auth", authRoutes)
router.use("/user", userRoutes)
router.use("/admin", adminRoutes)
router.use("/connection", connectionRoutes)
router.use("/adaptor", adaptorRoutes)
router.use("/order", orderRoutes)
router.use("/file", fileRoutes)
router.use("/webhook", webhookRoutes)
router.use("/automation-rule", automationRuleRoutes)
router.use("/integration", integrationRoutes)
router.use("/file-integration", fileIntegrationRoutes)
router.use("/saleforce", saleforceRoutes)

export default router

