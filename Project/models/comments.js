const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
     user_id:String,
     house_id:String,
     text:String
}, { timestamps: true });

CommentSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    user_id:this.user_id,
    house_id:this.house_id,
    text:this.Comment,

    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    
  };
};
module.exports=mongoose.model("Comment",CommentSchema);

//mongoose.model('Comment', );