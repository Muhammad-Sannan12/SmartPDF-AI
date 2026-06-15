import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js";
import connectDB from "./config/db.js";

import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authmiddleware.js";
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/files", fileRoutes);
app.use("/api/chats", authMiddleware, chatRoutes);
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// node --env-file=.env server.js
