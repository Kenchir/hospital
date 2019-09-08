const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

// Schema defines how chat messages will be stored in MongoDB
const ConversationSchema = new Schema({  
  //id:String,
  clientId:{
	  type: Schema.Types.ObjectId,
       ref: 'Users'
  },

}, { timestamps: true });
ConversationSchema.methods.toJSON = () => {
    return {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    }
};

module.exports = mongoose.model('Conversation', ConversationSchema);  