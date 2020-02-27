// api/users.js
var jwt = require("jwt-simple");
var User = require("../models/user");
var router = require("express").Router();
var bcrypt = require("bcrypt-nodejs");
var bodyParser = require("body-parser");

//router.use(bodyParser.json());
//use urlencoded instead because we are posting form data
router.use(bodyParser.urlencoded({extended: true}));

// Add a new user to the database
router.post("/users", function(req, res, next) {
    
    //create a hash for the submitted password
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
    
    var newuser = new User({
      uid: req.body.uid,
      password: hash,
      full_name: req.body.full_name,
      date_created: new Date()
   });

 newuser.save(function(err) {
         if (err) return next(err);
         res.sendStatus(201);  // Created
      });
    });
});

module.exports = router;