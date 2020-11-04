const mongoose = require("mongoose");
const { Schema } = mongoose;
const passportLocalMongoose = require("passport-local-mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");

const LabSchema = new Schema({
    //id:String,
    caseId: {
        type: Schema.Types.ObjectId,
        ref: "PatientTrackCases"
    },
   
    bloodCount: {
        type: Number,

    },
    hemoglobin : {
        type: Number,

    },
    Urinalysis: {
        type: Number,
    },
    ph: {
        type: Number,

    },
    sugar: {
        type: Number,

    },
    protein: {
        type: Number,

    },
}, { timestamps: true });
LabSchema.methods.toJSON = () => {
    return {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

LabSchema.plugin(passportLocalMongoose);
LabSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Lab", LabSchema);