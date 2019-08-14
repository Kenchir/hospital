var express = require("express");
var router = express.Router();
const User = require("../models/user");
const House = require("../models/Package");

const Booking = require("../models/booking");

const Comment = require("../models/comments");
const Viewed = require("../models/houseviewed");
var passport = require("passport");
var moment = require("moment");
var middleware = require("../middleware");
var crypto = require("crypto");
//const jwt                  = require("jsonwebtoken");
const Lowercase = require("lower-case");
const SignUp = require('../models/validation/signUp.js');


//const register             = require('../models/validation/register.js');
const session = require("express-session");
const logger = require('../logger/logger');
//const logger = require('./logger').createLogger('development.log');
const async = require("async");
const Nodemailer = require("nodemailer");
//onst { body,validationResult } = require('express-validator/check');

const cryptoRandomString = require('crypto-random-string');
const multer = require('multer');
const cloudinary = require('cloudinary');
const xoauth2 = require("xoauth2");

//cloudinary config
cloudinary.config({
    cloud_name: 'devteamke',
    api_key: 442155129588629,
    api_secret: "ylF7sUCL0j1cb9rt0Khgk6inG_s"
});

var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })
router.get("/login", (req, res) => {

    res.render("login");
})
//renders the registtration page
router.get("/register", (req, res) => {
    res.render("register");
})
router.post("/login", passport.authenticate("local", { failureFlash: "Sorry, Wrong Credentials!", failureRedirect: "/login" }), function (req, res) {
    logger.infoLog.info(middleware.capitalize(req.user.username) + " has just logged in " + " at " + moment(moment().valueOf()).format('h:mm:a,  Do MMMM  YYYY,,'))
    if ((req.user.role == 'house-Owner') && (req.user.isVerified == false)) {
        req.flash('error', 'Your Account has not been verified. Kindly Check your email  registration to verify your account.')
        res.redirect('back');
        delete req.session.returnTo;
    } else {
        req.flash("success", "Login successful!")
        res.redirect(req.session.returnTo || '/admin');
        delete req.session.returnTo;
    }


});
router.get("/logout", function (req, res) {

    if (req.isAuthenticated()) {

        logger.infoLog.info(middleware.capitalize(req.user.username) + " has just logged out " + " at " + moment(moment().valueOf()).format('h:mm:a, Do MMMM  YYYY,'))
        req.logout();
        req.session.destroy(function (err) {
            if (err) {
                logger.errorLog.error(err);
            } else {

                res.redirect("/login");
            }
        });
    } else {
        req.flash('error', 'Your were not logged in');
        res.redirect("/login");
    }

});
//register for authentication
router.post("/register", async (req, res, next) => {
    //console.log(req.body);
    let token = crypto.randomBytes(25).toString('hex');
    logger.infoLog.info("User registration request received from " + middleware.capitalize(req.body.fname));
    console.log(req.body);
    logger.infoLog.info("Name: " + middleware.capitalize(req.body.fname) + "email: " + req.body.email + " has requested registration" + " at " + moment(moment().valueOf()).format('h:mm:a,  Do MMMM  YYYY,'));
    let isValid = SignUp.validate({
        uname: req.body.uname,
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.pass1,
    });
    //console.log(isValid.value.role)

    if (isValid.error) {
        // console.log(isValid.value.password)
        //Add response to invalid on client side
        req.flash("error", isValid.error.message);
        res.redirect("back");
        return;
    }

    if (isValid.value.password != req.body.pass2) {
        req.flash("error", "Password do not match");
        res.redirect("back");
        return;
    }
    User.findOne({ email: isValid.value.email }, (error, email) => {
        if (email) {
            req.flash("error", " The email you entered is already in use !");
            res.redirect("back");
        }
    })

    // console.log("successful")
    //check if email does not exists      
    User.findOne({ username: isValid.value.uname }, (error, email) => {
        if (email) {
            req.flash("error", " The email you entered is already in use !");
            res.redirect("back");
        } else {
            let user = {
                username: isValid.value.uname,
                fname: isValid.value.fname,
                verifyToken: token,
                verifyExpires: Date.now() + 3600000,
                lname: isValid.value.lname,
                phone: isValid.value.phone,
                role: 'client',
                email: isValid.value.email
            }
            User.register(new User({
                ...user

            }), isValid.value.password, (err, newuser) => {
                console.log(newuser)
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("register");
                } else {
                    //   console.log(user)
                    //return
                    //req.flash("success","New admin has added successful.")
                    //logger.infoLog.info(isValid.value.fname + " has requested for registration");
                    //console.log(token);
                    //  Notify.create({body:' A new admin has just registered',
                    //                 type:'new_admin',
                    //                 ref_id:user._id

                    //   },(err,notification)=>{
                    //      req.io.sockets.to('masterRoom').emit('new-report/admin', user)
                    //  })
                    if (user.role == 'admin') {
                        async.waterfall([
                            (done) => {
                                var smtpTransport = nodemailer.createTransport({
                                    host: 'smtp.gmail.com',
                                    port: 465,
                                    secure: true,
                                    auth: {
                                        type: 'OAuth2',
                                        user: 'kipkogeichirchir2@gmail.com',
                                        clientId: '719159077041-lorf8m8a343e5lvorcb30grmuivj83gj.apps.googleusercontent.com',
                                        clientSecret: 'amUTHetZ4xgJGU8TZotQYzId',
                                        refreshToken: '1/ApjZeSbzzalpBvpqAcF4qUetTjZsDeI8qV2J9aEsXAI'
                                    }
                                })

                                var mailOptions = {
                                    to: isValid.value.email,
                                    from: 'kipkogeichirchir2@gmail.com',
                                    subject: 'House Recommender community',
                                    text: 'Hello \b' + user.fname + '\b' + '\n\n' + 'Your request for house-Owner registration has been received. Kindly click the link below or paste it in browser for verification' + '\n\n' +
                                        'http://' + req.headers.host + '/confirmaccount/' + user.verifyToken + '\n\n' +
                                        'Welcome to House Recommender'
                                };
                                smtpTransport.sendMail(mailOptions, (err, info) => {
                                    if (err) {
                                        req.flash("error", err.message);
                                        res.redirect('back');
                                    } else {
                                        req.flash('success', 'Your registration was successful. A mail has been sent to your regi e-mail for verification ');
                                        res.redirect("/login");

                                    }
                                });
                            }
                        ], (err) => {
                            console.log(err);
                        }
                        )

                    } else {
                        req.flash('success', 'Your registration was successful, You can now login');
                        res.redirect("/login");
                    }


                }
            });
        }
    });

});

router.get("/add_admin", middleware.isLoggedIn, middleware.isMasterAdmin, (req, res) => {
    res.render("add_admin");
});
router.post('/add_admin', middleware.isLoggedIn, middleware.isMasterAdmin, async (req, res) => {
    var token = crypto.randomBytes(25).toString('hex');
    crypto.randomBytes(20, function (err, buf) {
        token = buf.toString('hex');
    });
    const { body, user } = req;
    logger.infoLog.info("Admin registration request received from " + middleware.capitalize(req.user.username));
    //console.log(req.body);
    //console.log("A new admin " + middleware.capitalize(req.body.fname)  +" using email: " + req.body.email + " has requested registration" + " at " + moment(moment().valueOf()).format('h:mm:a,  Do MMMM  YYYY,'));

    if (!body.email || !body.fname || !body.lname) {
        req.flash("error", 'All fields must be filled');
        return res.redirect("back");
    }


    var password = "123";

    var username = Lowercase(body.fname) + Math.floor(Math.random() * (+10 - +0)) + +1;

    User.findOne({ email: body.email }, async (error, email) => {
        if (email) {

            req.flash("error", " The email you entered is already in use !");
            res.redirect("add_admin");
        } else {

            User.register(new User({
                username,
                fname: body.fname,
                verifyToken: token,
                isActive: false,
                verifyExpires: Date.now() + 3600000,
                lname: body.lname,

                email: body.email,
                // yearOfHire: today,
                role: 'admin',

                registeredBy: user._id
            }), password, async (err, user) => {
                if (err) {
                    req.flash("error", err.message);
                    res.redirect("add_admin");
                } else {
                    //req.flash("success","New admin has added successful.")
                    logger.infoLog.info(body.fname + " has been successfully registered ");
                    //console.log(token);
                    // console.log(user);
                    logger.infoLog.info("Sending" + body.fname + " email for account completion setup  ");
                    const infoToSend = {
                        message: 'Hello \b' + user.fname + '\b' + '\n\n' + 'You are receiving this  from Benita Travelsil that you have been added as an Admin. Complete by  setting up your password for the account' + '\n\n' +
                            'Click on the link or paste it into your browser to go on.' + '\n\n' + ' Your Username:\b' + username + '\b' + '\n\n' +
                            'http://' + req.headers.host + '/confirmaccount/' + user.verifyToken + '\n\n' +
                            'Welcome to Benita Travels',
                        subject: 'Admin registration',
                        receiver: body.email
                    }
                    const smtpTransport = await Nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            type: 'OAuth2',
                            user: 'info.benitatravels@gmail.com',
                            clientId: '122527083108-gvkneborudehmsfmo0n8miencd9erut9.apps.googleusercontent.com',
                            clientSecret: '_f2d9Bzb-evU_nziBamReUpX',
                            refreshToken: '1/U9s9uESVN5Qe-8QBTPvoGl3yULVQF2RBhL9ZC7Qdm18'
                        }
                    })
                    let mailOptions = {
                        to: infoToSend.receiver,
                        from: 'info.benitatravels@gmail.com',
                        subject: infoToSend.subject,
                        text: infoToSend.message,
                    };
                    await smtpTransport.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            req.flash('error', err)
                            res.redirect("back")
                            //console.log('It was here err', status)
                        } else {
                            // console.log(info)
                            req.flash('success', 'Your registration was successful. A mail has been sent to added user for sign up completion ');
                            res.redirect("back");

                        }

                    });

                }
            });
        }
    });
});
router.get("/profile", middleware.isLoggedIn, async (req, res) => {

    res.render("profile");
})

router.post("/profile", middleware.isLoggedIn, upload.single('profilepic'), async (req, res) => {

    let filePaths = req.file.path;

    let promise = new Promise((resolve) => {
        cloudinary.v2.uploader.upload(filePaths, (error, result) => {

            resolve(result.secure_url)
        });
    })
    let image = await promise;
    console.log(image)

    User.findById(req.user._id)
        .then((founduser) => {
            founduser.profilepic = image;
            founduser.title = req.body.title;
            founduser.marital = req.body.marital;
            founduser.fname = req.body.fname;
            founduser.lname = req.body.lname;
            founduser.save((err, user) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(user)
                }
            });
            console.log(founduser)
            res.redirect('/index');
        })
        .catch((err) => {
            console.log(err)
        })


})

router.get("/confirmaccount/:token", (req, res) => {
    var token = req.params.token;
    console.log(token);
    User.findOne({ 'verifyToken': token }, (err, user) => {
        if (user) {
            if (user.isVerified) {
                req.flash('error', 'The account has been verified');
                res.render("login");
            } else {


                res.render("complete", { token: token });
            }
        }
        else {
            logger.infoLog.info("A user has just tried to confirm account with an expired token");
            req.flash('error', 'Confirm Account token is invalid or has expired. Contact Master Admin');
            res.redirect("/login");
        }
    })
});

router.post("/confirmaccount/:token", (req, res) => {
    var token = req.params.token;
    // console.log(token, 'Gor');
    User.findOne({ 'verifyToken': token }, (err, user) => {
        const { body } = req;
        // console.log(body)
        if (user) {
            if (user.isVerified) {
                // console.log('it was jhere')
                req.flash('error', 'The account has been verified');
                res.redirect("/login");
            } else {
                if (!body.pass1 || !body.pass2 || !body.phone) {
                    req.flash("error", 'All fields must be filled');
                    return res.redirect("back");
                }
                if (body.pass1.length < 8) {
                    req.flash("error", 'Password must have more than 8 digits');
                    return res.redirect("back");
                }
                if (body.pass1 != body.pass2) {
                    req.flash("error", 'Password not the same');
                    return res.redirect("back");
                }

                user.isVerified = true;
                user.phone = body.phone;
                user.save();
                user.setPassword(body.pass1, function (err, user) {
                    user.save((user, err) => {//saves the new details for the user to database
                        if (err) {
                            req.flash("err", "something went wrong");
                            res.redirect("back");
                        } else {
                            console.log(user)
                            req.flash('success', 'Changes Succesfully submitted. You can Login');
                            res.redirect("/login");

                        }
                    });
                });

            }
        }
        else {
            logger.infoLog.info("A user has just tried to confirm account with an expired token");
            req.flash('error', 'Confirm Account token is invalid or has expired. Contact Master Admin');
            res.redirect("/login");
        }
    })
});

router.post("/changepassword/:id", (req, res) => {
    async.waterfall([
        function (done) {
            User.findOne({ username: req.user.username }, function (err, user, next) {
                console.log(user);
                if (user) {
                    // console.log('code')
                    console.log(req.body.password + " vs " + req.body.confirmPassword);
                    if (req.body.password === req.body.confirmPassword) {
                        user.setPassword(req.body.password, function (err, user) {
                            user.save(function (err) {//saves the new details for the user to database
                                if (err) {
                                    req.flash("err", "something went wrong");
                                    res.redirect("back");
                                } else {
                                    req.flash('success', 'Password Succesfully Changed.');
                                    res.redirect("back");

                                }
                            });
                        });
                    } else {
                        req.flash('error', 'Passwords does not match');
                        res.redirect("/profile");
                    }
                    //  console.log(req.user.email);

                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'webemailkip@gmail.com',
                    pass: 'parcel1002017'

                }
            });
            var mailOptions = {
                to: user.email,
                from: 'webemailkip@gmail.com',
                subject: 'Street Sweeper Account Confirmation',
                html: "Hello \b" + req.body.username + "\bYour apssword has been successfully changed"
                    + "Welcome"
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                logger.infoLog.info(middleware.capitalize(user.username) + " has successfully changed their password");
                req.flash('success', 'Password was successfully changed.');
                res.redirect("/panel");
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) {
            return next();

        }

    }
    )
});




router.get("/resetPassword", function (req, res, err) {
    res.render("forgot_password");
});

router.post("/resetPassword", function (req, res, next) {
    console.log(req.body)
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });

        },
        function (token, done) {

            if (req.body.email) {
                var email = req.body.email;
            } else {
                req.flash("error", " You have not entered a valid email");
                res.redirect('back');
            }

            User.findOne({ email: email }, function (err, user) {
                if (!user) {
                    //  console.log(err + "No accont exists");
                    req.flash("error", " The email you entered does not belong to an account !");
                    res.redirect('back');
                } else {

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000;//1hr
                    user.save(function (err) {
                        done(err, token, user);

                    });
                }

            });
        },
        function (token, user, done) {
            const smtpTransport = Nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: 'info.benitatravels@gmail.com',
                    clientId: '122527083108-gvkneborudehmsfmo0n8miencd9erut9.apps.googleusercontent.com',
                    clientSecret: '_f2d9Bzb-evU_nziBamReUpX',
                    refreshToken: '1/U9s9uESVN5Qe-8QBTPvoGl3yULVQF2RBhL9ZC7Qdm18'
                }
            })
            let mailOptions = {
                to: infoToSend.receiver,
                from: 'info.benitatravels@gmail.com',
                subject: 'Benia Account Password Reset',
                text: 'You are receiving this  mail to set your password and account  ' + '\n\n' +
                    'Click on the link or paste it into your browser to go on and reset your password' + '\n\n' +
                    'http://' + req.headers.host + '/resetpassword/' + token + '\n\n' +
                    'if you did not request password reset . Kindly  ignore this email'
            };

            smtpTransport.sendMail(mailOptions, function (error, response) {
                //  console.log(mailOptions);
                if (error) {
                    console.log(error)
                    req.flash('error', 'An error occured,please try again');
                    res.redirect('back')
                } else {
                    logger.infoLog.info(middleware.capitalize(user.username) + " has requested for password reset " + " at " + moment(moment().valueOf()).format('h:mm:a, Do MMMM  YYYY,'))
                    req.flash('success', 'A mail has been sent to you with further instructions to reset your password. Check your email.');
                    res.redirect("/login")

                }
            });
        }
    ], function (err) {
        if (err) {
            console.log(err);
            req.flash('error', 'An error occured,please try again');
            res.redirect('back')
        } else {
            req.flash('error', 'An error occured,please try again');
            res.redirect('back')
        }
    });
});

router.get("/resetPassword/:token", function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token }, function (err, user) {
        if (!user) {
            // console.log("token time has expired or invalid");
            req.flash('error', 'reset password token is invalid or has expired');
            res.redirect("/login");
        }
        else {

            res.render("resetpass", { token: req.params.token });

        }
    })
});

//Reset password

router.post("/resetPassword/:token", function (req, res) {
    console.log(req.body.pass1)
    User.findOne({ resetPasswordToken: req.params.token }, function (err, user, next) {
        if (!user) {
            // console.log("token time has expired or invalid");
            // console.log(err);
            req.flash('error', 'reset password token is invalid or has expired');
            res.redirect("/login");
            return;
        }
        if (req.body.pass1 === req.body.pass2) {
            //console.log(req.body.password);
            //  console.log(req.user.email);
            // console.log(user)
            user.setPassword(req.body.pass1, function (err) {


                user.resetPasswordToken = undefined;//The reset tokesn are removed
                user.save();
                console.log(user)
                if (err) console.log(err)

                req.flash('success', 'Password Succesfully changed');
                res.redirect('/login')

            });
        } else {
            req.flash('error', 'Password do not match');
            res.redirect("back");
        }
    });


});

router.get("/contact", async (req, res, next) => {
    res.render("contact")
})

router.post("/contact", async (req, res, mext) => {
    console.log(req.body)
    if (!req.body.name) {
        req.flash('error', 'You must include your name')
        res.redirect('back')
    } else if (!req.body.mail) {
        req.flash('error', 'You must include your email')
        res.redirect('back')
    } else if (!req.body.message) {
        req.flash('error', 'You must leave a message')
        res.redirect('back')
    } else if (!req.body.subject) {
        req.flash('error', 'You must include the message subject')
        res.redirect('back')
    } else {
        async.waterfall([
            function (done) {
                var smtpTransport = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        type: 'OAuth2',
                        user: 'kipkogeichirchir2@gmail.com',
                        clientId: '719159077041-lorf8m8a343e5lvorcb30grmuivj83gj.apps.googleusercontent.com',
                        clientSecret: 'amUTHetZ4xgJGU8TZotQYzId',
                        refreshToken: '1/ApjZeSbzzalpBvpqAcF4qUetTjZsDeI8qV2J9aEsXAI'
                        // accessToken: 'ya29.GlvgBgOy44LT1c4VzPnrNCI6k_oTWxDYan6vy_FE1VBJU_Yn-HyG1iWBYAdKUEfcEgHFF7gdPoL7HsgeG_M0JksfYVCZIVUvg7vgmuKodn-KBnLshpuiZcjo0aXp'
                    }


                })
                // console.log(smtpTransport)

                var mailOptions = {
                    to: 'kipkogeichir2@gmail.com',
                    from: 'kipkogeichirchir2@gmail.com',
                    subject: req.body.subject,
                    text: req.body.message + '\n User E-mail: ' + req.body.mail + '\n Name:' + req.body.name
                };
                smtpTransport.sendMail(mailOptions, function (err, info) {
                    //req.io.sockets.to('masterRoom').emit('new-admin', uname) 
                    if (err) {
                        console.log(err)
                        res.redirect('back');
                    } else {
                        console.log(info)
                        req.flash('success', 'Your message has been sent. Wait for response in your mail');
                        res.redirect("back");
                    }

                    // console.log(info);
                    //done(err, 'done');
                });
            }
        ], function (err) {
            if (err) {
                // return next();
                console.log(err);
            } else {

            }
        });
    }

})













//imekubali
//Yeah. Thanks.  Na venye hiyo error imenikula time
module.exports = router;
