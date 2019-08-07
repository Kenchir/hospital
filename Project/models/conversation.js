const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

// Schema defines how chat messages will be stored in MongoDB
const ConversationSchema = new Schema({  
  id:String,
  party1:String,
  party2:String,

  lastActivity:Number,
});

module.exports = mongoose.model('Conversation', ConversationSchema);  