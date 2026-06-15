import axios from "axios";

export const loadChats = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    "http://localhost:5000/api/chats/",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }, // Replace 123 with the actual user ID
  );

  return res.data;
};
export async function loginUser(email, password) {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  return data;
  //   if (!response.ok) {
  //     return { success: false, message: data.message || "Login failed" };
  //   }

  //    if (data.success) {
  //   localStorage.setItem("isLoggedIn", "true");
  // }
  //   // return { success: true, token: data.token, user: data.user };
}
export async function registerUser(username, email, password) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error from server: ", error);
  }
}

// api/chat.js
export const createChatInDB = async (title, firstMessage) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    "http://localhost:5000/api/chats",
    { title, firstMessage },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data; // returns the new chat object with _id from MongoDB
};

export const addMessageToDB = async (chatId, role, text) => {
  const token = localStorage.getItem("token");
  const res = await axios.post(
    `http://localhost:5000/api/chats/${chatId}/message`,
    { role, text },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const getSpecificChat = async (chatId) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`http://localhost:5000/api/chats/${chatId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
