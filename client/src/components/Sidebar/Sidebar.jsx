import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { memo, useState } from "react";
const Sidebar = ({ loadedChat, currentChatId, openChat, handleNewChat }) => {
  const [extended, setExtented] = useState(false);
  return (
    <div className="sidebar">
      <div className="top">
        <img
          onClick={() => setExtented((previousValue) => !previousValue)}
          className="menu"
          src={assets.menu_icon}
          alt=""
        />
        <div onClick={handleNewChat} className="new-chat">
          <img src={assets.plus_icon} alt="" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {loadedChat.map((chat) => (
              <div
                key={chat._id}
                onClick={() => openChat(chat._id)}
                className={`history-item ${
                  currentChatId === chat._id ? "active" : ""
                }`}
              >
                {chat.title}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="bottom">
        <div className="bottom-item recent-entry">
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div className="bottom-item recent-entry">
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);
