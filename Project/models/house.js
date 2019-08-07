var mongoose=require("mongoose");
var  passportLocalMongoose=require("passport-local-mongoose");
//var dataTables = require('mongoose-datatables')   
var HouseSchema=new mongoose.Schema({
    name: {type:String,unique:false},
    details:String,
    internet:Boolean,
    water:Boolean,
    house_types:[
        {
            room_type:String,
            room_cost:Number,
        }],
    rating:{ avg_rating:Number,
             users_rated:Number,
                default:{avg_rating:0,users_rated:0}
          },
    postedBy: String,
    contact:{
        phone:String,
        mail:String
        },
    location:{ coordinates:{ 
                lat: Number ,
                long:Number
               },
               name:String
               },
     comments:{type:Number,
        default:0
    },
   images: [{
            type: String
            }],
},{timestamp:true});

HouseSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    by:this.by,
    title:this.title,
    place_id:this.place_id,
    title:this.title,
    image:this.image,
    rating:this.rating,
    body:this.body,
    
    comments:{type:Number,
        default:0
    },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    
  };
};

module.exports=mongoose.model("House",HouseSchema);