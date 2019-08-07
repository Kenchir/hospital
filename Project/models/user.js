var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  fname: String,
  lname: String,
  email: { type: String, unique: true },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'user',
  },
  marital: {
    type: String,
    enum: ['Single', 'Married'],
    default: 'Single',
  },
  title: {
    type: String,
    enum: ['Mr.', 'Mrs.', 'Dr.', 'Miss', 'Proff'],
    default: 'Mr.'
  },
  total_ratings: Number,
  total_reviews: Number,
  verifyToken: { type: String, unique: true },
  verifyExpires: Date,
  profilepic: { type: String, default: './public/assets/img/brand/favicon.png' },
  resetPasswordToken: String, default: '',
  // resetPasswordExpires:String, default:'',
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

UserSchema.methods.toJSON = function () {
  return {
    _id: this._id,
    email: this.email,
    role: this.role,
    fname: this.fname,
    lname: this.lname,
    username: this.username,
    profilepic: this.profilepic,
    title: this.title,
    marital: this.marital,
    // resetPasswordExpires:this.resetPasswordExpires,
    resetPasswordToken: this.resetPasswordToken,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,

  }
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);