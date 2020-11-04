const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");
// Schema defines how chat messages will be stored in MongoDB
const PatientCaseTrackSchema = new Schema({
    //id:String,
    patId: {
        type: Schema.Types.ObjectId,
        ref: "Patients"
    },
    stage: {
        type: String,
        enum: ["nurse", "lab", "doc", "reception","doc_recommend", "completed"],
        default: "reception"
    }
}, { timestamps: true });
PatientCaseTrackSchema.methods.toJSON = () => {
    return {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

PatientCaseTrackSchema.plugin(passportLocalMongoose);
PatientCaseTrackSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("PatientTrackCase", PatientCaseTrackSchema);