const User = require("../models/user");

const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");
const express = require("express");
const app = express();
const middlewareObj = {};
const moment = require("moment");
const xoauth2 = require("xoauth2");
const QRCode = require("qrcode");

const logger = require("../logger/logger");

middlewareObj.isLoggedIn = function(req, res, next) {
 
    return next();
  
 
};
middlewareObj.generateQRCode = (uniqueNum, email, id) => {
  console.log("recently");
  let qrCodeGenerated = "";
  QRCode.toFile(
    "../public/" + id + uniqueNum + email,
    [{ data: Buffer.from([253, 254, 255]), mode: "byte" }],
    (err, url) => {
      qrCodeGenerated = url;
      console.log(url);
    }
  );
  return qrCodeGenerated;
};
//To check is user is Admin

middlewareObj.sendEmail = async ({ message, subject, receiver }, req, res) => {
  let status = {};
  const smtpTransport = await nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: "info.benitatravels@gmail.com",
      clientId:
        "122527083108-gvkneborudehmsfmo0n8miencd9erut9.apps.googleusercontent.com",
      clientSecret: "_f2d9Bzb-evU_nziBamReUpX",
      refreshToken: "1/U9s9uESVN5Qe-8QBTPvoGl3yULVQF2RBhL9ZC7Qdm18"
    }
  });
  let mailOptions = {
    to: receiver,
    from: "info.benitatravels@gmail.com",
    subject: subject,
    text: message
  };
  await smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) {
      status = {
        type: "error",
        info: err
      };
      //console.log('It was here err', status)
    } else {
      status = {
        type: "success",
        info: ínfo
      };
      console.log("It was here", status);
    }
    console.log("dgdhgdhdg", status);
    return status;
  });
};
middlewareObj.isAdmin = function(req, res, next) {
  //  console.log('At this', req.user);
  if (
    req.user.role == "admin" ||
    req.user.role == "receptionist" ||
    req.user.role == "doctor" ||
    req.user.role == "labTech" ||
    req.user.role == "nurse"
  ) {
    return next();
  } else {
    logger.infoLog.info(
      req.user.username +
        " has just tried to access unauthorized Route ::" +
        "\x1b[31m" +
        " Access Denied!" +
        "\x1b[0m"
    );

    req.flash("error", "You are not privilegded to access this route!");
    res.redirect("back");
  }
};
middlewareObj.isMasterAdmin = function(req, res, next) {
  if (req.user.role == "master-admin") {
    return next();
  } else {
    logger.infoLog.info(
      req.user.username +
        " has just tried to access unauthorized route ::" +
        "\x1b[31m" +
        " Access Denied!" +
        "\x1b[0m"
    );

    req.flash("error", "You are not privilegded to access this route!");
    res.redirect("back");
  }
};

middlewareObj.isClient = function(req, res, next) {
  // console.log('Role', req.user.role)

  if (req.user.role == "client") {
    return next();
  } else {
    logger.infoLog.info(
      req.user.username +
        " has just tried to access post-House Route ::" +
        "\x1b[31m" +
        " Access Denied!" +
        "\x1b[0m"
    );

    req.flash("error", "You are not privilegded to access this route!");
    res.redirect("back");
  }
};

middlewareObj.isRealString = function(str) {
  return typeof str === "string" && str.trim().length > 0;
};

middlewareObj.isActive = (req, res, next) => {
  //  console.log(req.body);
  User.findOne(req.body.username, (err, user) => {
    console.log(user);
    if (err) {
      res.redirect("back");
    } else {
      return next();
    }
  });
};

middlewareObj.isInArray = function(value, array) {
  return array.indexOf(value) > -1;
};
middlewareObj.compare = function compare(a, b) {
  if (a.similarity < b.similarity) return 1;
  if (a.similarity > b.similarity) return -1;
  return 0;
};
middlewareObj.stripEndQuotes = function(s) {
  var t = s.length;
  s = s.substring(1, t--);
  s = s.substring(0, t);
  return s;
};
//To check is user is counelor
// middlewareObj.isCounselor = function (req, res, next){
//     if(req.user.role === 'counselor'){
//         return next();
//     }
//     res.redirect("/counselling");
// }
// //To check if user is client
// middlewareObj.isClient = function (req, res, next){
//   if(req.user){
//         if(req.user.role === 'member'){
//         return next();
//     }
//      res.redirect("/user/personal");
//   }
//   else{
//       next();
//   }
// }
//Capitalize first letter
middlewareObj.capitalize = function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
// to check if it is empty
middlewareObj.isEmpty = function(str) {
  return !str || 0 === str.length;
};

//function generate random string
middlewareObj.randomStr = function() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 12; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};
//Delete values from array
middlewareObj.removeA = function(arr) {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L > 1 && arr.length) {
    what = a[--L];
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1);
    }
  }
  return arr;
};
//Delete values from array

//ignore favicon

middlewareObj.createToken = function() {
  crypto.randomBytes(20, (err, buf) => {
    var token = buf.toString("hex");
    return token;
  });
};
//Middlware to determine number of unread messages

module.exports = middlewareObj;
