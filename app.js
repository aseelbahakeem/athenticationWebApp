const dotenv = require('dotenv').config({
  path: __dirname + '/.env'
});
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const port = 3000;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const saltRounds = 10;
const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "our little secret.",
  resave: false,
  saveUninitialized: false
}));
//using passport package to initialize and uses session package
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/PassportSessionDB")

const userSchema = new mongoose.Schema( {
  email: String,
  password: String
});

//DBschema uses the plugin for passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

// here DB-model create strategy to serialize and deserialise 
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get("/", function(req,res){
  res.render("home");
})
app.route("/login")

.get(function(req,res){
  res.render("login");
})
.post((req,res) => {
      const newUser = new User ({
          username: req.body.username,
          password: req.body.password
      })
      try{
      req.login(newUser,(err)=> {
        //if there is errors
          if(err){
              console.log(err)
         //if there is no error, login is successful

          }else {
              passport.authenticate("local")(req,res,function(){
                  res.redirect("/secrets");
              })
          }
      })
  }catch(err){
      console.log(err);
  }
});

/** even if they just go directly to the secret page, they should automatically be able to view it if they
are in fact still logged in. So that's why we need to create our secrets route. */
app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect('/login');
  }
});


app.get("/submit",(req,res)=>{
  res.render("submit");
})

//when user click on logut, end session
app.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.route("/register")
.get(function(req,res){
  res.render("register");
})

.post(async function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  User.register({ username: username }, password).then(() => {
    const authenticate = passport.authenticate("local");
    //athentication successful
    authenticate(req, res, () => {
      res.redirect('/secrets');
    });
     //athentication failed
  }).catch(err => {
    console.log(err);
    res.redirect("/register");
  });
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});