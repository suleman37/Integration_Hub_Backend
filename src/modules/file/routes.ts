//Packages
import express from "express";

//Middleware
import { authenticate } from "../../middleware/auth";
import upload from "../../middleware/upload";

//Handler
import { handlerDeleteFile, handlerUploadImage } from "./controller";

const router = express.Router();

router.use(authenticate)

router.post("/upload", upload.single("image"), handlerUploadImage)
router.delete("/:filename", handlerDeleteFile)


export default router;


