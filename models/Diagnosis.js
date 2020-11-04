const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

const DiagnosisSchema = new Schema({
    //id:String,
    caseId: {
        type: Schema.Types.ObjectId,
        ref: "PatientTrackCases"
    },
   
    diagnosis: {
        type: String,

    },
    prescription : {
        type: String,

    },
   
}, { timestamps: true });
DiagnosisSchema.methods.toJSON = () => {
    return {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

DiagnosisSchema.plugin(passportLocalMongoose);
DiagnosisSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Diagnosis", DiagnosisSchema);