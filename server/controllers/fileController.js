
import { indexTheDocument } from "../rag/prepare.js";
import { chat } from "../rag/chat.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
const filePath = req.file.path;
    const question = req.body.question;

    await indexTheDocument(filePath);
    const answer = await chat(question);


    res.status(200).json({
      message: answer
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};