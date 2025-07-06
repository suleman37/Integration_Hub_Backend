//Packages
import express from "express";

//Handler
import { handlerAllEventsTotal, handlerWebhook, handlerWebhookEvents } from "./controller";
import { authenticate } from "../../middleware/auth";

const router = express.Router();

router.get("/events", authenticate, handlerAllEventsTotal)
router.get("/:id/event", authenticate, handlerWebhookEvents)
router.post("/:id", handlerWebhook)


export default router;


