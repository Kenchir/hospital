const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

const MessageSchema = new Schema({  
    conversationId:String,
  type:{type:String,
      enum:['bid','chat','accept']
  },
   msg: String,
   from: String,
   to: String,
   for:String,
   read:false,
   status:{type:String,
        enum:['read','unread','sent','received'],
       default:'unread'
        },
   createdAt:Number
 

});
module.exports = mongoose.model("Message",MessageSchema);  