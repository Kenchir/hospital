let express = require("express");
let router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const LabReq = require("../models/LabTestReq");
const Patient = require("../models/Patients");
const Middleware = require("../middleware");
const PatCaseTrack = require("../models/PatCaseTrack");
const Triage = require("../models/Triage")
    //The router to render all patients
router.get("/start_case", Middleware.isLoggedIn, (req, res) => {

    Patient.find({})
        .then(data => {
            console.log(data)
            res.render("patients", { data: data });
        })
        .catch(err => {
            console.log(derr);
        });
});
let coghjh = { hdjhdj: 2763733, hddh: 3874874847 }
router.get("/start_case/:id", Middleware.isLoggedIn, (req, res) => {
    const newCase = new PatCaseTrack({
        patId: req.params.id,
        stage: 'nurse'
    })

    newCase.save();
    console.log(newCase)
    req.flash("success", "case started , advice patient to go to nurse");
    res.redirect("back");
})
router.get("/patient_waitingnurse", Middleware.isLoggedIn, async(req, res) => {
    let aggregate = await PatCaseTrack.aggregate([{
                $match: {
                    stage: 'nurse'
                }
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patId",
                    foreignField: "_id",
                    as: "patient"
                }
            }
        ])
        //  console.log(aggregate)
    const options = {};

    // const data = await PatCaseTrack.aggregatePaginate(aggregate, options);
    //  console.log(data.docs)
    res.render("patientwaitingNurse", { data: aggregate });
})
router.get("/vitals_input/:id", async(req, res) => {

    let aggregate = await PatCaseTrack.aggregate([{
            $match: {
                _id: mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $lookup: {
                from: "patients",
                localField: "patId",
                foreignField: "_id",
                as: "patient"
            }
        }
    ])
    console.log(aggregate)
    res.render("vitals_input", { data: aggregate[0] })
})
router.post("/vitals_input/:id", async(req, res) => {
    const { body } = req
    if (!body.temperature || !body.respiration || !body.weight || !body.bloodPressure) {
        req.flash("error", "All fields should be filled")
        req.redirect("back")
    }

    const newTriage = new Triage({
        caseId: req.params.id,
        nurseId: req.user._id,
        ...body
    })
    PatCaseTrack.findOneAndUpdate({ _id: req.params.id }, { stage: 'doc' }).then(async patient => {
            await newTriage.save();
            const data = await Patient.findOne({ _id: patient.patId })
            req.flash("success", "Success!. The patient should now proceed to see the doctor")
            res.render("triageOutput", { data: data, triage: newTriage })

        })
        .catch(err => {
            console.log(err)
        })

})


module.exports = router;