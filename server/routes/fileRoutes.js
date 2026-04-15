
import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/fileController.js";

const router = express.Router();

// multer setup
const upload = multer({ dest: "uploads/" });

// route
router.post("/upload", upload.single("file"), uploadFile);

export default router;