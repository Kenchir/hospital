const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const MessageSchema = new Schema({
     conversationId:  {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
	to:{
		 type: Schema.Types.ObjectId,
        ref: 'Users'
	},
    type: {
        type: String,
        enum: ['complaint', 'inquiry']
    },
    msg: String,

    status: {
        type: String,
        enum: ['read', 'unread', 'sent', 'received'],
        default: 'unread'
    },



}, { timestamps: true });
MessageSchema.methods.toJSON = () => {
    return {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    }
}
module.exports = mongoose.model("Message", MessageSchema);  