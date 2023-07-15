//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/UserDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
        email: String,
        password: String  //<-- we are going to encrypt this particular field --> //
});


//only encrypt the passwords in UserDB
userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
        res.render("home");
});
app.get("/login", function (req, res) {
        res.render("login");
});
app.get("/register", function (req, res) {
        res.render("register");
});

app.post("/register", async (req, res) => {
        try {
                const newUser = new User({
                        email: req.body.username,
                        password: req.body.password
                });
                const result = await newUser.save();
                if (result) {
                        res.render('secrets');
                } else {
                        console.log("Login Failed");
                }
        } catch (err) {
                console.log(err);
        }
});
app.post('/login', (req, res) => {

        const username = req.body.username;
        const pass = req.body.password;

        User.findOne({ email: username }).then((foundUser) => {
                if (foundUser) {

                        if (foundUser.password == pass) {
                                res.render('secrets');
                        }
                        else { res.send('wrong password'); }
                }
                else { res.send('user not found'); }
        })
});

app.listen(3000, function () {
        console.log("Server started on port 3000");
});
