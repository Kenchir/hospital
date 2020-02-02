const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");

const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");
const multer = require("multer");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const moment = require("moment");
const logger = require("./logger/logger");

//env port
const port = process.env.PORT || 8080;
const cloudinary = require("cloudinary");
const joi = require("joi");

//models
const User = require("./models/user");
const Package = require("./models/Package");

const Bookinf = require("./models/booking");
//const Comment             =require("./models/comments");
//other routes
const middleware = require("./middleware");

var passport = require("passport");
var app = express();
var server = require("http").createServer(app);

var indexRoutes = require("./routes/index");
var authRoutes = require("./routes/auth");

mongoose.set("useCreateIndex", true);
mongoose.connect(
  "mongodb://localhost:27017/Hospital", { useNewUrlParser: true }
);

useMongoClient: true;
useMongoClient: true;
const publicPath = path.join(__dirname, "/public");

app.use(
  require("express-session")({
    secret: "Benita",
    resave: false,
    resave: false,
    rolling: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 60 * 1000
    },
    store: new MongoStore({ url: "mongodb://localhost:27017/Hospital" })
  })
);
//for displaying error
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(express.static(publicPath));

/*configure app to use body-parser*/
app.use(express.static(__dirname));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  //variables put in local
  //res.locals.currentUser = req.user;
  //log visit if user is logged in
  // if(req.user&&(req.originalUrl!="/favicon.ico")&&(req.originalUrl!="/app/js/lib/deparam.js")){

  //     logger.infoLog.info(middleware.capitalize(req.user.username ) +" has visited " + req.originalUrl + " at" );
  // }
  var today = new Date();
  var dd = today.getDate();
  var yy = today.getFullYear();
  var mm = today.getMonth() + 1;
  var currentDate = yy + "-" + mm + "-" + dd;
  res.locals.currentDate = currentDate;
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.house_errors = req.flash("house_errors");
  res.locals.success = req.flash("success");
  res.locals.route = req.originalUrl;
  res.locals.moment = moment;
  res.locals.isInArray = middleware.isInArray;
  res.locals.capitalize = middleware.capitalize;
  res.locals.stripEndQuotes = middleware.stripEndQuotes;
  res.locals.version = 0.01;

  next();
});

//Use routes exported from other files

app.use(indexRoutes);
app.use(authRoutes);

app.all("*", (req, res) => {
  res.redirect("/login");
});
server.listen(port, () => {
  console.log(`Benita-Travels iS rUnNiNg On PoRt ${port} `);
});
