const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-aggregate-paginate-v2");
const passportLocalMongoose = require("passport-local-mongoose");
const { Schema } = mongoose;
const BookingSchema = new mongoose.Schema({

    packageId: {
        type: Schema.Types.ObjectId,
        ref: 'Packages'
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed']

    },
    amount: { type: Number },
    type: {
        type: String,
        enum: ['single', 'multiple']
    },
    peopleNum: {
        type: Number,

    },
}, { timestamps: true });

BookingSchema.methods.toJSON = function () {
    return {
        _id: this._id,
        amountPaid: this.amountPaid,
        clientId: this.clientId,
        packageId: this.packageId,
        type: this.type,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

BookingSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Booking", BookingSchema);