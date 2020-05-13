// api/auth.js

const jwt = require("jwt-simple");
const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt-nodejs");
const bodyParser = require("body-parser")
const Conn = require("../mysqldb");

var config = require("../configuration/config.json") //for encoding/decoding JWT

//router.use(bodyParser.json()); //use urlencoded instead because we are posting form data

router.use(bodyParser.urlencoded({extended: true}));

var secret = config.secret;

const DEBUG = false;


//Sprint 3 Code

//Sends a token when given valid username/password
// router.post("/auth", (req, res)=> {
    
// Get user from the database
   // User.findOne({ uid: req.body.username }, (err, user)=> {
   //    // console.log(user.full_name);
   //    if (err)
   //        return res.status(500).json({error: "Server Error. Try later."});
       
   //    if (!user) {
   //       // Username not in the database
   //       res.status(401).json({ error: "Invalid username/password"});
   //    }
   //    else {
   //       // Does given password hash match the database password hash?
         
   //       bcrypt.compare(req.body.password, user.password, 
   //                      (err, valid)=> {
   //          if (err) {
   //             res.status(400).json({ error: err});
   //          }
   //          else if (valid) {
   //             // Send back a token that contains the user's username
   //             let token = jwt.encode({ uid: user.uid }, secret);
   //             res.json({ token: token, full_name: user.full_name });
   //             //res.redirect('upload.html')
   //          }
   //          else {
   //             res.status(401).json({ error: "Invalid username/password"});
   //          }
   //       });
   //    }
   // });

   
   //user authetication route
   router.post("/auth", (req,res)=>{

      console.log("Username: " + req.body.username);
      console.log("Password: " + req.body.password);

      //check if user is in database
      let qry = "select uid, password, full_name from User where uid = ?;";
      if (DEBUG)
         console.log("query: " + qry);
      Conn.query(qry,[req.body.username], (err, rows) => {
         
         if (err) return res.status(500).json({error: err});

         if (DEBUG)
            console.log("rows returned: " + rows.length);

         if (rows.length == 0) {
            console.log("User found " + rows[0]);
         }
         else {
            bcrypt.compare(req.body.password, rows[0].password, (err, valid)=>{
                  if (err) {
                     res.status(400).json({ error: err});
                  }
                  else if (valid) {
                     let commaPos = rows[0].full_name.indexOf(',');
                     let full_name = rows[0].full_name.substring(commaPos+1);
                     let token = jwt.encode({uid: rows[0].uid}, secret);
                     res.json({token: token, full_name: full_name});
                  }
            })
         }
      })
   });



module.exports = router;