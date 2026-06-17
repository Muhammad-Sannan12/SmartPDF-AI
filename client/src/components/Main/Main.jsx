import "./Main.css";
import { assets } from "../../assets/assets";
import { useCallback, useState } from "react";
import axios from "axios";
import { useRef, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import {
  loadChats,
  createChatInDB,
  addMessageToDB,
  getSpecificChat,
} from "../../services/api";

import { useNavigate } from "react-router-dom";
const Main = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadedChat, setLoadedChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("storedUsername:", storedUsername);

    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []); // empty array = runs once on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    loadChats()
      .then((chat) => {
        setLoadedChat(chat.data ?? []); // fallback to empty array
      })
      .catch((err) => {
        console.error("Failed to load chats:", err);
        setLoadedChat([]);
      });
  }, []);
  const handleNewChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setQuestion("");
  }, []);

  const openChat = useCallback(async (chatId) => {
    const chat = await getSpecificChat(chatId);
    setMessages(chat.messages);
    setCurrentChatId(chatId);
  }, []);
  const handleSubmit = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    if (!question.trim()) return;

    let activeChatId = currentChatId;

    const userMessage = {
      role: "user",
      text: question,
    };

    // ── 1. Create chat in DB if none exists ──────────────────────────────
    if (!currentChatId) {
      try {
        const newChat = await createChatInDB(question, question);

        activeChatId = newChat._id;
        setCurrentChatId(newChat._id);
        setLoadedChat((prev) => [
          ...prev,
          { _id: newChat._id, title: question },
        ]);
      } catch (err) {
        console.error("Failed to create chat in DB:", err);
        return;
      }
    } else {
      // ── 2. Save user message to existing chat in DB ───────────────────
      try {
        await addMessageToDB(activeChatId, "user", question);
      } catch (err) {
        console.error("Failed to save user message:", err);
      }
    }

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    // ── 3. Call your file/question API ───────────────────────────────────
    const formData = new FormData();

    formData.append("file", file);
    formData.append("question", question);
    setQuestion("");

    let text = "";
    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData,
      );
      text = res.data.message;
    } catch (err) {
      console.error("Failed to get AI response:", err);
      return;
    }

    // ── 4. Add empty bot message placeholder to UI ───────────────────────
    const botMessage = {
      role: "assistant",
      text: "",
    };

    setMessages((prev) => [...prev, botMessage]);

    // ── 5. Format and stream response word by word ───────────────────────
    let responseArray = text.split("**");
    let newResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      newResponse +=
        i % 2 === 0 ? responseArray[i] : "<b>" + responseArray[i] + "</b>";
    }
    let newResponse2 = newResponse.split("*").join("</br>");
    let newResponseArray = newResponse2.split(" ");

    for (let i = 0; i < newResponseArray.length; i++) {
      delayPara(i, newResponseArray[i] + " ");
    }

    // ── 6. Save final bot response to DB after streaming ─────────────────
    const streamDuration = newResponseArray.length * 75 + 200; // match delayPara timing
    setTimeout(async () => {
      try {
        await addMessageToDB(activeChatId, "assistant", newResponse2);
      } catch (err) {
        console.error("Failed to save bot message to DB:", err);
      }
    }, streamDuration);
  };

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      // Update visible chat window
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        updated[lastIndex] = {
          ...updated[lastIndex],
          text: updated[lastIndex].text + nextWord,
        };

        setLoading(false);
        return updated;
      });

      // Update same bot message inside chats (for sidebar history)
    }, 75 * index);
  };
  const handleSignUp = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  return (
    <>
      <div className="app-layout">
        <Sidebar
          currentChatId={currentChatId}
          loadedChat={loadedChat}
          openChat={openChat}
          handleNewChat={handleNewChat}
        />
        <div className="main">
          <div className="navbar">
            <p>DOCxChat</p>
            <img src={assets.user_icon} alt="" onClick={handleSignUp} />
          </div>
          <div className="main_container">
            <div className="result">
              <div className="chat-wrapper">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    <img
                      src={
                        msg.role === "user"
                          ? assets.user_icon
                          : assets.gemini_icon
                      }
                      alt=""
                    />

                    <p>{msg.text}</p>
                  </div>
                ))}
                <div ref={bottomRef}></div>
                {/* Loader (only when bot is thinking) */}
                {loading && (
                  <div className="chat-message bot">
                    <img src={assets.gemini_icon} alt="" />
                    <div className="loader">
                      <hr />
                      <hr />
                      <hr />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {messages.length === 0 && !loading ? (
              <div className="main_bottom centered">
                <div className="welcome_section">
                  <p className="greeting">Good to see you</p>
                  <h1 className="welcome_text">
                    Welcome back,
                    <br />
                    <span className="username_highlight">{username} 👋</span>
                  </h1>
                  <p className="tagline">
                    Upload a document and start asking questions
                  </p>

                  <div className="suggestion_chips">
                    <button
                      className="chip"
                      onClick={() =>
                        setQuestion("What are the key points in this file?")
                      }
                    >
                      🔑 Extract key points
                    </button>
                    <button
                      className="chip"
                      onClick={() =>
                        setQuestion("What is this document about?")
                      }
                    >
                      🔍 What is this about?
                    </button>
                    <button
                      className="chip"
                      onClick={() =>
                        setQuestion(
                          "List all important dates or numbers mentioned",
                        )
                      }
                    >
                      📊 Find dates & numbers
                    </button>
                  </div>
                </div>

                <div className="search_box">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <input
                    type="text"
                    placeholder="Ask me anything…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <div>
                    <img
                      onClick={handleSubmit}
                      src={assets.send_icon}
                      alt="Send"
                    />
                  </div>
                </div>
                <p className="bottom_info">
                  Gemini may display inaccurate info including about people so
                  double check its responses. Your privacy and Gemini Apps.
                </p>
              </div>
            ) : (
              <div className="main_bottom">
                <div className="search_box">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <input
                    type="text"
                    placeholder="Ask me anything…"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <div>
                    <img
                      onClick={handleSubmit}
                      src={assets.send_icon}
                      alt="Send"
                    />
                  </div>
                </div>
                <p className="bottom_info">
                  Gemini may display inaccurate info including about people so
                  double check its responses. Your privacy and Gemini Apps.
                </p>
              </div>
            )}

            {/* <div
              className={`main_bottom ${messages.length === 0 && !loading ? "centered" : ""}`}
            >
              <div className="search_box">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <input
                  type="text"
                  placeholder="Ask me anything…"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <div>
                  <img
                    onClick={handleSubmit}
                    src={assets.send_icon}
                    alt="Send"
                  />
                </div>
              </div>
              <p className="bottom_info">
                Gemini may display inaccurate info including about people so
                double check its responses. Your privacy and Gemini Apps.
              </p>
            </div>*/}
          </div>
        </div>
      </div>
    </>
  );
};

export default Main;
