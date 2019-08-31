let express = require("express");
let router = express.Router();
const User = require("../models/user");
const mongoose = require('mongoose');
const Booking = require("../models/booking");
const Package = require("../models/Package");
//const Comment = require("../models/comments");
//const Viewed = require("../models/houseviewed");
const Nodemailer = require("nodemailer");
const formidable = require('formidable')
const Middleware = require("../middleware");
const Conversations = require("../models/conversation");
const Message = require("../models/message");
const crypto = require("crypto");
const fs = require('fs')
const logger = require('../logger/logger')


//onst { body,validationResult } = require('express-validator/check');

const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require("multer-storage-cloudinary");



cloudinary.config({
    cloud_name: 'dgjg3igwq',
    api_key: 814488121398749,
    api_secret: "x6uSLum7fl98ffZHlHVpALC0o04"
});
let token = crypto.randomBytes(7).toString('hex');
//Mutler configuration move during refactoring
const storage = multer.diskStorage({


    filename: function (req, file, callback) {
        let name = req.body.name;
        let fname = '';
        if (name.split(' ').length > 1) {
            name.split(' ').map(each => {
                if (each.length > 0) {
                    fname = fname + each;
                }

            })
        }
        const customName = Date.now() + fname +
            crypto.randomBytes(7).toString('hex');;
        const fileExtension = file.originalname.split('.')[1];

        callback(null, customName + '.' + fileExtension);
    },
    onError: function (err, next) {
        //   console.log('error', err);
        next(err);
    }
});

let fileFilter = function (req, file, cb) {
    // accept image files only
    if (req.originalUrl == '/profilepic') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|)$/i)) {
            req.fileValidationError = 'Invalid file type';
            cb(null, true);
        }
        cb(null, true);
    } else if (req.originalUrl == '/add_packages') {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|)$/i)) {
            req.fileValidationError = 'Invalid file type';
            cb(null, true);
        }

        cb(null, true);
    }
};

let maxSize = 1 * 1024 * 1024 * 25
let upload = multer({ storage: storage, limits: { fileSize: maxSize }, fileFilter: fileFilter })

//console.log(upload)
router.get("/", (req, res) => {
    Package.find({})
        .then(data => {
            if (data) {
                // console.log(data)
                res.render('home', { data: data });
            }
        })
        .catch((err) => {
            req.flash('error', err)
            res.redirect('back');
        })
    // res.render("home");
});
router.get('/users', Middleware.isLoggedIn, Middleware.isAdmin, async (req, res) => {

    let aggregate = User.aggregate([{ $match: { role: 'client' } }])


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
    const options = {

    };
    User.aggregatePaginate(aggregate, options)
        .then(result => {

            // console.log('[docs]', result.docs);


            res.render('users', { users: result.docs })
        })
});
router.get('/admin', Middleware.isLoggedIn, Middleware.isAdmin, async (req, res) => {

    let users = await User.find({ role: 'client' }).sort({ createdAt: -1 }).limit(6);
     let complaints= await Message.find({status:'unread',type:'complaint'});
	let inquiry=await Message.find({status:'unread',type:'inquiry'});
	console.log('Complaint',complaints.length)
    let packages = await Package.find().sort({ createdAt: -1 }).limit(6);
    let aggregate = Booking.aggregate([{ $sort: { createdAt: -1 } }, { $limit: 6 }])
        .lookup({
            from: "packages",
            let: { userId: "$packageId" },
            pipeline: [
                { $addFields: { userId:'$userId'  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { name: 1, price: 1, loc: 1 } }
            ],

            as: "package"
        })
        .lookup({
            from: "users",
            let: { userId: "$clientId" },
            pipeline: [
                { $addFields: { userId:  "$userId"  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { fname: 1, lname: 1, phone: 1 } }
            ],

            as: "client"
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .project({ __v: 0 });
    const options = {

    };
    let bookings = await Booking.aggregatePaginate(aggregate, options)
    console.log(bookings.docs.length)
    res.render('index', { packages: packages, bookings: bookings.docs, users: users,complaints:complaints,inquiry:inquiry  });

    // console.log(data)

});

router.get('/client', Middleware.isLoggedIn, Middleware.isClient, async (req, res) => {
    const { user } = req;
    let packages = await Package.find().sort({ createdAt: -1 }).limit(3)
    let aggregate = Booking.aggregate([{ $match: { clientId: mongoose.Types.ObjectId(user._id) } }, { $sort: { createdAt: -1 } }, { $limit: 3 }])
        .lookup({
            from: "packages",
            let: { userId: "$packageId" },
            pipeline: [
                { $addFields: { userId:  "$userId"  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { name: 1, price: 1, loc: 1 } }
            ],

            as: "package"
        })
        .project({ __v: 0 });
    const options = {};

    let bookings = await Booking.aggregatePaginate(aggregate, options)
    res.render('index', { packages: packages, bookings: bookings.docs});
})
router.get('/add_packages', Middleware.isLoggedIn, Middleware.isAdmin, (req, res) => {

    res.render('add_package');
});


router.post('/add_packages', Middleware.isLoggedIn, upload.array('packagePic'), async (req, res) => {
    const { body, files, user } = req;
    // console.log(body, files)
    const filePaths = files;

    // if (!body.name || !body.type || !body.loc || !body.price || !body.desc || !body.feature || filePaths.length < 3) {
    //     req.flash('error', 'All fields should be filled including  3 image upload')
    //     return res.redirect('back');

    // }
    let newPackage = {};
    newPackage = { ...body, images: [] };
    let multipleUpload = new Promise(async (resolve, reject) => {
        let upload_len = filePaths.length
            , upload_res = new Array();
        // console.log(filePaths)
        for (let i = 0; i < upload_len; i++) {
            let filePath = filePaths[i].path;

            await cloudinary.v2.uploader.upload(filePath, (error, result) => {
                //console.log( upload_res.length +"vs"+ upload_len)
                if (upload_res.length === upload_len - 1) {
                    /* resolve promise after upload is complete */
                    upload_res.push(result)
                    // console.log('Upload Response', upload_res)
                    resolve(upload_res)
                } else if (result) {
                    // console.log('Upload Response', upload_res)
                    /*push public_ids in an array */
                    upload_res.push(result);
                } else if (error) {
                    console.log('Error', error)
                    reject(error)
                }

            })

        }
    })
        .then((result) => result)
        .catch((error) => error)
    let upload = await multipleUpload;
    upload.forEach((upload, ) => {
        newPackage.images.push(upload.secure_url);
    });
    //console.log(newPackage)
    Package.findOne({ name: newPackage.name })
        .then(async (package) => {
            if (package) {

                await fs.unlinkSync(file.path)
                req.flash('error', 'Package Name Already exists')
                res.redirect('back');
            } else {


                newPackage = new Package({ ...newPackage, addedBy: user._id });
                // console.log(newPackage);
                newPackage.save();
                console.log(newPackage)
                req.flash('success', 'Package added successfully')
                res.redirect('back');
            }
        })
        .catch((err) => {
            console.log(err)
            req.flash('error', err)
            res.redirect('back');
        })

})

router.get('/packages', Middleware.isLoggedIn, (req, res) => {
    Package.find({})
        .then(data => {
            if (data) {
                // console.log(data)
                res.render('packages', { data: data });
            }
        })
        .catch((err) => {
            req.flash('error', err)
            res.redirect('back');
        })
})
router.get('/packages/:id/view', Middleware.isLoggedIn, (req, res) => {
    Package.findOne({ _id: req.params.id })
        .then((data) => {
            if (data) {
                // console.log(data)
                res.render('each_package', { report: data });
            }
        })
        .catch((err) => {
            req.flash('error', err)
            res.redirect('back');
        })
});
router.get('/edit_package/:id', Middleware.isLoggedIn, Middleware.isAdmin, (req, res) => {
    Package.findOne({ _id: req.params.id })
        .then((data) => {
            if (data) {
                // console.log(data)
                res.render('edit_package', { report: data });
            }
        })
        .catch((err) => {
            req.flash('error', err)
            res.redirect('back');
        })
});
router.get('/book_package/:id', Middleware.isLoggedIn, (req, res) => {
    Package.findOne({ _id: req.params.id })
        .then((data) => {
            if (data) {
                // console.log(data)
                res.render('book', { report: data });
            }
        })
        .catch((err) => {
            req.flash('error', err)
            res.redirect('back');
        })
});
router.post('/book_package/:id', Middleware.isLoggedIn, (req, res) => {
    const { user, body } = req;
    console.log(body)
    if (!body.bookType) {
        req.flash('error', 'You must select the type of booking')
        return res.redirect('back');

    } else if ((body.bookType == 'multiple') && (!body.peopleNum)) {
        req.flash('error', 'You  must specify the number of people ')
        return res.redirect('back');
    }
    Package.findOne({ _id: req.params.id })
        .then((data) => {
            let amount = '';
            if (body.bookType == 'single') {
                amount = data.price;
            } else {
                amount = data.price * body.peopleNum;
            }
            let newBooking = {
                packageId: data._id,
                clientId: user._id,
                type: body.bookType,
                amount: amount,
                status: 'pending'
            }
            if (body.bookType == 'multiple') {
                newBooking = { ...newBooking, peopleNum: body.peopleNum }
            }
            newBooking = new Booking({ ...newBooking })
            newBooking.save();
            // console.log(newBooking);
            req.flash('success', 'Your travel booking has been submitted successfully')
            res.redirect('back');

        })
        .catch((err) => {
            console.log(err)
            req.flash('error', err)
            res.redirect('back');
        })
});
// router.get("/upload", middleware.isLoggedIn, (req, res) => {
//     res.render("upload");
// })
router.get('/my_bookings', Middleware.isLoggedIn, (req, res) => {
    const { user } = req;



    let aggregate = Booking.aggregate([{ $match: { clientId: mongoose.Types.ObjectId(user._id) } }])


        .lookup({
            from: "packages",
            let: { userId: "$packageId" },
            pipeline: [
                { $addFields: { userId: "$userId"  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { name: 1, price: 1, loc: 1 } }
            ],

            as: "package"
        })
        .lookup({
            from: "users",
            let: { userId: "$clientId" },
            pipeline: [
                { $addFields: { userId:  "$userId"  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { fname: 1, lname: 1, phone: 1 } }
            ],

            as: "client"
        })
        .project({ __v: 0 });
    const options = {

    };
    Booking.aggregatePaginate(aggregate, options)
        .then(result => {

            console.log('[docs]', result.docs);


            res.render('mybookings', { data: result.docs })
        })


})
router.get('/bookings', Middleware.isLoggedIn, Middleware.isAdmin, async(req, res) => {
    const { user } = req;



    let aggregate = Booking.aggregate()


        .lookup({
            from: "packages",
            let: { userId: "$packageId" },
            pipeline: [
                { $addFields: { userId: "$userId"  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { name: 1, price: 1, loc: 1 } }
            ],

            as: "package"
        })
        .lookup({
            from: "users",
            let: { userId: "$clientId" },
            pipeline: [
                { $addFields: { userId: "$userId"  } },
                { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                { $project: { fname: 1, lname: 1, phone: 1 } }
            ],

            as: "client"
        })
        .project({ __v: 0 });
    const options = {

    };
    Booking.aggregatePaginate(aggregate, options)
        .then(result => {

            //console.log('[docs]', result.docs);


            res.render('bookings', { data: result.docs })
        })


})
//let pictures=upload.single('image');

router.get('/booking/confirm/:id',Middleware.isLoggedIn,Middleware.isAdmin,async(req,res)=>{
	await Booking.findOneAndModify({_id:req.params.id},{status:'confirmed'},{new:true})
	res.redirect('back')
});



router.get('/complains', Middleware.isLoggedIn, Middleware.isClient, async(req, res) => {
	let msgs= await Message.find({from:req.user._id,type:'complaint'}).sort({createdAt:1});
	console.log(msgs)
    res.render('clientComplains',{msgs:msgs})
});

router.post('/complainspost', Middleware.isLoggedIn, (req, res) => {
    const { user, body } = req;
	if(!body.msg){
		return res.redirect('back');
	}
    let msg={
		from:user._id,
		type:'complaint',
		msg:body.msg	
	}
	msg=new Message({...msg});
	msg.save()
	.then(data=>{
		req.flash('success','Complaint sent successfully')
		res.redirect('back')
	})
	.catch(err=>{
		console.log(err)
	})	

});
router.post("/upload", Middleware.isLoggedIn, upload.array('images'), async (req, res, next) => {

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
    res.redirect("/", Middleware.isLoggedIn, (req, res) => {


    });
};



module.exports = router;
