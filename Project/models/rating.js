const mongoose = require('mongoose');

const { Schema } = mongoose;

const RatingSchema = new Schema({
     user_id:String,
     house_id:String,
     rating:Number
}, { timestamps: true });

RatingSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    user_id:this.user_id,
    house_id:this.house_id,
    rating:this.rating,

    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    
  };
};
module.exports=mongoose.model("Rating",RatingSchema);

//mongoose.model('Rating', );