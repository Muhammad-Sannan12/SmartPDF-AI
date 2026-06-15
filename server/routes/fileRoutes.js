import express from "express";
import multer from "multer";
import path from "path";
import { uploadFile } from "../controllers/fileController.js";

const router = express.Router();

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // ".pdf" or ".docx"
    const name = path.basename(file.originalname, ext); // "my-document"
    cb(null, `${name}-${Date.now()}${ext}`); // "my-document-1718123456789.pdf"
  },
});

const upload = multer({ storage });

// route
router.post("/upload", upload.single("file"), uploadFile);

export default router;
