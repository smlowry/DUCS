// api/users.js
// This api route creates a user in mySQL database

const jwt = require("jwt-simple");
const User = require("../models/user");
const Conn = require("../mysqldb");
const router = require("express").Router();
const bcrypt = require("bcrypt-nodejs");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto")
const config = require("../configuration/config.json")

const DEBUG = true;

var secret = config.secret;
router.use(bodyParser.json())

//use urlencoded because we are posting form data
//router.use(bodyParser.urlencoded({extended: true}));

// Add a new user to the database
router.post("/users", (req, res)=> {
    
    let qry = "SELECT uid, password, full_name FROM User WHERE uid = ?";

    Conn.query(qry, [req.body.uid], (err, rows) => {

        if(err) throw err;

        //check for duplicate user
        if (rows>0){
            console.log("Duplicate user: " + req.body.username);
            res.status(409).json({error: "Username already exists"});
        }

        //create a hash for the submitted password
        bcrypt.hash(req.body.password, null, null, (err, hash) => {  
            
            var newUser = {

            uid: req.body.username,
            password: hash,
            full_name: req.body.full_name,
            date_created: new Date().toJSON().slice(0, 10),
            admin: 0
        };

        // create the users image storage

        Conn.query("INSERT INTO User SET ?", newUser, (err, result)=> {
            

            console.log("New user inserted as " + newUser);

            
            if (err){
              console.log("Trouble inserting user");
              console.log(err);
              res.status(400).send(err);
            }  

            else {

                let usrDir = crypto.createHash('sha256').update(newUser.uid).digest("hex");
                
                if (DEBUG)
                    console.log("making dir: " + usrDir + " for user " + newUser.uid);
                    
                    let newDir = "public/images/" + usrDir;
                fs.mkdir(newDir, (err) =>{
                    if (err) {
                        if (DEBUG)
                            console.log('new directory not created');
                        return res.status(400).json({error: "Directory for " + newUser.uid + " not created"});
                    }
                    if (DEBUG)
                        console.log("Directory created");
                    //make the thumbnail subdirectory
                    let subdir = newDir + "/thumbs";
                    if (DEBUG)
                        console.log("making thumbs directory")
                    fs.mkdir(subdir, (err)=> {
                        if(err) {
                            if (DEBUG)
                                console.log("thumbs subdirectory not created");
                            return res.status(400).json({error: "thumbs subdirectory not created"});
                        }
                        else {

                            console.log("User successfully saved");
                            console.log("uid: " + newUser.uid);
                            var token = jwt.encode({uid: newUser.uid}, secret);
                                return res.json({
                                    
                                    token: token
                                })
                            }
                        });
                    });
                }
            });
        });
    }); 
});

module.exports = router;
