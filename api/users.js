// api/users.js
var jwt = require("jwt-simple");
var User = require("../models/user");
var router = require("express").Router();
var bcrypt = require("bcrypt-nodejs");
var bodyParser = require("body-parser")

//router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

// For encoding/decoding JWT
// TO DO: figure out how to hide this!!!
// change secret key to this - qs3h6z0JUN9wgTy1j2Cl54gB6yzG
var secret = "supersecret";

router.get("/", function(req, res){
    User.find(function(err, users){
        if(err){
            res.status(400).send(err);
        }
        else{
            res.json(users);
        }
    });
});

// Add a new user to the database
router.post("/users", function(req, res, next) {
    
    //create a hash for the submitted password
    bcrypt.hash(req.body.password, null, null, function(err, hash) {
    
    var newuser = new User({
      uid: req.body.uid,
      password: hash,
      full_name: req.body.full_name,
      date_created: new Date()
//      status:   req.body.status
   });

 newuser.save(function(err) {
         if (err) return next(err);
         res.sendStatus(201);  // Created
      });
    });
});

// Sends a token when given valid username/password
router.post("/auth", function(req, res) {

// Get user from the database
   User.findOne({ uid: req.body.uid }, function(err, user) {
      if (err) throw err;

      if (!user) {
         // Username not in the database
         res.status(401).json({ error: "Bad username"});
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
               res.status(401).json({ error: "Bad password"});
            }
         });
      }
   });
});

//I'm not going to use the status 

//// Gets the status of all users when given a valid token
//router.get("/status", function(req, res) {
//
//   // See if the X-Auth header is set
//   if (!req.headers["x-auth"]) {
//      return res.status(401).json({error: "Missing X-Auth header"});
//   }
//
//   // X-Auth should contain the token 
//   var token = req.headers["x-auth"];
//   try {
//      var decoded = jwt.decode(token, secret);
//
//      // Send back all username and status fields
//      User.find({}, "username status", function(err, users) {
//         res.json(users);
//      });
//   }
//   catch (ex) {
//      res.status(401).json({ error: "Invalid JWT" });
//   }
//});

module.exports = router;