const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

const TriageSchema = new Schema({
    //id:String,
    caseId: {
        type: Schema.Types.ObjectId,
        ref: "PatientTrackCases"
    },
    nurseId: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    temperature: {
        type: Number,

    },
    bloodPressure: {
        type: Number,

    },
    weight: {
        type: Number,

    },
    respiration: {
        type: Number,

    },
}, { timestamps: true });
TriageSchema.methods.toJSON = () => {
    return {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

TriageSchema.plugin(passportLocalMongoose);
TriageSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Triage", TriageSchema);