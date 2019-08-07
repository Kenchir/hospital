var express = require("express");
var router = express.Router();
const User = require("../models/user");

const Rating = require("../models/rating");
const House = require("../models/house");
const Comment = require("../models/comments");
const Viewed = require("../models/houseviewed");


var middleware = require("../middleware");


const logger = require('../logger/logger')


//onst { body,validationResult } = require('express-validator/check');

const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require("multer-storage-cloudinary");



cloudinary.config({
    cloud_name: 'do7m8vtor',
    api_key: 885839233384236,
    api_secret: "4gbzBw8I2RwM6N2R-cRQhde5Kts"
});

//Mutler configuration move during refactoring
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
    onError: function (err, next) {
        //   console.log('error', err);
        next(err);
    }
});

var fileFilter = function (req, file, cb) {
    // accept image files only
    if (req.originalUrl == '/profilepic') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|)$/i)) {
            req.fileValidationError = 'Invalid file type';
            cb(null, true);
        }
        cb(null, true);
    } else if (req.originalUrl == '/upload') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|mp4|)$/i)) {
            req.fileValidationError = 'Invalid file type';
            cb(null, true);
        }

        cb(null, true);
    }
};

var maxSize = 1 * 1024 * 1024 * 25
var upload = multer({ storage: storage, limits: { fileSize: maxSize }, fileFilter: fileFilter, })



router.get("/index", (req, res) => {
    res.render("home");
})
router.get('/admin', (req, res) => {
    res.render('index')
})
//renders the registtration page
router.get("/register", (req, res) => {
    res.render("register");
})
router.get("/upload", middleware.isLoggedIn, (req, res) => {
    res.render("upload");
})

//var pictures=upload.single('image');
router.post("/upload", middleware.isLoggedIn, upload.array('images'), async (req, res, next) => {

    let filePaths = req.files;



    let multipleUpload = new Promise(async (resolve, reject) => {
        let upload_len = filePaths.length
            , upload_res = new Array();
        //console.log(upload_len + ' atline 56');
        for (let i = 0; i < upload_len; i++) {
            let filePath = filePaths[i].path;
            await cloudinary.v2.uploader.upload(filePath, (error, result) => {
                //console.log( upload_res.length +"vs"+ upload_len)
                if (upload_res.length === upload_len - 1) {
                    /* resolve promise after upload is complete */
                    upload_res.push(result)
                    resolve(upload_res)
                } else if (result) {
                    /*push public_ids in an array */
                    upload_res.push(result);
                } else if (error) {
                    // console.log(error)
                    reject(error)
                }

            })

        }
    })
        .then((result) => result)
        .catch((error) => error)

    /*waits until promise is resolved before sending back response to user*/
    let upload = await multipleUpload;

    // console.log('atline 84');
    // console.log(upload)
    upload.forEach((upload, ) => {
        newhouse.images.push(upload.secure_url);
    });

    House.create(newhouse)
        .then((house) => {
            //console.log(house.postedBy.username);
            if (house) {
                req.flash('success', "Images successfully uploaded");
                res.redirect("/upload");
                console.log(house)
            }
        })
        .catch((err) => {
            req.flash('error', "An error occured, please check your upload");
            res.redirect("/upload");
        })




});






function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login", middleware.isLoggedIn, (req, res) => {


    });
};



module.exports = router;
