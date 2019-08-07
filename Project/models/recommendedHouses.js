const mongoose = require('mongoose');

const { Schema } = mongoose;

const RecommendedHousesSchema = new Schema({
     user_id:String,
     houses:[],
    
}, { timestamps: true });

RecommendedHousesSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    user_id:this.user_id,
    houses:this.houses
    
  };
};

module.exports=mongoose.model("RecommendedHouses",RecommendedHousesSchema);

//mongoose.model('RecommendedHouses', );