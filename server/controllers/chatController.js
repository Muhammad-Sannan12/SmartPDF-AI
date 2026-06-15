import Chat from "../models/Chat.js";

export const getSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    res.json(chat);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
export const addMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { role, text } = req.body;
    // Validate role against schema enum
    if (!["user", "assistant"].includes(role)) {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'user' or 'assistant'." });
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: {
          messages: { role, text },
        },
      },
      { returnDocument: "after" },
    );
    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const createChat = async (req, res) => {
  try {
    const { title, firstMessage } = req.body;
    const userId = req.user.id; // from auth middleware

    const newChat = await Chat.create({
      userId,
      title: title || "New Chat",
      messages: firstMessage ? [{ role: "user", text: firstMessage }] : [],
    });

    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user?.id;

    const chats = await Chat.find({ userId })
      .select("_id title updatedAt") // only metadata, NOT messages
      .sort({ updatedAt: -1 }); // most recent first

    return res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
