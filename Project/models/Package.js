var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
//var dataTables = require('mongoose-datatables')   
const { Schema } = mongoose;
var PackageSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  price: Number,
  details: String,
  desc: String,
  type: String,
  addedBy: String,
  feature: String,
  loc: String,

  images: {
    type: String
  },
}, { timestamps: true });

PackageSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    price: this.price,
    name: this.name,
    addedBy: this.addedBy,
    loc: this.loc,
    images: this.images,
    feature: this.addedBy,

    createdAt: this.createdAt,
    updatedAt: this.updatedAt,

  };
};

module.exports = mongoose.model("Package", PackageSchema);