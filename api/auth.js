// api/auth.js
var jwt = require("jwt-simple");
var User = require("../models/user");
var router = require("express").Router();
var bcrypt = require("bcrypt-nodejs");
var bodyParser = require("body-parser")
//for encoding/decoding JWT
var config = require("../configuration/config.json")

//router.use(bodyParser.json());
//use urlencoded instead because we are posting form data
router.use(bodyParser.urlencoded({extended: true}));



// For encoding/decoding JWT
var secret = config.secret;

// Sends a token when given valid username/password
router.post("/auth", function(req, res) {

// Get user from the database
   User.findOne({ uid: req.body.uid }, function(err, user) {
      if (err) throw err;
       
      if (!user) {
         // Username not in the database
         res.status(401).json({ error: "Invalid username/password"});
      }
      else {
         // Does given password hash match the database password hash?
         bcrypt.compare(req.body.password, user.password, 
                        function(err, valid) {
            if (err) {
               res.status(400).json({ error: err});
            }
            else if (valid) {
               // Send back a token that contains the user's username
               var token = jwt.encode({ uid: user.uid }, secret);
               res.json({ token: token });
            }
            else {
               res.status(401).json({ error: "Invalid username/password"});
            }
         });
      }
   });
});



module.exports = router;