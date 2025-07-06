//Packages
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan"
import router from "./routes";
import compression from "compression"
import hpp from "hpp"
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';


//Config
import { integrationQueue } from "./job/integration_queue";
import { connectionQueue } from "./job/connection_queue";
import { errorHandler } from "./middleware/error";

dotenv.config();

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
    queues: [new BullMQAdapter(connectionQueue), new BullMQAdapter(integrationQueue)],
    serverAdapter,
});

//Job Dashboard
app.use('/admin/queues', serverAdapter.getRouter());

// Protects from large payload attacks
app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use(compression());
app.use(hpp());

app.use("/api/v1", router);
app.get("/ping", (_: Request, response: Response) => {
    response.send("CRMPipeHub app server is running")
});

app.use(errorHandler)

export default app;


