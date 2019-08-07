const mongoose = require('mongoose');

const { Schema } = mongoose;

const HousesviewedSchema = new Schema({
     user_id:String,
     houses:[
                    
                        String,
                      
                    
             ],
    
}, { timestamps: true });

HousesviewedSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    user_id:this.user_id,
    houses_id:this.houses_id
    
  };
};
module.exports=mongoose.model("Housesviewed",HousesviewedSchema);

//mongoose.model('Housesviewed', );