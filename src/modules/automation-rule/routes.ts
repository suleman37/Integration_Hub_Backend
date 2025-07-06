//Packages
import express from "express";

//Handler
import {
    handlerCreateAutomationRule,
    handlerDeleteAutomationRule,
    handlerGetAutomationRule,
    handlerGetAutomationRules,
    handlerUpdateAutomationRule
} from "./controller";

//Middleware
import { authenticate, authorize } from "../../middleware/auth";
import { ROLE } from "../../config/auth";

const router = express.Router();

router.use(authenticate)

router.get("/", authorize(ROLE.User), handlerGetAutomationRules)
router.get("/:id/detail", authorize(ROLE.User), handlerGetAutomationRule)
router.post("/", authorize(ROLE.User), handlerCreateAutomationRule)
router.patch("/:id", authorize(ROLE.User), handlerUpdateAutomationRule)
router.delete("/:id", authorize(ROLE.User), handlerDeleteAutomationRule)


export default router;


