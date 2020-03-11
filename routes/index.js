let express = require("express");
let router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const Booking = require("../models/LabTestReq");
const Package = require("../models/Package");
const Patient = require("../models/Patients");
const PatCaseTrack = require("../models/PatCaseTrack");
const Triage = require("../models/Triage")
const Nodemailer = require("nodemailer");

const Middleware = require("../middleware");

const crypto = require("crypto");
const fs = require("fs");

const qr = require("qr-image");
const config = require("../config");
//onst { body,validationResult } = require('express-validator/check');

const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

cloudinary.config(config.cloudinary);
let token = crypto.randomBytes(7).toString("hex");
//Mutler configuration move during refactoring
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        let name = req.body.name;
        let fname = "";
        if (name.split(" ").length > 1) {
            name.split(" ").map(each => {
                if (each.length > 0) {
                    fname = fname + each;
                }
            });
        }
        const customName =
            Date.now() + fname + crypto.randomBytes(7).toString("hex");
        const fileExtension = file.originalname.split(".")[1];

        callback(null, customName + "." + fileExtension);
    },
    onError: function (err, next) {
        //   console.log('error', err);
        next(err);
    }
});

let fileFilter = function (req, file, cb) {
    // accept image files only
    if (req.originalUrl == "/profilepic") {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|)$/i)) {
            req.fileValidationError = "Invalid file type";
            cb(null, true);
        }
        cb(null, true);
    } else if (req.originalUrl == "/add_packages") {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|)$/i)) {
            req.fileValidationError = "Invalid file type";
            cb(null, true);
        }

        cb(null, true);
    }
};

let maxSize = 1 * 1024 * 1024 * 25;
let upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: fileFilter
});

//console.log(upload)
router.get("/", (req, res) => { res.render("home_1") })
router.get(
    "/users",
    Middleware.isLoggedIn,
    Middleware.isAdmin,
    async (req, res) => {
        let aggregate = User.aggregate([{ $match: { role: "client" } }])

            .lookup({
                from: "bookings",
                let: { userId: "$_id" },
                pipeline: [
                    { $addFields: { userId: "$userId" } },
                    { $match: { $expr: { $eq: ["$clientId", "$$userId"] } } },
                    { $project: { _id: 1 } }
                ],

                as: "bookings"
            })

            .project({ __v: 0 });
        const options = {};
        User.aggregatePaginate(aggregate, options).then(result => {
            // console.log('[docs]', result.docs);

            res.render("users", { users: result.docs });
        });
    }
);
router.get("/admin", async (req, res) => {
    let users = await User.find({})
        .sort({ createdAt: -1 })
        .limit(4);
    // let bookings= await Booking.find().sort({createdAt:-1}).limit(6);
    let patients = await Patient.find({})
        .sort({ createdAt: -1 })
        .limit(6);
    let completedCases = await PatCaseTrack.find({ stage: 'completed' })
    let allCases = await PatCaseTrack.find({})
    let aggregate = await PatCaseTrack.aggregate([

        {
            $lookup: {
                from: "patients",
                localField: "patId",
                foreignField: "_id",
                as: "patient"
            }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 6 }
    ])
    // const options = {};
    // let recentCases = await PatCaseTrack.aggregatePaginate(aggregate, options);
    // console.log(recentCases)
    res.render("index", {
        patients,
        recentCases: aggregate,
        users,
        cases: allCases,
        completedCases
    });

    // console.log(data)
});

// router.get(
//   "/client",
//   Middleware.isLoggedIn,
//   Middleware.isClient,
//   async (req, res) => {
//     const { user } = req;
//     let packages = await Package.find()
//       .sort({ createdAt: -1 })
//       .limit(3);
//     let aggregate = Booking.aggregate([
//       { $match: { clientId: mongoose.Types.ObjectId(user._id) } },
//       { $sort: { createdAt: -1 } },
//       { $limit: 3 }
//     ])
//       .lookup({
//         from: "packages",
//         let: { userId: "$packageId" },
//         pipeline: [
//           { $addFields: { userId: "$userId" } },
//           { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
//           { $project: { name: 1, price: 1, loc: 1 } }
//         ],

//         as: "package"
//       })
//       .project({ __v: 0 });
//     const options = {};

//     let bookings = await Booking.aggregatePaginate(aggregate, options);
//     res.render("index", { packages: packages, bookings: bookings.docs });
//   }
// );
router.get(
    "/register_patient",
    Middleware.isLoggedIn,
    Middleware.isAdmin,
    (req, res) => {
        res.render("register_patient");
    }
);

router.post(
    "/register_patient",
    Middleware.isLoggedIn,

    async (req, res) => {
        const { body } = req;

        if (!body.fname ||
            !body.lname ||
            !body.email ||
            !body.phone ||
            !body.gender ||
            !body.occupation ||
            !body.residence
        ) {
            req.flash("error", "All fields should be filled.");
            return res.redirect("back");
        }
        let newPatient = { ...body };
        let idNumtoGenerateQrcode = "";
        if (body.citizenship == "Kenyan") {
            idNumtoGenerateQrcode = body.idNumber;
        } else {
            idNumtoGenerateQrcode = body.passportNum;
        }
        const qr_txt =
            Date.now() +
            crypto.randomBytes(5).toString("hex") +
            body.email +
            idNumtoGenerateQrcode;

        const qr_png = qr.imageSync(qr_txt, { type: "png" });

        const qr_code_file_name =
            new Date().getTime() +
            crypto.randomBytes(5).toString("hex") +
            idNumtoGenerateQrcode +
            ".png";

        await fs.writeFileSync(qr_code_file_name, qr_png, err => {
            if (err) {
                console.log(err);
            }
        });
        await cloudinary.v2.uploader.upload(qr_code_file_name, (error, result) => {
            if (error) {
                console.log(error);
            }
            newPatient = {
                ...newPatient,
                QRcode: qr_png,
                QRcodeImage: result.secure_url
            };
        });
        Patient.findOne({ email: newPatient.email })
            .then(async exists => {
                if (exists) {
                    req.flash("error", "E-mail Already exists");
                    res.redirect("back");
                } else {
                    newPatient = new Patient({ ...newPatient });
                    // console.log(newPackage);
                    newPatient.save().then(newPatient => {
                        //  console.log(newPatient);
                        req.flash("success", "Patient successfully");
                        res.redirect("/patient/" + newPatient._id);
                    })

                }
            })
            .catch(err => {
                console.log(err);
                req.flash("error", err);
                res.redirect("back");
            });
    }
);
router.get("/patients", (req, res) => {
    Patient.find({})
        .then(data => {
            if (data) {
                // console.log(data)
                res.render("patients", { data: data });
            }
        })
        .catch(err => {
            req.flash("error", err);
            res.redirect("back");
        });
});

router.get("/patient/:id", (req, res) => {
    Patient.findOne({ _id: req.params.id })
        .then(data => {
            if (data) {
                // console.log(data)s
                res.render("successfulPatientReg", { data: data });
            }
        })
        .catch(err => {
            req.flash("error", err);
            res.redirect("back");
        });
});

router.get("/staff", (req, res) => {
    User.find({})
        .then(data => {
            if (data) {
                // console.log(data)
                res.render("users", { users: data });
            }
        })
        .catch(err => {
            req.flash("error", err);
            res.redirect("back");
        });
});
//let pictures=upload.single('image');

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/", Middleware.isLoggedIn, (req, res) => { });
}

module.exports = router;