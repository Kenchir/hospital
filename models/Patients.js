var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");
const { Schema } = mongoose;
const PatientSchema = new mongoose.Schema(
  {
    QRcode: { type: Buffer, unique: true, required: true },
    QRcodeImage: String,
    fname: String,
    lname: String,
    email: { type: String, unique: true },
    occupation: String,
    residence: String,
    phone: { type: Number },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male"
    },
    citizenship: String,
    passportNumber: Number,
    idNumber: Number
  },
  { timestamps: true }
);

PatientSchema.methods.toJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    role: this.role,
    fname: this.fname,
    lname: this.lname,
    username: this.username,

    title: this.title,
    marital: this.marital,
    // resetPasswordExpires:this.resetPasswordExpires,
    resetPasswordToken: this.resetPasswordToken,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

PatientSchema.plugin(passportLocalMongoose);
PatientSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Patient", PatientSchema);
