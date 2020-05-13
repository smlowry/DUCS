// api/auth.js
// This page authenticates a user using mySQL so that they can login to their account.

const jwt = require("jwt-simple");
const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt-nodejs");
const bodyParser = require("body-parser")
const Conn = require("../mysqldb");

var config = require("../configuration/config.json") //for encoding/decoding JWT

router.use(bodyParser.urlencoded({extended: true}));

var secret = config.secret;

const DEBUG = false;
   
   //user authetication route
   router.post("/auth", (req,res)=>{

      //check if user is in mySQL database
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
            //compare passwords; if valid return token and full_name
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