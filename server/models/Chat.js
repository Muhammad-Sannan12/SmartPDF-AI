import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },

  text: {
    type: String,
    required: true,
    trim:true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

});


const chatSchema = new mongoose.Schema({

  userId: {
    type: String,
    ref: "User",
    required: true
  },

  title:{
 type:String,
 default:"New Chat",
 trim:true
},

  messages: [messageSchema]

}, {
  timestamps: true   // automatically creates createdAt and updatedAt
});


export default mongoose.model("Chat", chatSchema);