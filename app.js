//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});
// encrypt password regardless of any other options. username and _id will be left unencrypted.

console.log(process.env.API_KEY);
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("home");
});

app.route("/login")
  .get((req, res) => {
    res.render("login");
  })

  .post(async (req, res) => {
    try {
      const email = req.body.username,
        password = req.body.password;
      const foundUser = await User.findOne({ email });

      if (foundUser) {
        if (foundUser.password === password)
          res.render("secrets");
        else
          console.log("Please check your password!");
      }
      else console.log("Please check your email!");
    }
    catch (error) {
      console.log(`Read Error: ${error}`);
    }
  });

app.route("/register")
  .get((req, res) => {
    res.render("register");
  })

  .post((req, res) => {
    try {
      const newUser = User({
        email: req.body.username,
        password: req.body.password
      });
      newUser.save().then(() => res.render("secrets"));
    }
    catch (error) {
      console.log(`Create Error: ${error}`);
    }
  });

app.listen(3000, () => {
  console.log("Server started on port 3000!");
});