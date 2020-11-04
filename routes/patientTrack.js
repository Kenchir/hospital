let express = require("express");
let router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const Lab= require("../models/Lab");
const Patient = require("../models/Patients");
const Middleware = require("../middleware");
const PatCaseTrack = require("../models/PatCaseTrack");
const Triage = require("../models/Triage");
const Diagnosis=require("../models/Diagnosis");
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
    console.log("ID",req.params.id)
    const newCase = new PatCaseTrack({
        patId: req.params.id,
        stage: 'nurse'
    })

    newCase.save();
    console.log(newCase)
    req.flash("success", "case started , advice patient to go to nurse");
    res.redirect("back");
});
router.get("/patient_waitingnurse", Middleware.isLoggedIn, async (req, res) => {
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
    res.render("patientWaitingNurse", { data: aggregate });
})
router.get("/vitals_input/:id", async (req, res) => {

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
router.post("/vitals_input/:id", async (req, res) => {
    const { body } = req
    if (!body.temperature || !body.respiration || !body.weight || !body.bloodPressure) {
        req.flash("error", "All fields should be filled")
        res.redirect("back")
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
router.get("/patient_waitingdoc", Middleware.isLoggedIn, async (req, res) => {
    let aggregate = await PatCaseTrack.aggregate([{
        $match: {
            stage: 'doc'
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
    res.render("patientWaitingdoc", { data: aggregate });
})
router.get("/patient_waitingdoc_afterlab", Middleware.isLoggedIn, async (req, res) => {
    let aggregate = await PatCaseTrack.aggregate([{
        $match: {
            stage: 'doc_recommend'
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
    res.render("patientWaitingdocAfterLab", { data: aggregate });
})
router.get("/patientshist", Middleware.isLoggedIn, async (req, res) => {
    let aggregate = await PatCaseTrack.aggregate([{
        $match: {
            stage: 'completed'
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
    res.render("hist", { data: aggregate });
})
router.get("/patientshist/:id", async (req, res) => {

   const patcase=await PatCaseTrack.findOne({ '_id': req.params.id});
   console.log(patcase)
   const triage=await Triage.findOne({caseId:patcase._id});
   console.log(triage)
   const pat=await Patient.findOne({_id:mongoose.Types.ObjectId(patcase.patId)});
   const labR=await Lab.findOne({caseId:patcase._id});
   const d=await Diagnosis.findOne({caseId:patcase._id});
   res.render("history", { data: pat, triage: triage,patId:patcase._id,lab:labR,d })
})
router.get("/patientWaitingdoc/:id", async (req, res) => {

    PatCaseTrack.findOne({ '_id':mongoose.Types.ObjectId(req.params.id )})
        .then(patcase => {
            Triage.findOne({ caseId: patcase._id })
                .then(triage => {
                    Patient.findOne({ _id: patcase.patId })
                        .then(pat => {
                            res.render("triageOutput", { data: pat, triage: triage,patId:patcase._id })
                        })
                })
        })
        .catch(err => { console.log(err) })

});

router.get("/patient_waitingdoc_afterlab/:id", async (req, res) => {

    PatCaseTrack.findOne({ '_id': req.params.id})
        .then(patcase => {
            Triage.findOne({ caseId: patcase._id })
                .then(triage => {
                    Patient.findOne({ _id: patcase.patId })
                        .then(pat => {
                            Lab.findOne({caseId:patcase._id}).then(labR=>{
                                res.render("labOutput", { data: pat, triage: triage,patId:patcase._id,lab:labR })
                            })
                           
                        })
                })
        })
        .catch(err => { console.log(err) })

})
router.get("/diagnosis/:id", async (req, res) => {

   
    res.render("diagnosis",{data:{_id:req.params.id}})
})
router.post("/diagnosis/:id", async (req, res) => {
    const {body}=req;
    if(!body.diagnosis||!body.prescription){
        req.flash("error","All fields should be filled");
        res.redirect("back");
    }
    let diagnosis=new Diagnosis({
        caseId:req.params.id,
        ...body});
    PatCaseTrack.findOneAndUpdate({ _id: req.params.id }, { stage: 'completed' }).then(async patient => {
        await diagnosis.save();
        const data = await Patient.findOne({ _id: patient.patId })
        req.flash("success", "Success!. The patient should now proceed pharmacy")
        res.redirect("/admin")

    })
        .catch(err => {
            console.log(err)
        })

    
})
router.get("/sendlab/:id", async (req, res) => {
console.log(req.params.id);
    var mongoose = require('mongoose');
    var id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
    PatCaseTrack.findOne({ '_id':mongoose.Types.ObjectId(req.params.id) }).then(async patient => {
        console.log(patient)
        patient.stage='lab';
       await patient.save();
        req.flash("success", "Success!.Request made to the lab technician")
        res.redirect("/admin")

    })
        .catch(err => {
            console.log(err)
        })

})
router.get("/patient_waitinglab", Middleware.isLoggedIn, async (req, res) => {
    let aggregate = await PatCaseTrack.aggregate([{
        $match: {
            stage: 'lab'
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
    res.render("patientWaitingLab", { data: aggregate });
})
router.get("/patient_waitinglab/:id", async (req, res) => {

    
    res.render("lab_input",{data:req.params.id})
})

router.post("/patient_waitinglab/:id", async (req, res) => {
    const { body } = req
    if (!body.ph || !body.sugar || !body.protein || !body.Urinalysis||!body.hemoglobin||!body.bloodCount) {
        req.flash("error", "All fields should be filled")
        res.redirect("back")
    }
console.log(body)
    const newLab = new Lab({
        caseId: req.params.id,
        ...body
    })
    PatCaseTrack.findOneAndUpdate({ _id: req.params.id }, { stage: 'doc_recommend' }).then(async patient => {
        await newTriage.save();
        const data = await Patient.findOne({ _id: patient.patId });
        const triage=await Triage.findOne({caseId:req.params.id});
        req.flash("success", "Success!. The patient should now proceed to see the doctor")
        res.render("triageOutput", { data: data, lab: newLab,triage:triage })

    })
        .catch(err => {
            console.log(err)
        })

})
router.get("/patientWaitingdoc/:id", async (req, res) => {

    PatCaseTrack.findOne({ '_id': req.params.id })
        .then(patcase => {
            Triage.findOne({ caseId: patcase._id })
                .then(triage => {
                    Patient.findOne({ _id: patcase.patId })
                        .then(pat => {
                            res.render("triageOutput", { data: pat, triage: triage })
                        })
                })
        })
        .catch(err => { console.log(err) })

})

module.exports = router;