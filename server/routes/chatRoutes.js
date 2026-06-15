import express from "express";

const router = express.Router();
import {createChat,addMessage,getSingleChat,getUserChats} from "../controllers/chatController.js";

router.post("/", createChat);

router.post("/:chatId/message", addMessage);

router.get("/", getUserChats);

router.get("/:chatId", getSingleChat);

// router.delete("/:chatId", chatController.deleteChat);

export default router;
