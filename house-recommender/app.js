const express = require('express');
const mongoose = require("mongoose");
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");
const multer = require('multer');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const moment = require("moment");
const logger = require('./logger/logger')
const passportSocketIo = require("passport.socketio");
//env port
const port = process.env.PORT || 3050;
const cloudinary = require('cloudinary');
const joi = require("joi");
const socket = require("socket.io")
//models
const User = require("./models/user");
const House = require("./models/house");
const Comment = require("./models/comments");
const Rating = require("./models/rating");
//const Comment             =require("./models/comments");
//other routes
const middleware = require("./middleware");

var passport = require("passport");
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);
//io file
const ioFile = require('./socket.io/socket.io')(io);
var indexRoutes = require("./routes/index");
var authRoutes = require("./routes/auth");
var reviewRoutes = require("./routes/reviews");
var conversationRoutes = require("./routes/conversation");
var reccomendRoutes = require("./routes/recommend");

var socketUsers = require('socket.io.users');
// Make io accessible to our router
app.use(function (req, res, next) {
  req.io = io;
  next();
});
var rootUsers = socketUsers.Users;
// io.on('connection',(socket)=>{
//   console.log(rootUsers)
// })
mongoose.set('useCreateIndex', true)
mongoose.connect("mongodb://ken:ken1234@ds117545.mlab.com:17545/housing-app", { useNewUrlParser: true });

useMongoClient: true

const publicPath = path.join(__dirname, './public');
//logger.infoLog.info('Logs should work');
//logger.errorLog.error('Errors should log');

app.use(require("express-session")({
  secret: "The housing app",
  resave: false,
  resave: false,
  rolling: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000,

  },
  store: new MongoStore({ url: "mongodb://ken:ken1234@ds117545.mlab.com:17545/housing-app" })

}));
//for displaying error
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});



//Passport socket io configuration
io.use(passportSocketIo.authorize({
  cookieParser: require('cookie-parser'),       // the same middleware you registrer in express
  key: 'express.sid',       // the name of the cookie where express/connect stores its session_id
  secret: 'house-recommender',    // the session_secret to parse the cookie
  store: new MongoStore({ url: "mongodb://ken:ken1234@ds117545.mlab.com:17545/housing-app" }),        // we NEED to use a sessionstore. no memorystore please
  success: onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail: onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');
  accept();
}
function onAuthorizeFail(data, message, error, accept) {
  if (error)
    // console.log(message);
    console.log('failed connection to socket.io:', message);
  // We use this callback to log all of our failed connections.
  accept(null, false);
}


app.use(express.static(publicPath));
/*configure app to use body-parser*/
app.set('views', __dirname + '/views');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

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
  var currentDate = yy + '-' + mm + '-' + dd;
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
  res.locals.version = 0.01


  next();
});


//Use routes exported from other files

app.use(indexRoutes);
app.use(authRoutes);
app.use(reviewRoutes);
app.use(conversationRoutes);
app.use(reccomendRoutes)
app.all('*', (req, res) => {
  res.redirect("/index");
});
server.listen(port, () => {
  console.log(`Benita rUnNiNg On PoRt ${port} `);
});
