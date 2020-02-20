var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");
const { Schema } = mongoose;
var UserSchema = new mongoose.Schema(
    {
        username: { type: String, unique: true },
        fname: String,
        lname: String,
        email: { type: String, unique: true },
        role: {
            type: String,
            enum: [
                "admin",
                "receptionist",
                "nurse",
                "doctor",
                "labTech",
                "pharmacist"
            ],
            default: "nurse"
        },
        phone: { type: Number },
        title: {
            type: String,
            enum: ["Mr.", "Mrs.", "Dr.", "Miss", "Proff"],
            default: "Mr."
        },
        verifyToken: { type: String, unique: true },
        verifyExpires: Date,

        resetPasswordToken: String,
        default: "",
        // resetPasswordExpires:String, default:'',
        isVerified: {
            type: Boolean,
            default: false
        },
        registeredBy: {
            type: Schema.Types.ObjectId,
            ref: "Users"
        },
        isActive: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

UserSchema.methods.toJSON = function () {
    return {
        _id: this._id,
        email: this.email,
        role: this.role,
        fname: this.fname,
        lname: this.lname,
        username: this.username,

        title: this.title,

        // resetPasswordExpires:this.resetPasswordExpires,
        resetPasswordToken: this.resetPasswordToken,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("User", UserSchema);
