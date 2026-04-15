
import "./Main.css";
import { assets } from "../../assets/assets";
import { useState } from "react";
import axios from "axios";
import { useRef, useEffect } from "react";
const Main = () => {
 
   const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);
useEffect(() => {

  const timeoutId = setTimeout(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, 50); 

  return () => clearTimeout(timeoutId);
}, [messages]); 
  const handleSubmit = async () => {
    if (!question.trim()) return;

          const userMessage = {
      type: "user",
      text: question,
    };

    setMessages((prev) => [...prev, userMessage]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

      setQuestion("");
    const res = await axios.post("http://localhost:5000/api/files/upload", formData);
    const text = res.data.message;
    
const botMessage = {
  type: "bot",
  text: "", // start empty
};

setMessages((prev) => [...prev, botMessage]);

    let responseArray = text.split("**");
    let newResponse = "";

    for (let i = 0; i < responseArray.length; i++) {
      if (i % 2 === 0) {
        // Normal text
        newResponse += responseArray[i];
      } else {
        // Bold text
        newResponse += "<b>" + responseArray[i] + "</b>";
      }
    }
    let newResponse2 = newResponse.split("*").join("</br>");
    let newResponseArray = newResponse2.split(" ");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord + " ");
    }
  };

const delayPara = (index, nextWord) => {
  setTimeout(() => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      
      // Create a new object for the last message to ensure React detects the deep change
      updated[lastIndex] = {
        ...updated[lastIndex],
        text: updated[lastIndex].text + nextWord
      };

      return updated;
    });
  }, 75 * index);
};
  return (
    <div className="main">
      <div className="navbar">
        <p>DOCxChat</p>
        <img src={assets.user_icon} alt="" />
      </div>
      <div className="main_container">
        
          <div className="result">
 <div className="chat-wrapper">
  {messages.map((msg, index) => (
    <div key={index} className={`chat-message ${msg.type}`}>
      
      <img
        src={msg.type === "user" ? assets.user_icon : assets.gemini_icon}
        alt=""
      />

      <p>{msg.text}</p>
    </div>
  ))}
<div ref={bottomRef}></div>
  {/* Loader (only when bot is thinking) */}
  {/* {loading && (
    <div className="chat-message bot">
      <img src={assets.gemini_icon} alt="" />
      <div className="loader">
        <hr />
        <hr />
        <hr />
      </div>
    </div>
  )} */}
  
    {/* <div className="chat-message bot">
      <img src={assets.gemini_icon} alt="" />
      <div className="loader">
        <hr />
        <hr />
        <hr />
      </div>
    </div> */}
  

</div></div>

      
        <div className="main_bottom">
          <div className="search_box">
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      
      <input
        type="text"
        placeholder="Ask question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
            <div>
             
              
                <img
                  onClick={handleSubmit}
                  src={assets.send_icon}
                  alt=""
                />
              
            </div>
          </div>
          <p className="bottom_info">
            Gemini may display inaccurate info including about people so double
            check its responses. Your privacy and Gemini Apps.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
